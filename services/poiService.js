const {gql} = require('apollo-server-express');
const poi = require('../graphql/Models').POI
const uuid = require('uuid')

const poiService = {

    async getPois(offset,limit,sort,radius,lat,lng){

        limit = limit;
        offset = Number(offset) ? Number(offset) : null; 
        sort = sort? {name:sort} : null
    
        const pois = await poi.find({
            options: {
                offset,
                limit,
                sort
            },
            where:{ location_LT: { point: { latitude: Number(lat), longitude: Number(lng) }, distance: Number(radius) } }
            });

        //arrays of pois
        return  pois;
    },
    async addPoi(poiData){
        
        const created = await poi.create(
            {
                input:[
                    {
                        id : uuid.v4(),
                        name: poiData.name,
                        location:{
                            latitude: poiData.location.latitude,
                            longitude: poiData.location.longitude
                        }
                    }
                ]}

        );
        return created;
    },
    async updatePoi(poiData){
        
        const updated = await poi.update(
            {
                where: {id: poiData.id},
                update: {
                    name: poiData.name,
                    location: poiData.location
                }
            }

        );
        return updated;
    },
    async getPoi(id){

        const selectionSet = gql`
            {
                id
                name
                location{
                    latitude
                    longitude
                }
            }
        ` 
        const pois = await poi.find({
            selectionSet,
            where: { id: id }
        });
        
        if(pois.length <= 0 ){
            throw Error("Could not find POI")
        }
        return  pois
    },
    async getPoiExperiences(id, maxExperiences){
        const selectionSet =gql`
        {
            id
            name
            location{
                latitude
                longitude
            }
            journeysAggregate{
                count
            }
            journeysConnection(first:${maxExperiences}){
                edges{
                    date
                    description
                    images
                    order
                    node{
                        id
                        creator{
                            userName
                        }
                    }
                }
            }
        }
        ` 
        const pois = await poi.find({
            selectionSet,
            where: { id: id},
        });
        
        //make sure there is only one poi
        if(pois.length > 1 ){
            throw new Error("An error occured while fetching pois")
        }else{
            const finalRes = {
                id: pois[0].id,
                name: pois[0].name,
                location: pois[0].location,
                totalCount: pois[0].journeysAggregate.count,
                experiences: pois[0].journeysConnection.edges.map(experience => {
                    return {
                        journey: experience.node.id,
                        date: experience.date,
                        description: experience.description,
                        images: experience.images, 
                        order: experience.order,
                        creator: experience.node.creator.userName
                    }
                })
            }
           return finalRes
        }
    } 
}

module.exports = poiService