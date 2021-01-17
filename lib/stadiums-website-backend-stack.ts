import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { PolicyStatement, Effect } from '@aws-cdk/aws-iam';
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
      partitionKey: { name: 'teamId', type: AttributeType.STRING }
    });

    const getMapDataLambda = new Function(this, 'GetMapDataLambda', {
      runtime: Runtime.NODEJS_12_X,
      code: Code.asset('resources'),
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
