export const profileResolver = {
    ProfileData: {
        latestVideos: (parent) => parent.getLatestVideos({ include: ['videoRecord'] }),
        profileIntro: (parent) => parent.getBioFacts(),
        twitterFeed: (parent) => parent.getTweets(),
        blogPosts: (parent) => parent.getBlogPosts(),
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
    },
};
