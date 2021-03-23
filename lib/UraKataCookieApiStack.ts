import { LambdaIntegration } from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import { UraKataCookieApiFunction } from './UraKataCookieApiFunction';
import { UraKataCookieApiRestApi } from './UraKataCookieApiRestApi';

export class UraKataCookieApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunction = new UraKataCookieApiFunction(
      this,
      'UraKataCookieApiLambda',
      path.join(__dirname, '../lib/handler.ts'),
      'ura-kata-cookie-api'
    );

    const restApi = new UraKataCookieApiRestApi(
      this,
      'UraKataCookieApiRestApiGateway',
      'ura-kata-cookie-api'
    );

    const integration = new LambdaIntegration(lambdaFunction);

    const setResouse = restApi.root.addResource('set');
    const resetResouse = restApi.root.addResource('reset');

    setResouse.addMethod('POST', integration);
    resetResouse.addMethod('POST', integration);
  }
}
