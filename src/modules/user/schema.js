import { gql } from 'apollo-server';

export const userSchema = gql`
    type User {
        id: Int!
        username: String!
        email: String!
        isAdmin: Boolean!
        name: String!
        avatar: String!
        pseudonym: String!
        city: String!
        country: String!
        # password: String! if not defined client cant retrieve it
        createdAt: String!
        updatedAt: String!
    }

    type AuthUserData {
        username: String!
        id: Int!
    }

    type AuthPayload {
        token: String!
        refreshToken: String!
        userData: AuthUserData!
        user: User!
    }

    extend type Query {
        allUsers: [User!]
        me(id: Int!): User!
    }

    extend type Mutation {
        register(username: String!, email: String!, password: String!, isAdmin: Boolean!): User!
        login(email: String!, password: String!): AuthPayload!
        refreshTokens(token: String!, refreshToken: String!): AuthPayload!
        createUser(username: String!): User!
        userInputError(input: String): String
    }

    extend type Subscription {
        userAdded: User!
    }
`;
