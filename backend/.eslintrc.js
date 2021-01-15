module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
        // "class-methods-use-this": "off",
        'comma-dangle': [
            'error',
            {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'never',
            },
        ],
        // "default-case": "off",
        eqeqeq: 'off',
        'import/no-dynamic-require': 'off',
        indent: ['error', 4],
        // "func-names": "off",
        'global-require': 'off',
        'import/extensions': 'off',
        'import/prefer-default-export': 'off',
        // "jsx-a11y/href-no-hash": "off",
        // "linebreak-style": "off",
        'max-len': ['error', { code: 186, tabWidth: 4, ignoreComments: true }],
        'no-async-promise-executor': 'off',
        // "no-bitwise": "off",
        'no-cond-assign': 'off',
        'no-console': 'off',
        'no-continue': 'off',
        'no-control-regex': 'off',
        'no-eval': 'off',
        'no-extend-native': 'off',
        // "no-irregular-whitespace": "off",
        // "no-lonely-if": "off",
        'no-mixed-operators': 'off',
        // "no-multi-spaces": "off",
        'no-new': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-prototype-builtins': 'off',
        'no-restricted-syntax': 'off',
        'no-underscore-dangle': 'off',
        'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
        'object-curly-newline': ['error', { minProperties: 5, multiline: true, consistent: true }],
        'prefer-destructuring': [
            'error',
            {
                array: false,
                object: true,
            },
        ],
    // "quote-props": "off"
    },
};