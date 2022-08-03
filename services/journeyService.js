const { gql } = require('apollo-server-express');
const uuid = require('uuid');
const journey = require('../graphql/Models').Journey;

const journeyService = {

  // return all journeys
  async getJourneys(_offset, _limit, _sort) {
    // limit by then by default
    const limit = Number(_limit) ? Number(_limit) : 10;
    const offset = Number(_offset) ? Number(_offset) : null;
    const sort = _sort ? { name: _sort } : null;

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
        `;

    const journeys = await journey.find(
      {
        selectionSet,
        options: {
          offset,
          limit,
          sort,
        },
      },
    );

    return journeys;
  },

  // get journey by id, returns journey name, poi data, and experience list
  async getJourney(id, experiences) {
    const nexp = Number(experiences) ? Number(experiences) : 3;
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
        `;

    const j = await journey.find(
      {
        selectionSet,
        where: { id },
      },
    );

    if (j.length > 1) {
      throw Error('An error occured while fetching journeys');
    } else if (j.length === 0) {
      throw Error('Journey not found');
    } else {
      return j;
    }
  },

  async addJourney(journeyData, user) {
    const created = await journey.create({
      input: [
        {
          id: uuid.v4(),
          title: journeyData.title,
          start: {
            latitude: journeyData.start.latitude,
            longitude: journeyData.start.longitude,
          },
          end: {
            latitude: journeyData.end.latitude,
            longitude: journeyData.end.longitude,
          },
          creator: {
            connect: {
              where: {
                node: {
                  userName: user.userName,
                },
              },
            },
          },
        },
      ],
    });

    return created;
  },
  async updateJourney(journeyData) {
    const updated = await journey.update({
      where: { id: journeyData.id },
      update: {
        title: journeyData.title,
      },
    });

    return updated;
  },
  async addExperience(journeyData) {
    const added = await journey.update({
      where: {
        id: journeyData.id,
      },
      connect: {
        experiences: [{
          where: {
            node: {
              id: journeyData.poi.id,
            },
          },
          edge: journeyData.experience,

        }],
      },
    });
    return added;
  },

};

module.exports = journeyService;
