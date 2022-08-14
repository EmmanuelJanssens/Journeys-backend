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
  async getJourneys(page, pageSize, sort_) {
    // limit by then by default
    const options = {
      limit: pageSize,
      offset: page,
      sort: sort_ ? { name: sort_ } : null,
    };

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
    const count = await journey.aggregate({
      aggregate: {
        count: 1,
      },
      options,
    });
    const journeys = await journey.find(
      {
        selectionSet,
        options,
      },
    );

    const result = {
      data: journeys,
      pageInfo: {
        totalCount: count.count,
        pageCount: Math.ceil(count.count / pageSize),
        currentPage: page,
        hasNextPage: (page + 1) * pageSize < count.count,
        first: page === 0,
      },
    };

    return result;
  },

  /**
   * get one journey by id
   * @param {*} id id of the journey
   * @param {*} experiences number of experiences to display
   * @returns a journey with its detais
   */
  async getJourney(id, cursor, experiences) {
    const nexp = Number(experiences) ? Number(experiences) : 10;
    const selectionSet = gql`
        {
            id
            title
            creator {
              userName
            }
            start{
              latitude
              longitude
            }
            end{
              latitude
              longitude
            }
            experiencesAggregate{
              count
            }
            experiencesConnection(first:${nexp}, after:  ${cursor} ) {
              edges {
                date
                description
                images
                order
                node {
                  id
                  name
                  location{
                    latitude
                    longitude
                  }
                }
              }
              pageInfo{
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
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
      const res = {
        id: j[0].id,
        title: j[0].title,
        creator: j[0].creator,
        start: j[0].start,
        end: j[0].end,
        experiencesCount: j[0].experiencesAggregate.count,
        experiences: j[0].experiencesConnection.edges.map((experience) => (
          {
            poi: experience.node,
            date: experience.date,
            description: experience.description,
            images: experience.images,
            order: experience.order,
          }
        )),
        pageInfo: j[0].experiencesConnection.pageInfo,

      };
      return res;
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
