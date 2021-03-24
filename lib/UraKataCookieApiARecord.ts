import { ARecord, RecordTarget, IHostedZone } from '@aws-cdk/aws-route53';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayDomain } from '@aws-cdk/aws-route53-targets';
import { UraKataCookieApiCustomDomainName } from './UraKataCookieApiCustomDomainName';

export class UraKataCookieApiARecord extends ARecord {
  constructor(
    scope: Construct,
    id: string,
    customDomainName: UraKataCookieApiCustomDomainName,
    hostedZone: IHostedZone,
    recordName: string
  ) {
    super(scope, id, {
      target: RecordTarget.fromAlias(new ApiGatewayDomain(customDomainName)),
      recordName: recordName,
      zone: hostedZone,
    });
  }
}
