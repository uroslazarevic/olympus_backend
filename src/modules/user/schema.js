import { gql } from 'apollo-server';

import { File } from '../shared';

export const userSchema = gql`
    # Shared types
    ${File}
    # Shared types

    type ProfileSettings {
        id: Int!
        name: String!
        avatar: String!
        pseudonym: String!
        city: String!
        country: String!
    }

    type User {
        id: Int!
        username: String!
        email: String!
        isAdmin: Boolean!
        # password: String! if not defined client cant retrieve it
        # createdAt: String!
        # updatedAt: String!
        profileSettings: ProfileSettings!
    }

    type AuthUserData {
        username: String!
        id: Int!
    }

    type AuthPayload {
        token: String!
        refreshToken: String!
        userData: AuthUserData!
        profileSettings: ProfileSettings!
    }

    input ProfileSettingsInput {
        id: Int!
        name: String!
        pseudonym: String!
        city: String!
        country: String!
    }

    extend type Query {
        getProfileSettings: ProfileSettings!
        allUsers: [User!]!
    }

    extend type Mutation {
        register(username: String!, email: String!, password: String!, isAdmin: Boolean!): User!
        login(email: String!, password: String!): AuthPayload!
        refreshTokens(token: String!, refreshToken: String!): AuthPayload!
        createUser(username: String!): User!
        userInputError(input: String): String
        setProfileSettings(settings: ProfileSettingsInput!): Boolean!
        fileUpload(file: Upload!, id: Int!): File!
    }

    extend type Subscription {
        userAdded: User!
    }
`;
