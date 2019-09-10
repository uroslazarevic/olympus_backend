const { gql } = require('apollo-server');

export default gql`
    type Suggestion {
        id: Int!
        text: String!
        creatorUsername: String!

        # The suggestion's creatorId is association field of user.id.
        creatorId: Int!
    }

    type Board {
        id: Int!
        name: String!
        suggestions: [Suggestion!]
        # The board's owner is association field of user.id.
        owner: Int!
    }

    type User {
        id: Int!
        username: String!
        email: String!
        isAdmin: Boolean!
        # password: String! if not defined client cant retrieve it
        createdAt: String!
        updatedAt: String!
        boards: [Board!]!
        suggestions: [Suggestion!]!
    }
    type Query {
        allUsers: [User!]
        me: User
        userBoards(owner: Int!): [Board!]!
        userSuggestions(creatorId: String!): [Suggestion]
    }

    type Mutation {
        updateUser(username: String!, newUsername: String!): [Int!]!
        deleteUser(username: String!): Int!
        createBoard(owner: Int!, name: String!): Board!
        createSuggestion(creatorId: Int!, text: String!, boardId: Int!): Suggestion!
        register(username: String!, email: String!, password: String!, isAdmin: Boolean!): User!
        login(email: String!, password: String!): AuthPayload!
        createUser(username: String!): User!
        refreshTokens(token: String!, refreshToken: String!): AuthPayload!
    }

    type Subscription {
        userAdded: User!
    }

    type AuthPayload {
        token: String!
        refreshToken: String!
    }

    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`;
