const AWS = require('aws-sdk');

interface DdbString {
    S: string;
}
interface DdbNumber {
    N: number;
}
interface DdbBoolean {
    BOOL: boolean;
}
interface DdbList<T> {
    L: T[]
}
interface DdbObject<T> {
    M: T
}
interface DdbItem {
    stadiumId: DdbString;
    tenantId: DdbString;
    teamName: DdbString;
    league: DdbString;
    conference: DdbString;
    division: DdbString;
    city: DdbString;
    state: DdbString;
    country: DdbString;
    stadiumName: DdbString;
    nonCorporateName: DdbString;
    shortName: DdbString;
    formerNames: DdbList<DdbObject<DdbFormerName>>
    surface: DdbString;
    roof: DdbString;
    constructionCost: DdbNumber;
    renovations: DdbList<DdbObject<DdbRenovation>>
    artificialCapacity?: DdbNumber;
    capacity: DdbNumber;
    openingDate: DdbNumber;
    firstUsedDate: DdbNumber;
    lastUsedDate?: DdbNumber;
    closingDate?: DdbNumber;
    active: DdbBoolean;
    activeForTeam: DdbBoolean;
    visited: DdbBoolean;
    visits: DdbNumber;
    logoUrl: DdbString;
    markerSize: DdbObject<DdbMarkerSize>
    position: DdbObject<DdbPosition>
    imageWithFans: DdbString;
    imageEmpty: DdbString;
    imageFacade: DdbString;
    imageAerial?: DdbString;
    primaryFieldImage: DdbString;
    primaryPerspectiveImage: DdbString;
}
interface DdbYears {
    start: DdbNumber;
    end: DdbNumber;
}
interface DdbFormerName {
    name: DdbString;
    years: DdbList<DdbObject<DdbYears>>
}
interface DdbRenovation {
    cost: DdbNumber;
    years: DdbObject<DdbYears>
}
interface DdbMarkerSize {
    x: DdbNumber;
    y: DdbNumber;
}
interface DdbPosition {
    lat: DdbNumber;
    lng: DdbNumber;
}
interface DdbResponse {
    Items: DdbItem[];
    LastEvaluatedKey?: string;
}
interface Years {
    start: number;
    end: number;
}
interface FormerName {
    name: string;
    years: Years[];
}
interface Renovation {
    cost: number;
    years: Years;
}
interface StadiumData {
    stadiumId: string;
    tenantId: string;
    teamName: string;
    league: string;
    conference: string;
    division?: string;
    city: string;
    state: string;
    country: string;
    stadiumName: string;
    nonCorporateName: string;
    shortName: string;
    formerNames: FormerName[];
    surface: string;
    roof: string;
    constructionCost: number;
    renovations: Renovation[];
    artificialCapacity?: number;
    capacity: number;
    openingDate: number;
    firstUsedDate: number;
    lastUsedDate?: number;
    closingDate?: number;
    active: boolean;
    activeForTeam: boolean;
    visited: boolean;
    visits: number;
    logoUrl: string;
    markerSize: { x: number; y: number; }
    position: { lat: number; lng: number; }
    imageWithFans: string;
    imageEmpty: string;
    imageFacade: string;
    imageAerial?: string;
    primaryFieldImage: string;
    primaryPerspectiveImage: string;
}

const convertDdbItemToStadiumData = (item: DdbItem): StadiumData => ({
    stadiumId: item.stadiumId.S,
    tenantId: item.tenantId.S,
    teamName: item.teamName.S,
    league: item.league.S,
    conference: item.conference.S,
    division: item.division?.S,
    city: item.city.S,
    state: item.state.S,
    country: item.country.S,
    stadiumName: item.stadiumName.S,
    nonCorporateName: item.nonCorporateName?.S,
    shortName: item.shortName?.S,
    formerNames: item.formerNames?.L.map((ddbFormerName: DdbObject<DdbFormerName>) => ({
        name: ddbFormerName.M.name.S,
        years: ddbFormerName.M.years.L.map((ddbYears: DdbObject<DdbYears>) => ({
            start: Number(ddbYears.M.start.N),
            end: Number(ddbYears.M.end.N)
        }))
    })),
    surface: item.surface?.S,
    roof: item.roof.S,
    constructionCost: item.constructionCost.N,
    renovations: item.renovations?.L.map((ddbRenovation: DdbObject<DdbRenovation>) => ({
        cost: ddbRenovation.M.cost.N,
        years: {
            start: Number(ddbRenovation.M.years.M.start.N),
            end: Number(ddbRenovation.M.years.M.end.N)
        }
    })),
    capacity: Number(item.capacity.N),
    artificialCapacity: item.artificialCapacity && Number(item.artificialCapacity.N),
    openingDate: Number(item.openingDate.N),
    firstUsedDate: Number(item.firstUsedDate.N),
    lastUsedDate: item.lastUsedDate && Number(item.lastUsedDate.N),
    closingDate: item.closingDate && Number(item.closingDate.N),
    active: item.active.BOOL,
    activeForTeam: item.activeForTeam.BOOL,
    visited: item.visited.BOOL,
    visits: Number(item.visits.N),
    logoUrl: item.logoUrl.S,
    markerSize: {
        x: Number(item.markerSize.M.x.N),
        y: Number(item.markerSize.M.y.N),
    },
    position: {
        lat: Number(item.position.M.lat.N),
        lng: Number(item.position.M.lng.N),
    },
    imageWithFans: item.imageWithFans.S,
    imageEmpty: item.imageEmpty.S,
    imageAerial: item.imageAerial?.S,
    imageFacade: item.imageFacade.S,
    primaryFieldImage: item.primaryFieldImage.S,
    primaryPerspectiveImage: item.primaryPerspectiveImage.S    
});
exports.handler = async () => {
    const ddb = new AWS.DynamoDB();
    let params = {
        TableName: process.env.TABLE_NAME
    };

    const mapData: any = [];
    let finishedScan = false;
    while (!finishedScan) {
        try {
            await new Promise<void>((resolve, reject) => {
                ddb.scan(params, (err: Error,data: DdbResponse) => {
                  if (err) {
                    reject(err);
                  } else {
                    mapData.push(...data.Items.map(convertDdbItemToStadiumData));
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
