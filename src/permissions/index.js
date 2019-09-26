const createResolver = (resolver) => {
    const baseResolver = resolver;
    baseResolver.createResolver = (childResolver) => {
        const newResolver = async (parent, args, context) => {
            await resolver(parent, args, context);
            return childResolver(parent, args, context);
        };
        return createResolver(newResolver);
    };
    return baseResolver;
};

const requiresAuth = createResolver((parent, args, context) => {
    console.log('<< REQUIRES Auth called >>');
    // dobijamo contex
    // console.log('context', context);
    if (!context.user) {
        throw new Error('Not authenticated');
    }
});

const requiresAdmin = requiresAuth.createResolver((parent, args, context) => {
    console.log('<< REQUIRES ADMIN called >>');
    if (!context.user.isAdmin) {
        throw new Error('Requires admin access');
    }
});

// const bannedUsernameCheck = requiresAdmin.createResolver((parent, args, context) => {
//     console.log('bannedUsernameCheck called');
//     if (context.user.username === 'don') {
//         throw new Error('Banned username');
//     }
// });

export { requiresAuth, requiresAdmin };
