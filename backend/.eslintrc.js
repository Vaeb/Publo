module.exports = {
    extends: ['airbnb'], // Can add react settings when needed
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        jquery: true,
    },
    globals: {
        Config: true,
        Util: true,
        Swal: true,
        swal: true,
        moment: true,
        gsap: true,
        // 'DateSlider': true,
        // 'StudentAbsenceFilterController': true,
        // 'TableView': true,
        // 'FilteredStudentSelect': true,
        // 'NewController': true,
        // 'SlideController': true,
        // 'AdminUserDetailsEditController': true,
        // 'AdminUserSelectionController': true,
        // 'AdminStudentBatchController': true,
    },
    plugins: ['prettier'],
    rules: {
        'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
        'class-methods-use-this': [
            'warn',
            {
                exceptMethods: [
                    'render',
                    'getInitialState',
                    'getDefaultProps',
                    'getChildContext',
                    'componentWillMount',
                    'UNSAFE_componentWillMount',
                    'componentDidMount',
                    'componentWillReceiveProps',
                    'UNSAFE_componentWillReceiveProps',
                    'shouldComponentUpdate',
                    'componentWillUpdate',
                    'UNSAFE_componentWillUpdate',
                    'componentDidUpdate',
                    'componentWillUnmount',
                    'componentDidCatch',
                    'getSnapshotBeforeUpdate',
                ],
            },
        ],
        'comma-dangle': 'off',
        // 'default-case': 'off',
        eqeqeq: 'off',
        indent: ['error', 4],
        'func-names': 'off',
        'global-require': 'off',
        'import/no-absolute-path': 'off',
        'import/no-dynamic-require': 'off',
        'import/prefer-default-export': 'off',
        // 'jsx-a11y/href-no-hash': 'off',
        // 'keyword-spacing': 'off', // ---
        // 'linebreak-style': 'off',
        'max-classes-per-file': 'off',
        'max-len': ['warn', { code: 200, tabWidth: 4, ignoreComments: true }],
        'no-bitwise': 'off',
        'no-cond-assign': 'off',
        'no-console': 'off',
        'no-continue': 'off',
        'no-control-regex': 'off',
        'no-eval': 'off',
        'no-extend-native': 'off',
        // 'no-irregular-whitespace': 'off',
        'no-lonely-if': 'off',
        'no-mixed-operators': 'off',
        'no-multi-assign': 'off',
        // 'no-multi-spaces': 'off',
        // 'no-multiple-empty-lines': 'off', // ---
        'no-new': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-prototype-builtins': 'off',
        'no-restricted-syntax': [
            'error',
            {
                selector: 'ForInStatement',
                message:
                    'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
            },
            {
                selector: 'LabeledStatement',
                message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
            },
            {
                selector: 'WithStatement',
                message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
            },
        ],
        'no-script-url': 'off',
        'no-shadow': ['error', { allow: ['_', 'err'] }],
        'no-undef': 'warn',
        'no-underscore-dangle': 'off',
        'no-unused-vars': [
            'warn',
            { vars: 'all', args: 'after-used', ignoreRestSiblings: true, argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^ignore' },
        ],
        'no-var': 'error', // --X
        'object-curly-newline': ['error', { minProperties: 6, multiline: true, consistent: true }],
        'padded-blocks': 'warn', // ---
        'prefer-destructuring': [
            'error',
            {
                array: false,
                object: true,
            },
        ],
        'prefer-promise-reject-errors': 'off',
        semi: ['error', 'always'],
        // 'space-before-blocks': 'off', // ---
        // 'space-before-function-paren': ['warn', {
        //     anonymous: 'always',
        //     named: 'never',
        //     asyncArrow: 'always',
        // }],
        // 'space-in-parens': 'off', // ---
        // 'prettier/prettier': 'error',
        // 'quote-props': 'off'
    },
};
