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

  const team1 = {
    teamId: 'testTeam',
    league: 'testLeague',
    conference: 'testConference',
    markerSize: {
      x: 1,
      y: 2,
    },
    position: {
      lat: 3,
      lng: 4,
    },
    visited: true
  };
  const team2 = {
    teamId: 'testTeam2',
    league: 'testLeague2',
    conference: 'testConference2',
    markerSize: {
      x: 5,
      y: 6,
    },
    position: {
      lat: 7,
      lng: 8,
    },
    visited: false
  };

  const getDdbFromTeamData = (team) => ({
    teamId: { S: team.teamId },
    league: { S: team.league },
    conference: { S: team.conference },
    markerSize: { M: {
      x: { N: team.markerSize.x },
      y: { N: team.markerSize.y }
    }},
    position: { M: {
      lat: { N: team.position.lat },
      lng: { N: team.position.lng }
    }},
    visited: { B: team.visited }
  });

  test('should scan DDB and return results if method is GET', async () => {
    scanStub.returns({ Items: [ getDdbFromTeamData(team1) ] });

    const result = await lambdaHandler();
    expect(result).toEqual({
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        mapData: [ team1 ]
      })
    });
  });

  test('should scan multiple times if not all items are returned in first scan', async () => {
    scanStub.onFirstCall().returns({
      Items: [ getDdbFromTeamData(team1) ],
      LastEvaluatedKey: 'exists'
    }).onSecondCall().returns({
      Items: [ getDdbFromTeamData(team2) ]
    });

    expect(await lambdaHandler()).toEqual({
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        mapData: [ team1, team2 ]
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
