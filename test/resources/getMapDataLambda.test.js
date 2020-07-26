const AWS = require('aws-sdk-mock');
const sinon = require('sinon');
const lambdaHandler = require('../../resources/getMapDataLambda').handler;
const tableName = 'TestTable';

describe('getMapDataLambda', () => {
  let scanStub;

  beforeEach(() => {
    process.env.TABLE_NAME = tableName;
    AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
      try {
        callback(null, scanStub(params));
      } catch (error) {
        callback(error, null);
      }
    });
    scanStub = sinon.stub();
  });

  afterEach(() => {
    delete process.env.TABLE_NAME;
    AWS.restore('DynamoDB.DocumentClient', 'scan');
  });

  test.todo('should return 400 if HTTP method is not GET');

  test('should scan DDB and return results if method is GET', async () => {
    const data = ['item1', 'item2'];
    scanStub.returns({ Items: data });

    const result = await lambdaHandler();
    expect(result).toEqual({
      statusCode: 200,
      headers: {},
      body: JSON.stringify({
        mapData: data
      })
    });
  });

  test('should scan multiple times if not all items are returned in first scan', async () => {
    const firstScanData = ['item1', 'item2'];
    const secondScanData = ['item3', 'item4'];
    scanStub.onFirstCall().returns({
      Items: firstScanData,
      LastEvaluatedKey: 'item2'
    }).onSecondCall().returns({
      Items: secondScanData
    });

    expect(await lambdaHandler()).toEqual({
      statusCode: 200,
      headers: {},
      body: JSON.stringify({
        mapData: firstScanData.concat(secondScanData)
      })
    });
  });

  test('should return 500 if DDB scan failed', async () => {
    const errorMessage = 'failed to call ddb';
    scanStub.throws(new Error(errorMessage));

    const result = await lambdaHandler();
    expect(result).toEqual({
      statusCode: 500,
      headers: {},
      body: errorMessage
    });
  });
});
