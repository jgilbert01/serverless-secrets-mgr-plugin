'use strict';

const AWS = require('aws-sdk');

class Plugin {
  constructor(serverless, options) {
    this.hooks = {
      'after:deploy:deploy': putSecrets.bind(null, serverless, options)
    };
  }
}

module.exports = Plugin;

const putSecrets = (serverless, options) => {
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
    .filter((vn) => process.env[vn] === undefined)
    .reduce((a, vn) => ({
      [vn]: process.env[vn],
      ...a,
    }), {});

  return serverless.getProvider('aws').request('SecretsManager', 'putSecretValue', {
    SecretId: config.secretId,
    SecretString: Buffer.from(JSON.stringify(secrets)).toString('base64'),
  })
    .then((data) => console.log('putSecretValue: %j', data));
};
