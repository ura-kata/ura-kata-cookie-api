import { LambdaIntegration } from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import { UraKataCookieApiARecord } from './UraKataCookieApiARecord';
import { UraKataCookieApiCustomDomainName } from './UraKataCookieApiCustomDomainName';
import { UraKataCookieApiFunction } from './UraKataCookieApiFunction';
import { UraKataCookieApiRestApi } from './UraKataCookieApiRestApi';
import { HostedZone } from '@aws-cdk/aws-route53';
import * as dotenv from 'dotenv';
import { Certificate } from '@aws-cdk/aws-certificatemanager';

dotenv.config();

export class UraKataCookieApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const zoneName = process.env.URA_KATA_COOKIE_API_DOMAIN_NAME as string;
    const domainName = `${process.env.URA_KATA_COOKIE_API_HOST_NAME}.${process.env.URA_KATA_COOKIE_API_DOMAIN_NAME}`;
    const certificateArn = process.env.URA_KATA_CERTIFICATE_ARN as string;
    const publicHostedZoneId = process.env
      .URA_KATA_PUBLIC_HOSTED_ZONE_ID as string;

    const hostZone = HostedZone.fromHostedZoneAttributes(
      this,
      'UraKataPublicHostedZone',
      {
        hostedZoneId: publicHostedZoneId,
        zoneName: zoneName,
      }
    );

    const certificate = Certificate.fromCertificateArn(
      this,
      'UraKataCertificate',
      certificateArn
    );

    const customDomainName = new UraKataCookieApiCustomDomainName(
      this,
      'UraKataCookieApiCustomDomainName',
      domainName,
      certificate
    );

    new UraKataCookieApiARecord(
      this,
      'UraKataCookieApiARecord',
      customDomainName,
      hostZone,
      domainName
    );

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
