#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { UraKataCookieApiStack } from '../lib/UraKataCookieApiStack';

const app = new cdk.App();
new UraKataCookieApiStack(app, 'UraKataCookieApiStack', {
  stackName: 'ura-kata-cookie-api-stack',
  env: {
    region: 'ap-northeast-1',
  },
});
