import * as cdk from '@aws-cdk/core';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';

export class StadiumsWebsiteBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.createResources();
  }

  private createResources() {
    new Table(this, 'StadiumsMapTable', {
      tableName: 'StadiumsMapTable',
      partitionKey: { name: 'teamId', type: AttributeType.STRING }
    });
  }
}
