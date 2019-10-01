const { gql } = require('apollo-server');

export const rootSchema = gql`
    type Query {
        root: String
    }

    type Mutation {
        root: String
    }

    type Subscription {
        root: String
    }
`;
