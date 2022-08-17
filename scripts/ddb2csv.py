import boto3
import csv

dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
table = dynamodb.Table('StadiumsMapTable')

data = []
response = table.scan()

while True:
    for item in response['Items']:
        translatedItem = {
            'teamId': item['teamId'],
            'teamName': item['teamName'],
            'league': item['league'],
            'conference': item['conference'],
            # 'division': item['division'],
            'city': item['city'],
            'state': item['state'],
            'country': item['country'],
            'stadiumName': item['stadiumName'],
            'capacity': item['capacity'],
            'openingDate': item['openingDate'],
            'visited': item['visited'],
            'logoUrl': item['logoUrl'],
            'markerSizeX': item['markerSize']['x'],
            'markerSizeY': item['markerSize']['y'],
            'positionLat': item['position']['lat'],
            'positionLng': item['position']['lng'],
            'stadiumImage0': item['stadiumImages'][0],
            'stadiumImage1': item['stadiumImages'][1] if len(item['stadiumImages']) > 1 else '',
            'stadiumImage2': item['stadiumImages'][2] if len(item['stadiumImages']) > 2 else '',
            'stadiumImage3': item['stadiumImages'][3] if len(item['stadiumImages']) > 3 else ''         
        }
        data.append(translatedItem)

    if 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
    else:
        break

fields = ['teamId', 'teamName', 'league', 'conference', 'city', 'state', 'country', \
            'stadiumName', 'capacity', 'openingDate', 'visited', \
            'logoUrl', 'markerSizeX', 'markerSizeY', 'positionLat', 'positionLng', \
            'stadiumImage0', 'stadiumImage1', 'stadiumImage2', 'stadiumImage3']
filename = 'ddb2csv.csv'
with open(filename, 'w') as csvfile: 
    # creating a csv writer object 
    writer = csv.DictWriter(csvfile, fieldnames = fields) 
        
    # writing headers (field names) 
    writer.writeheader() 
        
    # writing data rows 
    writer.writerows(data) 