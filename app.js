const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const cors = require('cors');
const pois = require('./routes/pointOfInterest');
const journeys = require('./routes/journeys');
const users = require('./routes/users');
const auth = require('./routes/authentication');
const { ogm } = require('./graphql/Models');
const { neoSchema } = require('./graphql/Models');

const app = express();

const router = express.Router();

router.use('/api/pois', pois);
router.use('/api/journeys', journeys);
router.use('/api/users', users);
router.use('/api/auth', auth.router);

app.use(auth.passport.initialize());
app.use(router);

Promise.all([neoSchema.getSchema(), ogm.init()]).then(([schema]) => {
  const server = new ApolloServer({
    schema,
  });

  server.start().then(() => {
    server.applyMiddleware({ app, path: '/graphql' });

    app.use(cors({
      origin: '*',
      allowedHeaders: '*',
      methods: '*',
    }));

    app.listen({ port: 4000 }, () => console.log('🚀 Server ready at http://localhost:4000'));
  });
});
