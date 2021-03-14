module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2021,
        ecmaFeatures: {
            jsx: true,
        },
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'react',
    ],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'airbnb-typescript/base',
    ],
    rules: {
        'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
        // "class-methods-use-this": "off",
        '@typescript-eslint/comma-dangle': [
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
        // * 'implicit-arrow-linebreak': 'off',
        'import/no-dynamic-require': 'off',
        '@typescript-eslint/indent': ['error', 4],
        // "func-names": "off",
        'global-require': 'off',
        'import/extensions': 'off',
        'import/prefer-default-export': 'off',
        // * 'jsx-a11y/anchor-is-valid': 'off',
        // * 'jsx-a11y/href-no-hash': 'off',
        // "linebreak-style": "off",
        'max-len': ['error', { code: 186, tabWidth: 4, ignoreComments: true }],
        'no-async-promise-executor': 'off',
        // "no-bitwise": "off",
        'no-cond-assign': 'off',
        'no-console': 'off',
        'no-continue': 'off',
        'no-control-regex': 'off',
        // * 'no-else-return': 'off',
        // * 'no-empty': ['error', { allowEmptyCatch: true }],
        'no-eval': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-extend-native': 'off',
        // "no-irregular-whitespace": "off",
        // "no-lonely-if": "off",
        'no-mixed-operators': 'off',
        // "no-multi-spaces": "off",
        '@typescript-eslint/naming-convention': 'off',
        // * 'no-nested-ternary': 'off',
        'no-new': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-prototype-builtins': 'off',
        // * 'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off',
        'no-underscore-dangle': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
        'object-curly-newline': ['error', { minProperties: 6, multiline: true, consistent: true }],
        'prefer-destructuring': [
            'error',
            {
                array: false,
                object: true,
            },
        ],
        'react/destructuring-assignment': 'off',
        'react/jsx-filename-extension': 'off',
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-one-expression-per-line': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/jsx-wrap-multilines': [
            'error',
            {
                declaration: true,
                assignment: true,
                return: true,
                arrow: true,
            },
        ],
        'react/no-unused-state': 'warn',
        'react/prop-types': 'off',
        'react/self-closing-comp': 'warn',
        'react/sort-comp': [
            2,
            {
                order: ['static-methods', 'lifecycle', 'everything-else', 'render'],
                groups: {
                    lifecycle: [
                        'displayName',
                        'propTypes',
                        'contextTypes',
                        'childContextTypes',
                        'mixins',
                        'statics',
                        'defaultProps',
                        'constructor',
                        'getDefaultProps',
                        'state',
                        'getInitialState',
                        'getChildContext',
                        'getDerivedStateFromProps',
                        'componentWillMount',
                        'UNSAFE_componentWillMount',
                        'componentDidMount',
                        'componentWillReceiveProps',
                        'UNSAFE_componentWillReceiveProps',
                        'shouldComponentUpdate',
                        'componentWillUpdate',
                        'UNSAFE_componentWillUpdate',
                        'getSnapshotBeforeUpdate',
                        'componentDidUpdate',
                        'componentDidCatch',
                        'componentWillUnmount',
                    ],
                },
            },
        ],
    },
};
