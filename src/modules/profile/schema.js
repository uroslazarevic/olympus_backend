import { gql } from 'apollo-server';

import { Video, Photo } from '../shared';

export const profileSchema = gql`
    # Shared types
    ${Video}
    ${Photo}
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

    interface Post {
        id: Int!
        title: String!
        description: String!
        type: String!
        likes: Int!
        comments: Int!
        shares: Int!
    }

    type VideoPost implements Post {
        id: Int!
        title: String!
        description: String!
        type: String!
        likes: Int!
        comments: Int!
        shares: Int!
        videoLink: Video
    }
    type ImagePost implements Post {
        id: Int!
        title: String!
        description: String!
        type: String!
        likes: Int!
        comments: Int!
        shares: Int!
        imageLink: Photo
    }

    type TextPost implements Post {
        id: Int!
        title: String!
        description: String!
        type: String!
        likes: Int!
        comments: Int!
        shares: Int!
    }

    input VideoLinkInput {
        viewable: String!
        videoCode: String!
    }

    input ImageLinkInput {
        photoable: String!
        base64: String!
    }

    input PostData {
        title: String!
        description: String!
        type: String!
    }

    type FriendList {
        id: Int!
        userId: String!
        friendIds: JSON!
    }

    type FriendshipRequests {
        id: Int!
        userId: String!
        friendIds: JSON!
    }

    type ProfileData {
        latestVideos: [LatestVideo!]!
        profileIntro: [BioFact!]!
        twitterFeed: [Tweet!]!
        blogPosts: [BlogPost!]!
        authorPosts: [Post!]!
        sharedPosts: [Post!]!
        friendshipRequests: FriendshipRequests!
        friendList: FriendList!
    }

    extend type Query {
        getProfileData: ProfileData
        getPost: Post!
    }

    extend type Mutation {
        createBioFact(topic: String!, content: String!): BioFact!
        createTweet(text: String!, tags: String!): Tweet!
        createBlogPost(topic: String!, text: String!): BlogPost!
        createLatestVideo(title: String!, description: String!, videoCode: String!): LatestVideo!
        createPost(postData: PostData!, videoLink: VideoLinkInput, imageLink: ImageLinkInput): Post!
    }

    # extend type Subscription {
    # }
`;

// # type VideoPost {
//     #     id: Int!
//     #     userId: Int!
//     #     description: String!
//     #     type: String!
//     #     videoLink: Video
//     # }
//     # type ImagePost {
//     #     id: Int!
//     #     userId: Int!
//     #     description: String!
//     #     type: String!
//     #     imageLink: Photo
//     # }
//     # type TextPost {
//     #     id: Int!
//     #     userId: Int!
//     #     description: String!
//     #     type: String!
//     # }

//     # union Post = VideoPost | ImagePost | TextPost
