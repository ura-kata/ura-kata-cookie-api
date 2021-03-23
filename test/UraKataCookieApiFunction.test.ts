import { Stack } from '@aws-cdk/core';
import { UraKataCookieApiFunction } from '../lib/UraKataCookieApiFunction';
import * as path from 'path';
import { SynthUtils } from '@aws-cdk/assert';

test('ura-kata-cookie-api-function creates', () => {
  const stack = new Stack();
  new UraKataCookieApiFunction(
    stack,
    'func',
    path.join(__dirname, '../lib/handler.ts'),
    'func-name'
  );
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
