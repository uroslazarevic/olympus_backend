export const seedDummyUsers = (models) => {
    // password  = 12345
    const users = [
        {
            id: 1000,
            username: 'bot0',
            email: 'bot0@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: '',
            avatar: '',
            pseudonym: '',
        },
        {
            id: 1001,
            username: 'bot1',
            email: 'bot1@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: '',
            avatar: '',
            pseudonym: '',
        },
        {
            id: 1002,
            username: 'bot2',
            email: 'bot2@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: '',
            avatar: '',
            pseudonym: '',
        },
        {
            id: 1003,
            username: 'bot3',
            email: 'bot3@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: '',
            avatar: '',
            pseudonym: '',
        },
        {
            id: 1004,
            username: 'bot4',
            email: 'bot4@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: '',
            avatar: '',
            pseudonym: '',
        },
        {
            id: 1005,
            username: 'bot5',
            email: 'bot5@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: '',
            avatar: '',
            pseudonym: '',
        },
        {
            id: 1006,
            username: 'bot6',
            email: 'bot6@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: '',
            avatar: '',
            pseudonym: '',
        },
        {
            id: 1007,
            username: 'bot7',
            email: 'bot7@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: '',
            avatar: '',
            pseudonym: '',
        },
        {
            id: 1008,
            username: 'bot8',
            email: 'bot8@gmail.com',
            password: '$2b$12$EHR5LXO16B39.j28kTEDqOiRB8yEnnq9udugHUc2U1Akc93ws8czW',
            isAdmin: false,
            name: '',
            avatar: '',
            pseudonym: '',
        },
    ];

    return models.User.bulkCreate(users);
};

export const getFirstDummyUser = (models) => models.User.findOne({ where: { id: 1000 }, raw: true });

export const unseedDummyUsers = (models) => {
    const idArr = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008];
    models.User.delete({ where: { id: idArr } });
};
