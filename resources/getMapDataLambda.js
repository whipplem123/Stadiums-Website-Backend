const AWS = require('aws-sdk');

exports.handler = async () => {
    const ddb = new AWS.DynamoDB();
    let params = {
        TableName: process.env.TABLE_NAME
    };

    const mapData = [];
    let finishedScan = false;
    while (!finishedScan) {
        try {
            await ddb.scan(params, (err,data) => {
                if (err) {
                    throw err;
                }
                mapData.push(...data.Items.map((item) => ({
                    teamId: item.teamId.S,
                    league: item.league.S,
                    conference: item.conference.S,
                    markerSize: {
                        x: item.markerSize.M.x.N,
                        y: item.markerSize.M.y.N,
                    },
                    position: {
                        lat: item.position.M.lat.N,
                        lng: item.position.M.lng.N,
                    },
                    visited: item.visited.B
                })));
                finishedScan = !data.LastEvaluatedKey;
            }).promise();
        } catch (err) {
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: err.message
            };
        }
    }
    return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({mapData})
    };
};