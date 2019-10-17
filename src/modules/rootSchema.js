const { gql } = require('apollo-server');

export const rootSchema = gql`
    # Define custom scalar JSON
    scalar JSON

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
