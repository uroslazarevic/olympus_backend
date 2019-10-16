import { gql } from 'apollo-server';

import { Video } from '../shared';

export const profileSchema = gql`
    # Shared types
    ${Video}
    # Shared types

    type BioFact {
        id: Int!
        userId: Int!
        topic: String!
        content: String!
    }

    type Tweet {
        id: Int!
        userId: Int!
        text: String!
        # tags => JSON format
        tags: String!
    }

    type BlogPost {
        id: Int!
        userId: Int!
        topic: String!
        text: String!
    }

    type LatestVideo {
        id: Int!
        title: String!
        description: String!
        videoRecord: Video!
    }

    type ProfileData {
        latestVideos: [LatestVideo]!
        profileIntro: [BioFact!]!
        twitterFeed: [Tweet!]!
        blogPosts: [BlogPost!]!
    }

    extend type Query {
        getProfileData: ProfileData
    }

    extend type Mutation {
        createBioFact(topic: String!, content: String!): BioFact!
        createTweet(text: String!, tags: String!): Tweet!
        createBlogPost(topic: String!, text: String!): BlogPost!
        createLatestVideo(title: String!, description: String!, videoCode: String!): LatestVideo!
    }

    # extend type Subscription {
    # }
`;
