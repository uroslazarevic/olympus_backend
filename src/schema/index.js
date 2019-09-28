const { gql } = require('apollo-server');

export default gql`
    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }

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

    input ProfileSettingsInput {
        id: Int!
        name: String!
        pseudonym: String!
        city: String!
        country: String!
    }

    type ChatHistory {
        id: String!
        chatHistory: [ChatMessage!]!
    }

    type ChatMessage {
        id: Int!
        date: String!
        from: String!
        text: String
    }

    input ChatMessageInput {
        id: Int!
        date: String!
        from: String!
        text: String
    }

    type Query {
        allUsers: [User!]
        me(id: Int!): User!
        chatHistory(room: String!): [ChatHistory!]!
    }

    type Mutation {
        register(username: String!, email: String!, password: String!, isAdmin: Boolean!): User!
        login(email: String!, password: String!): AuthPayload!
        createUser(username: String!): User!
        refreshTokens(token: String!, refreshToken: String!): AuthPayload!
        userInputError(input: String): String
        createChatHistory(room: String!, history: [ChatMessageInput!]!): ChatHistory!
        profileSettings(settings: ProfileSettingsInput!): Boolean!
        fileUpload(file: Upload!, id: Int!): File!
    }

    type Subscription {
        userAdded: User!
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

    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`;
