import { RestApi } from '@aws-cdk/aws-apigateway';
import { Construct } from '@aws-cdk/core';

export class UraKataCookieApiRestApi extends RestApi {
  constructor(
    scope: Construct,
    id: string,
    apiName: string,
    stageName: string
  ) {
    super(scope, id, {
      restApiName: apiName,
      deployOptions: {
        stageName: stageName,
      },
    });
  }
}
