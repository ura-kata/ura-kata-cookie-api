import { RestApi } from '@aws-cdk/aws-apigateway';
import { Construct } from '@aws-cdk/core';

export class UraKataCookieApiRestApi extends RestApi {
  constructor(scope: Construct, id: string, apiName: string) {
    super(scope, id, {
      restApiName: apiName,
    });
  }
}
