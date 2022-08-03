const { gql } = require('apollo-server-express');
const uuid = require('uuid');
const poi = require('../graphql/Models').POI;

const poiService = {
  /**
   * get a list of pois
   * @param {*} _offset offset
   * @param {*} _limit limit
   * @param {*} sort_ sorting direction
   * @param {*} radius radius to search arround
   * @param {*} lat latitude
   * @param {*} lng longitude
   * @returns a list of pois belonging in the radius
   */
  async getPois(_offset, _limit, sort_, radius, lat, lng) {
    const limit = _limit;
    const offset = Number(_offset) ? Number(_offset) : null;
    const sort = sort_ ? { name: sort_ } : null;

    const pois = await poi.find({
      options: {
        offset,
        limit,
        sort,
      },
      where: {
        location_LT: {
          point: {
            latitude: Number(lat),
            longitude: Number(lng),
          },
          distance: Number(radius),
        },
      },
    });

    // arrays of pois
    return pois;
  },
  /**
   * add a new poi in the database
   * @param {*} poiData data of the poi
   * @returns newly created poi
   */
  async addPoi(poiData) {
    const created = await poi.create(
      {
        input: [
          {
            id: uuid.v4(),
            name: poiData.name,
            location: {
              latitude: poiData.location.latitude,
              longitude: poiData.location.longitude,
            },
          },
        ],
      },

    );
    return created;
  },
  /**
   * update a poi
   * @param {*} poiData data to be updated
   * @returns updated poi
   */
  async updatePoi(poiData) {
    const updated = await poi.update(
      {
        where: { id: poiData.id },
        update: {
          name: poiData.name,
          location: poiData.location,
        },
      },

    );
    return updated;
  },
  /**
   * get a single poi
   * @param {*} id id
   * @returns poi
   */
  async getPoi(id) {
    const selectionSet = gql`
            {
                id
                name
                location{
                    latitude
                    longitude
                }
            }
        `;
    const pois = await poi.find({
      selectionSet,
      where: { id },
    });

    if (pois.length <= 0) {
      throw Error('Could not find POI');
    }
    return pois;
  },
  /**
   * get experiences related to a poi
   * @param {*} id id
   * @param {*} maxExperiences number of experiences to return
   * @returns poi with its list of experiences
   */
  async getPoiExperiences(id, maxExperiences) {
    const selectionSet = gql`
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
        `;
    const pois = await poi.find({
      selectionSet,
      where: { id },
    });

    // make sure there is only one poi
    if (pois.length > 1) {
      throw new Error('An error occured while fetching pois');
    } else {
      const finalRes = {
        id: pois[0].id,
        name: pois[0].name,
        location: pois[0].location,
        totalCount: pois[0].journeysAggregate.count,
        experiences: pois[0].journeysConnection.edges.map((experience) => ({
          journey: experience.node.id,
          date: experience.date,
          description: experience.description,
          images: experience.images,
          order: experience.order,
          creator: experience.node.creator.userName,
        })),
      };
      return finalRes;
    }
  },
};

module.exports = poiService;
