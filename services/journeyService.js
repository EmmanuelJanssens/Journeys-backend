const {gql} = require('apollo-server-express');
const journey = require('../graphql/Models').Journey
const uuid = require('uuid')

const journeyService = {

    //return all journeys
    async getJourneys(offset,limit,sort){

        //limit by then by default
        limit = Number(limit) ? Number(limit) : 10;
        offset = Number(offset) ? Number(offset) : null;
        sort = sort ? {name:sort} : null;

        const selectionSet = `
        {
            id
            title
            start{
                latitude
                longitude
            }
            end{
                latitude
                longitude
            }
            creator{
                userName
            }
        }
        `

        const journeys = await journey.find(
            {
                selectionSet,
                options: {
                    offset,
                    limit,
                    sort
                },
            }
        )

        return journeys;
    },

    //get journey by id, returns journey name, poi data, and experience list
    async getJourney(id,experiences){

        const nexp = Number(experiences) ? Number(experiences) : 3
        const selectionSet = gql`
        {
            id
            title
            creator {
              userName
            }
            experiencesConnection(first:${nexp}) {
              edges {
                date
                description
                images
                order
                node {
                  id
                  name
                }
              }
            }
            experiencesAggregate{
                count
            }
            
        }
        `

        const j = await journey.find(
            {
                selectionSet,
                where: {id: id}
            }
        )

        if(j.length > 1){
            throw Error("An error occured while fetching journeys")
        }else if(j.length == 0){
            throw Error("Journey not found")
        }else{
            return j
        }
    },

    async addJourney(journeyData,user){
        const created = await journey.create({
            input: [
                {
                    id: uuid.v4(),
                    title: journeyData.title,
                    start:{
                        latitude: journeyData.start.latitude,
                        longitude: journeyData.start.longitude
                    },
                    end:{
                        latitude: journeyData.end.latitude,
                        longitude: journeyData.end.longitude
                    },
                    creator: {
                        connect:{
                            where:{
                                node:{
                                    userName:user.userName
                                }
                            }
                        }
                    }
                }
            ]
        })

        return created;
    },
}

module.exports = journeyService