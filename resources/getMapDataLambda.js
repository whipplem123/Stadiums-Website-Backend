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
                    teamName: item.teamName.S,
                    league: item.league.S,
                    conference: item.conference.S,
                    stadiumName: item.stadiumName.S,
                    openingDate: item.openingDate.S,
                    capacity: item.capacity.N,
                    city: item.city.S,
                    state: item.state.S,
                    country: item.country.S,
                    logoUrl: item.logoUrl.S,
                    stadiumImages: item.stadiumImages.L.map((image) => image.S),
                    markerSize: {
                        x: Number(item.markerSize.M.x.N),
                        y: Number(item.markerSize.M.y.N),
                    },
                    position: {
                        lat: Number(item.position.M.lat.N),
                        lng: Number(item.position.M.lng.N),
                    },
                    visited: item.visited.BOOL
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