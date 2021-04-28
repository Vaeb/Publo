import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
    @font-face {
        font-family: "Inter";
        src: url("/fonts/Inter-Light.ttf");
        font-style: normal;
        font-weight: 300;
        font-display: swap;
    }

    @font-face {
        font-family: "Inter";
        src: url("/fonts/Inter-Regular.ttf");
        font-style: normal;
        font-weight: 400;
        font-display: swap;
    }

    @font-face {
        font-family: "Inter";
        src: url("/fonts/Inter-Medium.ttf");
        font-style: normal;
        font-weight: 500;
        font-display: swap;
    }

    @font-face {
        font-family: "Inter";
        src: url("/fonts/Inter-Bold.ttf");
        font-style: normal;
        font-weight: 700;
        font-display: swap;
    }

    html {
        overflow-x: hidden;
        margin-right: calc(-1 * (100vw - 100%));
    }

    body {
        margin: 0;
        font-family: 'Inter', 'Segoe UI', 'Roboto', 'Open Sans', 'Helvetica Neue', sans-serif;
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

    .st-button {
        padding: 4px 2px 4px 2px;
        margin-left: 2px;
        margin-right: 2px;
        background: none;
        min-width: initial;
        height: auto;
    }

    .st-button.selected {
        /* background: var(--chakra-colors-gray-200); */
    }

    .st-button:hover {
        background: #333333;
    }

    .st-button.selected:hover {
        background: none;
    }

    .st-button .st-icon {
        width: 21px;
        height: 21px;
        color: #ced4d9;
    }

    .st-button.selected .st-icon {
        color: #333333;
    }

    .sr-icon {
        width: 19px;
        height: 19px;
        margin-right: 6px;
    }

    .interactive {
        cursor: pointer;
    }

    .diff-indicator {
        text-decoration: underline;
        text-decoration-style: dotted;
        text-decoration-color: blue;
    }
`;
