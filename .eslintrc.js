module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: ['airbnb-base'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        indent: [
            'error',
            4,
            {
                FunctionDeclaration: {
                    parameters: 'first',
                },
                FunctionExpression: {
                    parameters: 'first',
                },
                SwitchCase: 1,
            },
        ],
        'max-len': [
            'error',
            {
                code: 120,
            },
        ],
        'comma-dangle': 'off',
        'no-console': 'off',
        'implicit-arrow-linebreak': 'off',
        'function-paren-newline': 'off',
        'import/prefer-default-export': 'off',
        'object-curly-newline': 'off',
    },
};
