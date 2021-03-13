import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
    html {
        overflow-x: hidden;
        margin-right: calc(-1 * (100vw - 100%));
    }

    body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        line-height: 1.5715;
    }

    code {
        font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    }

    .js-focus-visible :focus:not([data-focus-visible-added]) {
        outline: none;
        box-shadow: none;
    }

    .side-padding {
        padding-left: 10px;
        padding-right: 10px;
    }
`;
