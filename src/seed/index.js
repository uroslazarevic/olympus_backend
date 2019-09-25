export const seedDummyUsers = (models) => {
    // password  = 12345
    const users = [
        {
            id: 1000,
            username: 'bot0',
            email: 'bot0@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: 'Bot',
            avatar:
                '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',
            pseudonym: 'bot',
        },
    ];

    return models.User.bulkCreate(users);
};

export const getFirstDummyUser = (models) => models.User.findOne({ where: { id: 1000 }, raw: true });

export const unseedDummyUsers = (models) => {
    const idArr = [1000];
    models.User.delete({ where: { id: idArr } });
};
