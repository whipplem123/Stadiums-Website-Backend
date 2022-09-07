import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import { StadiumsWebsiteBackendStack } from '../lib/stadiums-website-backend-stack';

describe('CDK tests', () => {
  let app: App;
  let stack: StadiumsWebsiteBackendStack;
  let template: Template;

  beforeAll(() => {
    app = new App();
    stack = new StadiumsWebsiteBackendStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('should create DDB table', () => {
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
  });

  describe('GetMapDataLambda', () => {
    test('should create lambda', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Handler: 'getMapDataLambda.handler'
      });
    });

    test('should have permission to scan StadiumsMapTable', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
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
      });
    });
  });

  describe('API Resources', () => {
    test('should create API', () => {
      template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'StadiumsApi'
      });
    });
  });
});
