import { createGlobalStyle } from "styled-components";

const Global = createGlobalStyle`
    html,
    body {
        padding: 0;
        margin: 0;
        height: 100%;
        width: 100%;
        font-family: "Inter", -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    }

    body {
        -webkit-font-smoothing: antialiased;
        -webkit-text-size-adjust: 100%;
        -moz-osx-font-smoothing: grayscale;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    * {
        box-sizing: border-box;
    }
`;

export default Global;
