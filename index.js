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

  const secrets = config.variableNames.reduce((a, vn) => ({
    [vn]: process.env[vn],
    ...a,
  }), {});

  return serverless.getProvider('aws').request('SecretsManager', 'putSecretValue', {
    SecretId: config.secretId,
    SecretString: Buffer.from(JSON.stringify(secrets)).toString('base64'),
  })
    .then((data) => console.log('putSecretValue: %j', data));

};
