import { createGlobalStyle } from "styled-components";

const Global = createGlobalStyle`
    @font-face {
        font-family: "W95FA";
        src: url("/fonts/W95FA/w95fa.woff") format("woff"),
            url("/fonts/W95FA/w95fa.woff2") format("woff2");
        font-style: normal;
        font-weight: normal;
        font-display: optional;
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
            U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
            U+FEFF, U+FFFD;
    }

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
