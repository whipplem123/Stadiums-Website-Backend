import { expect, haveResource } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { StadiumsWebsiteBackendStack } from '../lib/stadiums-website-backend-stack';

describe('CDK tests', () => {
  let app: App;
  let stack: StadiumsWebsiteBackendStack;

  beforeAll(() => {
    app = new App();
    stack = new StadiumsWebsiteBackendStack(app, 'TestStack');
  });

  test('should create DDB table', () => {
    expect(stack).to(haveResource('AWS::DynamoDB::Table'));
  });

  describe('GetMapDataLambda', () => {
    test('should create lambda', () => {
      expect(stack).to(haveResource('AWS::Lambda::Function', {
        Handler: 'getMapDataLambda.handler'
      }));
    });

    test('should have permission to scan StadiumsMapTable', () => {
      expect(stack).to(haveResource('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'dynamodb:Scan',
              Effect: 'Allow',
              Resource: stack.resolve(stack.stadiumsMapTable.tableArn)
            }
          ],
          Version: '2012-10-17'
        }
      }));
    });
  });

  describe('API Resources', () => {
    test('should create API', () => {
      expect(stack).to(haveResource('AWS::ApiGateway::RestApi', {
        Name: 'StadiumsApi'
      }));
    });
  });
});
