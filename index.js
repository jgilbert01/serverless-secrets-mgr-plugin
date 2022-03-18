'use strict';

const AWS = require('aws-sdk');

let updated = false;

class Plugin {
  constructor(serverless, options) {
    if (serverless.service.custom.secrets.afterDeployOnly) {
      this.hooks = {
        'after:deploy:deploy': putSecrets.bind(null, serverless, options)
      };
    } else {
      this.hooks = {
        'before:deploy:deploy': putSecrets.bind(null, serverless, options),
        'after:deploy:deploy': putSecrets.bind(null, serverless, options)
      };
    }
  }
}

module.exports = Plugin;

const putSecrets = (serverless, options) => {
  if (updated) return;

  const config = {
    secretId: `${serverless.service.service}/${options.stage}`,
    ...serverless.service.custom.secrets,
  };

  if (
    config.variableNames === undefined ||
    config.variableNames.length === 0
  ) {
    console.log('serverless-secrets-mgr-plugin: variableNames not defined. Skipping secrets upload.');
    return;
  }

  const secrets = config.variableNames
    .filter((vn) => {
      if (process.env[vn] === undefined) {
        console.log('serverless-secrets-mgr-plugin: missing variable: ', vn);
        return false;
      } else {
        return true;
      }
    })
    .reduce((a, vn) => ({
      [vn]: process.env[vn],
      ...a,
    }), {});

  return serverless.getProvider('aws').request('SecretsManager', 'listSecrets', {})
    .then((data) => {
      // console.log(data);
      const found = data.SecretList.find((e) => e.Name === config.secretId);

      if (found) {
        return serverless.getProvider('aws').request('SecretsManager', 'putSecretValue', {
          SecretId: config.secretId,
          SecretString: Buffer.from(JSON.stringify(secrets)).toString('base64'),
        })
          .then((data) => {
            updated = true;
            console.log('putSecretValue: %j', data);
          });
      }
    });
};
