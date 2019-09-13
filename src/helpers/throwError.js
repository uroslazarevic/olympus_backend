import { ApolloError } from 'apollo-server';

export const throwError = (message, code, path) => {
    const error = {
        message,
        code,
        exception: { error: message, path },
    };
    return new ApolloError(message, code, error.exception);
};
