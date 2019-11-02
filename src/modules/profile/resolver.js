/* eslint-disable no-underscore-dangle */
import { mapCommentsList } from './service';

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
        friends: async (parent, args, { models }) => {
            const { friendIds } = await parent.getFriendList({ attributes: ['friendIds'] });

            return {
                count: friendIds.length,
                list: models.ProfileSettings.findAll({
                    where: { userId: friendIds },
                    limit: 14,
                    attributes: ['id', 'avatar'],
                    raw: true,
                }),
            };
        },
        friendshipRequests: (parent) => parent.getFriendshipRequest(),
        userPhotos: (parent) => parent.getPhotos(),
        authorPosts: async (parent, args, { models }) => {
            const posts = await parent
                .getPosts({
                    include: [
                        // Get posts videoLink, imageLink, likes, shares and comments
                        { model: models.Video, as: 'videoLink' },
                        { model: models.Photo, as: 'imageLink' },
                        { model: models.Like, as: 'likes', attributes: ['userIds'] },
                        { model: models.Share, as: 'shares', attributes: ['userIds'] },
                        {
                            model: models.Comment,
                            as: 'comments',
                            attributes: ['list'],
                            include: [
                                // Main comment likes
                                { model: models.Like, as: 'likes', attributes: ['userIds'] },
                                // Main comment replies
                                {
                                    model: models.Comment,
                                    as: 'replies',
                                    attributes: ['list'],
                                    // Main comment replies likes
                                    include: [{ model: models.Like, as: 'likes', attributes: ['userIds'] }],
                                },
                            ],
                        },
                    ],
                })
                // Remove duplicates
                .reduce((acc, post) => {
                    const index = acc.find((p) => p.id === post.id);
                    if (!index) acc.push(post);
                    return acc;
                }, [])
                .map(async (post) => {
                    const { list, replies, likes } = post.comments;

                    post.likes = {
                        count: post.likes.userIds.length,
                        list: models.ProfileSettings.findAll({
                            where: { userId: post.likes.userIds },
                            attributes: ['id', 'avatar', 'name'],
                        }),
                    };
                    post.shares = post.shares.userIds.length;

                    post.comments = {
                        list: mapCommentsList(list, models.ProfileSettings) || [],
                        replies: {
                            list: replies ? mapCommentsList(replies.list, models.ProfileSettings) : [],
                            replies: [],
                            likes: { count: replies && replies.likes ? replies.likes.userIds.length : 0, list: [] },
                        },
                        likes: {
                            count: likes ? likes.userIds.length : 0,
                            list: likes && likes.userIds.length ? likes.userIds : [],
                        },
                    };

                    return post;
                });
            return posts;
        },
    },

    Query: {
        profileData: (parent, args, { models, user }) => models.User.findOne({ where: { id: user.id } }),
        getPost: async (parent, { postId }, { models, user }) => {
            const me = await models.User.findOne({ where: { id: user.id } });
            // Create post
            const [post] = await me.getPosts({
                where: { id: postId },
                attributes: ['id', 'type', 'title', 'description'],
                include: ['videoLink', 'imageLink'],
            });
            return post;
        },
    },
    Mutation: {
        // Bio fact resolvers
        createBioFact: (_, args, { models, user }) => models.BioFact.create({ ...args, userId: user.id }),
        deleteBioFacts: async (_, { ids }, { models }) =>
            (await models.BioFact.destroy({ where: { id: ids } })) && true,
        updateBioFact: async (_, args, { models, user }) =>
            (await models.BioFact.update(args, { where: { id: args.id } })) && { ...args, userId: user.id },
        // Tweet resolvers
        createTweet: (_, args, { models, user }) => models.Tweet.create({ ...args, userId: user.id }),
        createBlogPost: (_, args, { models, user }) => models.BlogPost.create({ ...args, userId: user.id }),
        createLatestVideo: async (_, args, { models, user }) => {
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
            post.createLikes({ userIds: [] });
            post.createComments({ userIds: [] });
            post.createShares({ list: [] });

            if (postData.type === 'video') link = await post.createVideoLink(videoLink);
            if (postData.type === 'image') link = await post.createImageLink(imageLink);
            return {
                ...post.dataValues,
                [`${postData.type}Link`]: link,
                shares: 0,
                likes: 0,
                comments: [],
            };
        },

        createSharedPost: async (parent, { postId }, { models, user }) => {
            const me = await models.User.findOne({ where: { id: user.id } });
            // Get Post
            const [post] = await me.getPosts({
                where: { id: postId },
                attributes: ['type', 'title', 'description'],
                include: [
                    { model: models.Video, as: 'videoLink', attributes: ['videoCode'] },
                    { model: models.Photo, as: 'imageLink', attributes: ['base64'] },
                ],
            });
            // Create shared post with authorId
            const sharedPost = await me.createSharedPost({ ...post.dataValues, authorId: postId });
            // Create posts videoLink or imageLink, depending of the post type
            if (post.type === 'video') sharedPost.createVideoLink(post.videoLink.dataValues);
            if (post.type === 'image') sharedPost.createImageLink(post.imageLink.dataValues);
            // Create posts's likes, comments and shares
            sharedPost.createLikes({ userIds: [] });
            sharedPost.createComments({ userIds: [] });
            sharedPost.createShares({ userIds: [] });
            return {
                ...sharedPost.dataValues,
                [`${post.type}Link`]: post.videoLink ? post.videoLink : post.imageLink,
                shares: 0,
                likes: 0,
                comments: 0,
            };
        },
    },
};

// Count specific attribute - works only for hasMany association, I cant count JSON attribute
// const [post] = await me.getPosts({
//     where: { id: 1 },
//     attributes: ['Post.*', [models.sequelize.fn('COUNT', 'Like.userIds'), 'PostCount']],
//     include: [models.Like],
//     group: ['Post.id', 'Like.id'],
//     raw: true,
// });
