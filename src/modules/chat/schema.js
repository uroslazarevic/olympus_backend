import { gql } from 'apollo-server';

export const chatSchema = gql`
    type ChatMessage {
        id: String!
        date: String!
        from: String!
        text: String
    }

    type ChatHistory {
        id: String!
        chatHistory: [ChatMessage!]!
    }

    input ChatMessageInput {
        id: String!
        date: String!
        from: String!
        text: String
    }

    extend type Query {
        chatHistory(room: String!): [ChatHistory!]!
    }

    extend type Mutation {
        createChatHistory(room: String!, history: [ChatMessageInput!]!): ChatHistory!
    }

    # extend type Subscription {
    # }
`;
