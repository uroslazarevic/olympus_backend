export const File = `
    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }
`;

export const Video = `
    type Video {
        id:Int!
        viewableId: Int!
        viewable: String!
        videoCode: String!
    }
`;
