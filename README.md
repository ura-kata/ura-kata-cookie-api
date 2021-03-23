# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## 初めてのデプロイ

```bash
yarn cdk bootstrap
yarn deploy
```

## API Gateway の Custom Domain の設定

### 参考

- [API Gatewayにカスタムドメインを設定するためのリソースを全てAWS CDKでつくってみた | DevelopersIO](https://dev.classmethod.jp/articles/aws-cdk-all-resources-for-api-gateway/)
