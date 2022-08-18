const AWS = require('aws-sdk-mock');
const sinon = require('sinon');
const lambdaHandler = require('../../resources/getMapDataLambda').handler;
const tableName = 'TestTable';

describe('getMapDataLambda', () => {
  let scanStub;

  beforeEach(() => {
    process.env.TABLE_NAME = tableName;
    AWS.mock('DynamoDB', 'scan', (params, callback) => {
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
    AWS.restore('DynamoDB', 'scan');
  });

  test.todo('should return 400 if HTTP method is not GET');

  const team1Ddb = {
    stadiumId: { S: 'Mackey' },
    tenantId: { S: 'Purdue' },
    teamName: { S: 'Purdue' },
    league: { S: 'NCAAM' },
    conference: { S: 'B1G' },
    division: { S: 'West' },
    city: { S: 'West Lafayette' },
    state: { S: 'IN' },
    country: { S: 'USA' },
    stadiumName: { S: 'Mackey Arena' },
    nonCorporateName: { S: 'Mackey Arena' },
    shortName: { S: 'Mackey' },
    formerNames: { L: [{
      M: {
        name: { S: 'Former Name' },
        years: { L: [{ M: {
          start: { N: 1900 },
          end: { N: 1901 }
        }}]}
      }
    }]},
    surface: { S: 'Hardwood' },
    roof: { S: 'Arena' },
    constructionCost: { N: 1000000 },
    renovations: { L: [{ M: {
      cost: { N: 1000000 },
      years: { M: {
        start: { N: 1950 },
        end: { N: 1951 }
      }}
    }}]},
    capacity: { N: 14846 },
    artificialCapacity: { N: 15000 },
    openingDate: { N: 1968 },
    firstUsedDate: { N: 1968 },
    active: { BOOL: true },
    activeForTeam: { BOOL: true },
    visited: { BOOL: true },
    visits: { N: 48 },
    logoUrl: { S: 'logoUrl' },
    markerSize: { M: {
      x: { N: 30 },
      y: { N: 30 }
    }},
    position: { M: {
      lat: { N: 100.100 },
      lng: { N: 100.100 }
    }},
    imageWithFans: { S: 'imageWithFans' },
    imageEmpty: { S: 'imageEmpty' },
    imageAerial: { S: 'imageAerial' },
    imageFacade: { S: 'imageFacade' },
    primaryFieldImage: { S: 'imageWithFans' },
    primaryPerspectiveImage: { S: 'imageAerial' }
  };

  const team1Translated = {
    stadiumId: 'Mackey',
    tenantId: 'Purdue',
    teamName: 'Purdue',
    league: 'NCAAM',
    conference: 'B1G',
    division: 'West',
    city: 'West Lafayette',
    state: 'IN',
    country: 'USA',
    stadiumName: 'Mackey Arena',
    nonCorporateName: 'Mackey Arena',
    shortName: 'Mackey',
    formerNames: [{
      name: 'Former Name',
      years: [{
        start: 1900,
        end: 1901
      }]
    }],
    surface: 'Hardwood',
    roof: 'Arena',
    constructionCost: 1000000,
    renovations: [{
      cost: 1000000,
      years: {
        start: 1950,
        end: 1951
      }
    }],
    capacity: 14846,
    artificialCapacity: 15000,
    openingDate: 1968,
    firstUsedDate: 1968,
    active: true,
    activeForTeam: true,
    visited: true,
    visits: 48,
    logoUrl: 'logoUrl',
    markerSize: {
      x: 30,
      y: 30
    },
    position: {
      lat: 100.100,
      lng: 100.100
    },
    imageWithFans: 'imageWithFans',
    imageEmpty: 'imageEmpty',
    imageAerial: 'imageAerial',
    imageFacade: 'imageFacade',
    primaryFieldImage: 'imageWithFans',
    primaryPerspectiveImage: 'imageAerial'
  };

  test('should scan DDB and return results if method is GET', async () => {
    scanStub.returns({ Items: [ team1Ddb ] });

    const result = await lambdaHandler();
    expect(result).toEqual({
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        mapData: [ team1Translated ]
      })
    });
  });

  test('should scan multiple times if not all items are returned in first scan', async () => {
    scanStub.onFirstCall().returns({
      Items: [ team1Ddb ],
      LastEvaluatedKey: 'exists'
    }).onSecondCall().returns({
      Items: [ team1Ddb ]
    });

    expect(await lambdaHandler()).toEqual({
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        mapData: [ team1Translated, team1Translated ]
      })
    });
  });

  test('should return 500 if DDB scan failed', async () => {
    const errorMessage = 'failed to call ddb';
    scanStub.throws(new Error(errorMessage));

    const result = await lambdaHandler();
    expect(result).toEqual({
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: errorMessage
    });
  });
});
