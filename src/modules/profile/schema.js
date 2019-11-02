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
        tags: JSON!
        createdAt: String!
    }

    type BlogPost {
        id: Int!
        userId: Int!
        topic: String!
        text: String!
        createdAt: String!
    }

    type LatestVideo {
        id: Int!
        title: String!
        description: String!
        videoRecord: Video!
    }

    type Likes {
        count: Int!
        list: JSON!
    }

    type Comment {
        commentableId: Int!
        commentable: String!
        list: JSON!
        replies: Comment!
        likes: Likes!
    }

    interface Post {
        id: Int!
        title: String!
        description: String!
        type: String!
        likes: Likes!
        comments: Comment!
        shares: Int!
        createdAt: String!
    }

    type VideoPost implements Post {
        id: Int!
        title: String!
        description: String!
        type: String!
        likes: Likes!
        comments: Comment!
        shares: Int!
        createdAt: String!
        videoLink: Video
    }

    type ImagePost implements Post {
        id: Int!
        # If its shared post, it has author obj  {id, name}
        author: ProfileSettings
        title: String!
        description: String!
        type: String!
        likes: Likes!
        comments: Comment!
        shares: Int!
        createdAt: String!
        imageLink: Photo
    }

    type TextPost implements Post {
        id: Int!
        title: String!
        description: String!
        type: String!
        likes: Likes!
        comments: Comment!
        shares: Int!
        createdAt: String!
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

    type Friends {
        count: Int!
        list: [ProfileSettings!]!
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
        friends: Friends!
        userPhotos: [Photo!]!
    }

    extend type Query {
        profileData: ProfileData
        getPost(postId: Int!): Post!
        getSharedPosts: [Post!]!
    }

    extend type Mutation {
        # Bio Facts Mutations
        createBioFact(topic: String!, content: String!): BioFact!
        deleteBioFacts(ids: [Int!]!): Boolean!
        updateBioFact(id: ID!, topic: String!, content: String!): BioFact!
        # Tweet Mutations
        createTweet(text: String!, tags: String!): Tweet!
        # BlogPost Mutations
        createBlogPost(topic: String!, text: String!): BlogPost!
        # LatestVideo Mutations
        createLatestVideo(title: String!, description: String!, videoCode: String!): LatestVideo!
        # Post Mutations
        createPost(postData: PostData!, videoLink: VideoLinkInput, imageLink: ImageLinkInput): Post!
        createSharedPost(postId: Int!): Post!
    }

    # extend type Subscription {
    # }
`;

// # union Post = VideoPost | ImagePost | TextPost
