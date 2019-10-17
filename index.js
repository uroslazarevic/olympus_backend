import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';

import { typeDefs } from './src/modules/typeDefs';
import { resolvers } from './src/modules/resolvers';
import app from './src/app';
import * as socketServer from './src/socket';
import models from './src/db/models';

const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        models,
        user: req.user,
    }),
    formatError: (err) => {
        console.log('err', err);
        if (err.message.startsWith('Validation error')) {
            const { message, path } = err.extensions.exception.errors[0];
            return { error: message, path };
        }
        return err.extensions.exception;
    },
});

apollo.applyMiddleware({ app });

const apolloHttpServer = createServer(app);
const socketHttpServer = createServer(app);

// Init socket server
socketServer.initSocketServer(socketHttpServer);

// Add subscription support
apollo.installSubscriptionHandlers(apolloHttpServer);

apolloHttpServer.listen({ port: process.env.PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${apollo.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${process.env.PORT}${apollo.subscriptionsPath}`);
});

process.on('unhandledRejection', (reason, promise) => {
    // console.log('unhandledRejection error');
    console.log('Unhandled Rejection at:', 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});
