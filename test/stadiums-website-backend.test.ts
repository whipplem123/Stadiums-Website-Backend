import { expect, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as StadiumsWebsiteBackend from '../lib/stadiums-website-backend-stack';

describe('CDK tests', () => {
  let app: cdk.App;
  let stack: StadiumsWebsiteBackend.StadiumsWebsiteBackendStack;

  beforeAll(() => {
    app = new cdk.App();
    stack = new StadiumsWebsiteBackend.StadiumsWebsiteBackendStack(app, 'TestStack');
  });

  test('should create DDB table', () => {
    expect(stack).to(haveResource('AWS::DynamoDB::Table'));
  });
});
