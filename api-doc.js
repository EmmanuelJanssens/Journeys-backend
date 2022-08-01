const apiDoc = {
    swagger: '2.0',
    basePath: '/v1',
    info: {
        title: 'Journeys API',
        version : '1.0.0'
    },
    definitions: {
        Poi: {
            type: 'object',
            properties: {
                name: {
                    description: 'Name of the Point of interest',
                    type: 'string'
                }
            },

            required: ['name']
        },
    },
    paths:{}
};

export default apiDoc;