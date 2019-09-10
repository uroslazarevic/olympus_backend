import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import DataLoader from 'dataloader';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import ngrok from 'ngrok';

import typeDefs from './schema';
import resolvers from './resolvers';
import batchSuggestions from './resolvers/batch';
import { refreshTokens } from './auth/auth';

require('dotenv').config();
const models = require('./models');

const app = express();

let url = '';
(async () => {
    url = await ngrok.connect(process.env.PORT);
    console.log('url', url);
})();
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${url}/auth/facebook/callback`,
        },
        (accessToken, refreshToken, profile, cb) => {
            console.log('profile', profile);
            return cb(null, profile);
            // User.findOrCreate({ facebookId: profile.id }, function(err, user) {
            //     return cb(err, user);
            // });
        }
    )
);

app.use(passport.initialize());

app.get('/flogin', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
    // Successful authentication, redirect home.
    res.send('Auth was good');
});

const addUser = async (req, res, next) => {
    const token = req.headers['x-token'];
    if (token) {
        try {
            const { user } = jwt.verify(token, process.env.SECRET);
            console.log(11111111, user);
            req.user = user;
        } catch (err) {
            console.log(2222222);
            const refreshToken = req.headers['x-refresh-token'];
            const newTokens = await refreshTokens(token, refreshToken, models);
            console.log('newTokens', newTokens);
            if (newTokens.token && newTokens.refreshToken) {
                // Exposes new header in response for client
                res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
                res.set('x-token', newTokens.token);
                res.set('x-refresh-token', newTokens.refreshToken);
            }
            req.user = newTokens.user;
            console.log('addUser middleware error');
        }
    }
    next();
};

app.use(bodyParser.json());
app.use(cors('*'));
app.use(addUser);

const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        models,
        user: req.user,
        suggestionLoader: new DataLoader((keys) => batchSuggestions(keys, models)),
    }),
});

apollo.applyMiddleware({ app });

const httpServer = createServer(app);

// Add subscription support
apollo.installSubscriptionHandlers(httpServer);

models.sequelize
    .sync({
        force: false, // To create table if exists , so make it false
        logging: false,
    })
    .then(() => {
        httpServer.listen({ port: process.env.PORT }, () => {
            console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${apollo.graphqlPath}`);
            console.log(`🚀 Subscriptions ready at ws://localhost:${process.env.PORT}${apollo.subscriptionsPath}`);
        });
    })
    .catch((err) => {
        console.log(err);
        console.log('DB start error');
    });
