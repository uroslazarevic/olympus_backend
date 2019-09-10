import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcrypt';

const createTokens = async (user) => {
    const createToken = jwt.sign({ user: _.pick(user, ['id', 'isAdmin']) }, process.env.SECRET, { expiresIn: '20m' });
    const createRefreshToken = jwt.sign({ user: _.pick(user, ['id']) }, process.env.SECRET, { expiresIn: '7d' });
    return Promise.all([createToken, createRefreshToken]);
};

const refreshTokens = async (token, refreshToken, models) => {
    let userId = -1;
    try {
        const {
            user: { id },
        } = jwt.verify(refreshToken, process.env.SECRET);
        userId = id;
    } catch (err) {
        return {};
    }

    const user = await models.User.findOne({ where: { id: userId }, raw: true });
    const [newToken, newRefreshToken] = await createTokens(user);
    return {
        token: newToken,
        refreshToken: newRefreshToken,
        user,
    };
};

const tryLogin = async (email, password, models) => {
    const user = await models.User.findOne({ where: { email }, raw: true });
    if (!user) {
        // user with provided email not found
        throw new Error('Invalid login');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        // Bad password
        throw new Error('Invalid login');
    }

    const [token, refreshToken] = await createTokens(user);

    return {
        token,
        refreshToken,
    };
};

export { refreshTokens, tryLogin };
