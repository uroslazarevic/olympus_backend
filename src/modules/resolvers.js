import { merge } from 'lodash';
import GraphQLJSON from 'graphql-type-json';

import { userResolver } from './user/resolver';
import { chatResolver } from './chat/resolver';
import { profileResolver } from './profile/resolver';

const rootResolver = {
    // Define custom scalar: JSON
    JSON: GraphQLJSON,
    Query: {},
    Mutation: {},
    Subscription: {},
};

export const resolvers = merge(rootResolver, userResolver, chatResolver, profileResolver);
