import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import { throwError } from '../helpers/throwError';

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
        userData: {
            username: user.username,
            id: user.id,
        },
    };
};

const tryLogin = async (email, password, models) => {
    const user = await models.User.findOne({ where: { email }, raw: true });

    if (!user) {
        // user with provided email not found
        return throwError("User with this email doesn't exists", 401, 'email');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        // Bad password
        return throwError('Invalid password', 401, 'password');
    }

    const [token, refreshToken] = await createTokens(user);
    console.log('userData', {
        username: user.username,
        id: user.id,
    });
    return {
        token,
        refreshToken,
        userData: {
            username: user.username,
            id: user.id,
        },
    };
};

export { refreshTokens, tryLogin };
