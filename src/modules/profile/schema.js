import { gql } from 'apollo-server';

export const profileSchema = gql`
    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }

    input ProfileSettingsInput {
        id: Int!
        name: String!
        pseudonym: String!
        city: String!
        country: String!
    }

    # extend type Query {
    # }

    extend type Mutation {
        profileSettings(settings: ProfileSettingsInput!): Boolean!
        fileUpload(file: Upload!, id: Int!): File!
    }

    # extend type Subscription {
    # }
`;
