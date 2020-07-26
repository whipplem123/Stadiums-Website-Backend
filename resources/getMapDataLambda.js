const AWS = require('aws-sdk');

exports.handler = async () => {
    const ddb = new AWS.DynamoDB.DocumentClient();
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
                mapData.push(...data.Items);
                finishedScan = !data.LastEvaluatedKey;
            }).promise();
        } catch (err) {
            return {
                statusCode: 500,
                headers: {},
                body: err.message
            };
        }
    }
    return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({mapData})
    };
};