import boto3
import csv
from decimal import Decimal

def is_float(str):
    try:
        float(str)
        return True
    except ValueError:
        return False

dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
table = dynamodb.Table('StadiumsMapTable')

with table.batch_writer() as batch:
    filename = 'data/stadiums-data.csv'
    with open(filename, newline='\n') as csvfile:
        reader = csv.DictReader(csvfile, restval = None)
        for row in reader:
            ddb_item = {k: v for k,v in row.items() if v != ''}

            if 'formerNames' in ddb_item:
                former_names = []
                raw_former_names = ddb_item['formerNames'].split(' --- ')
                for raw_former_name in raw_former_names:
                    # format: Stadium Name (start1-end1 start2-end2)
                    name = raw_former_name.split('(')[0].strip()
                    years = []
                    raw_years_string = raw_former_name.split('(')[1].split(')')[0].strip()
                    raw_years = raw_years_string.split()
                    for raw_year in raw_years:
                        split_years = raw_year.split('-')
                        years.append({ 'start': int(split_years[0]), 'end': int(split_years[1]) if len(split_years) > 1 else int(split_years[0]) })
                    former_names.append({ 'name': name, 'years': years })
                ddb_item['formerNames'] = former_names

            if 'renovations' in ddb_item:
                renovations = []
                raw_renovations = ddb_item['renovations'].split(' --- ')
                for raw_renovation in raw_renovations:
                    cost = raw_renovation.split('(')[0].strip()
                    raw_years_string = raw_renovation.split('(')[1].split(')')[0].strip()
                    split_years = raw_years_string.split('-')
                    years = { 'start': int(split_years[0]), 'end': int(split_years[1]) if len(split_years) > 1 else int(split_years[0]) }
                    renovations.append({ 'cost': int(cost), 'years': years })
                ddb_item['renovations'] = renovations

            ddb_item['markerSize'] = { 'x': int(ddb_item['markerSizeX']), 'y': int(ddb_item['markerSizeY']) }
            del ddb_item['markerSizeX']
            del ddb_item['markerSizeY']

            ddb_item['position'] = { 'lat': Decimal(ddb_item['positionLat']), 'lng': Decimal(ddb_item['positionLng']) }
            del ddb_item['positionLat']
            del ddb_item['positionLng']

            for k,v in ddb_item.items():
                if not isinstance(v, str):
                    continue
                if v.isdigit():
                    ddb_item[k] = int(v)
                elif is_float(v):
                    ddb_item[k] = Decimal(v)
                elif v == 'True' or v == 'False':
                    ddb_item[k] = bool(v)

            batch.put_item(Item=ddb_item)
