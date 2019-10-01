import { merge } from 'lodash';

import { userResolver } from './user/resolver';
import { chatResolver } from './chat/resolver';
import { profileResolver } from './profile/resolver';

const rootResolver = {
    Query: {},
    Mutation: {},
    Subscription: {},
};

export const resolvers = merge(rootResolver, userResolver, chatResolver, profileResolver);
