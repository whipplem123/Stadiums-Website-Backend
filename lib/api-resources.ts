import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

export interface ApiResourcesProps {
    getMapDataLambda: Function;
}

export class ApiResources extends Construct {
  private getMapDataLambda: Function;

  constructor(scope: Construct, id: string, props: ApiResourcesProps) {
    super(scope, id);
    this.getMapDataLambda = props.getMapDataLambda;
    this.createResources();
  }

  private createResources() {
    const api = new RestApi(this, 'StadiumsApi', {
      restApiName: 'StadiumsApi',
      description: 'API for retrieving stadiums data',
      deploy: true
    });

    const stadiumsResource = api.root.addResource('stadiums');
    const mapResource = stadiumsResource.addResource('map');
    mapResource.addMethod('GET', new LambdaIntegration(this.getMapDataLambda));
  }
}
