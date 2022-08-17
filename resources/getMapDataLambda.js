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
            await new Promise((resolve, reject) => {
                ddb.scan(params, (err,data) => {
                  if (err) {
                    reject(err);
                  } else {
                    mapData.push(...data.Items.map((item) => ({
                        teamId: item.tenantId.S,
                        teamName: item.teamName.S,
                        league: item.league.S,
                        conference: item.conference.S,
                        stadiumName: item.stadiumName.S,
                        openingDate: item.openingDate.N,
                        capacity: item.capacity.N,
                        city: item.city.S,
                        state: item.state.S,
                        country: item.country.S,
                        logoUrl: item.logoUrl.S,
                        stadiumImages: [
                            item.imageWithFans.S,
                            item.imageEmpty.S,
                            item.imageAerial && item.imageAerial.S,
                            item.imageFacade.S
                        ],
                        markerSize: {
                            x: Number(item.markerSize.M.x.N),
                            y: Number(item.markerSize.M.y.N),
                        },
                        position: {
                            lat: Number(item.position.M.lat.N),
                            lng: Number(item.position.M.lng.N),
                        },
                        visited: item.visits.N > 0
                    })));
                    finishedScan = !data.LastEvaluatedKey;
                    resolve();
                  }
                });
            });
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