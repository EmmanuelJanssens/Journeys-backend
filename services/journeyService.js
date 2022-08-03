const { gql } = require('apollo-server-express');
const uuid = require('uuid');
const journey = require('../graphql/Models').Journey;

const journeyService = {
  /**
   * get a list of journeys
   * @param {*} _offset offset
   * @param {*} _limit limit
   * @param {*} _sort sorting direction
   * @returns list of journeys
   */
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
  /**
   * get one journey by id
   * @param {*} id id of the journey
   * @param {*} experiences number of experiences to display
   * @returns a journey with its detais
   */
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
  /**
   * add a new journey
   * @param {*} journeyData data of the journey to be added
   * @param {*} user creator of the journey
   * @returns the newly created journey
   */
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
  /**
   * update a journey
   * @param {*} journeyData data of the journey to update
   * @returns updated journey
   */
  async updateJourney(journeyData) {
    const updated = await journey.update({
      where: { id: journeyData.id },
      update: {
        title: journeyData.title,
      },
    });

    return updated;
  },
  /**
   * add an experience to the journey
   * @param {*} journeyData data of the experience
   * @returns journey with its added experience
   */
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
