/* eslint-disable no-underscore-dangle */
export const profileResolver = {
    Post: {
        __resolveType(obj) {
            if (obj.videoLink) return 'VideoPost';
            if (obj.imageLink) return 'ImagePost';
            return 'TextPost';
        },
    },
    ProfileData: {
        latestVideos: (parent) => parent.getLatestVideos({ include: ['videoRecord'] }),
        profileIntro: (parent) => parent.getBioFacts(),
        twitterFeed: (parent) => parent.getTweets(),
        blogPosts: (parent) => parent.getBlogPosts(),
        friendList: (parent) => parent.getFriendList(),
        friendshipRequests: (parent) => parent.getFriendshipRequest(),
        authorPosts: async (parent, args, { models }) => {
            const posts = await parent
                .getPosts({
                    include: [
                        { model: models.Video, as: 'videoLink' },
                        { model: models.Photo, as: 'imageLink' },
                        { model: models.Like, as: 'likes', attributes: ['userIds'] },
                        { model: models.Comment, as: 'comments', attributes: ['userIds'] },
                        { model: models.Share, as: 'shares', attributes: ['userIds'] },
                    ],
                })
                .map((post) => {
                    post.likes = post.likes.userIds.length;
                    post.comments = post.comments.userIds.length;
                    post.shares = post.shares.userIds.length;
                    return post;
                });
            return posts;
        },
    },

    Query: {
        getProfileData: async (parent, args, { models, user }) => models.User.findOne({ where: { id: user.id } }),
    },
    Mutation: {
        createBioFact: (parent, args, { models, user }) => models.BioFact.create({ ...args, userId: user.id }),
        createTweet: (parent, args, { models, user }) => models.Tweet.create({ ...args, userId: user.id }),
        createBlogPost: (parent, args, { models, user }) => models.BlogPost.create({ ...args, userId: user.id }),
        createLatestVideo: async (parent, args, { models, user }) => {
            const { title, description, videoCode } = args;
            const me = await models.User.findOne({ where: { id: user.id } });
            const latestVideo = await me.createLatestVideo({ title, description });
            const videoRecord = await latestVideo.createVideoRecord({ viewableId: latestVideo.id, videoCode });
            return {
                ...latestVideo.dataValues,
                videoRecord,
            };
        },

        createPost: async (parent, { postData, videoLink, imageLink }, { models, user }) => {
            let link;
            const me = await models.User.findOne({ where: { id: user.id } });
            // Create post
            const post = await me.createPost(postData, { raw: true });
            // Create posts's likes, comments and shares
            const likes = await post.createLikes({ userIds: [] });
            const comments = await post.createComments({ userIds: [] });
            const shares = await post.createShares({ userIds: [] });
            if (postData.type === 'video') link = await post.createVideoLink(videoLink);
            if (postData.type === 'image') link = await post.createImageLink(imageLink);
            return {
                ...post.dataValues,
                [`${postData.type}Link`]: link,
                shares: shares.userIds.length,
                likes: likes.userIds.length,
                comments: comments.userIds.length,
            };
        },
    },
};

// {
//     getProfileData {
//       posts  {
//         id
//         type
// likes
//     shares
//     comments
//         __typename
//         ...on VideoPost {
//           id, videoLink {
//             videoCode
//           }
//         }
//         ...on ImagePost {
//           id, imageLink {
//             id
//           }
//         }
//       }
//     }
//   }

// Count specific attribute - works only for hasMany association, I cant count JSON attribute
// const [post] = await me.getPosts({
//     where: { id: 1 },
//     attributes: ['Post.*', [models.sequelize.fn('COUNT', 'Like.userIds'), 'PostCount']],
//     include: [models.Like],
//     group: ['Post.id', 'Like.id'],
//     raw: true,
// });
