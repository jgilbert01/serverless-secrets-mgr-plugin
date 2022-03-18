# serverless-secrets-mgr-plugin

Serverless plugin to copy secrets from a CI/CD pipeline environment to AWS Secrets Manager.

All the secrets are stored together, so that they can be accessed with a single API calls.
The environment variables are grouped into a JSON object and base64 encoded.

## serverless.yml

> Optional settings are commented out

```
plugins:
  - serverless-secrets-mgr-plugin

custom:
  secrets:
    # secretId: ${self:service}/${opt:stage}
    # afterDeployOnly: true
    variableNames: 
      - ENV_VAR_1
      - ENV_VAR_2

resources:
  Resources:
    Secrets:
      Type: AWS::SecretsManager::Secret
      Properties: 
        Name: ${self:service}/${opt:stage}
```
