import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { ApiResources } from './api-resources';

export class StadiumsWebsiteBackendStack extends Stack {
  public stadiumsMapTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.createResources();
  }

  private createResources() {
    this.stadiumsMapTable = new Table(this, 'StadiumsMapTable', {
      tableName: 'StadiumsMapTable',
      partitionKey: { name: 'stadiumId', type: AttributeType.STRING },
      sortKey: { name: 'tenantId', type: AttributeType.STRING }
    });

    const getMapDataLambda = new Function(this, 'GetMapDataLambda', {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset('resources'),
      handler: 'getMapDataLambda.handler',
      environment: {
        TABLE_NAME: this.stadiumsMapTable.tableName
      }
    });

    getMapDataLambda.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:Scan'],
      resources: [this.stadiumsMapTable.tableArn]
    }));

    new ApiResources(this, 'StadiumsApiResources', {
      getMapDataLambda
    });
  }
}
