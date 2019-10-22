export const mapCommentsList = (list, ProfileSettings) =>
    Promise.all(
        list.map(async (user) => ({
            ...user,
            ...(await ProfileSettings.findOne({
                where: { userId: user.id },
                attributes: ['name', 'avatar'],
                raw: true,
            })),
        }))
    );
