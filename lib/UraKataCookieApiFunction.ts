import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { Runtime } from '@aws-cdk/aws-lambda';

export class UraKataCookieApiFunction extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    functionEntry: string,
    functionName: string,
    environment?: { [key: string]: string }
  ) {
    super(scope, id, {
      entry: functionEntry,
      functionName: functionName,
      runtime: Runtime.NODEJS_14_X,
      environment: environment,
    });
  }
}
