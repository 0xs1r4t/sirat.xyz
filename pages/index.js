import styled from "styled-components";

import { Meta } from "../components/Layout";
import { WebGif } from "../components/index/Images";
import Content from "../components/index/Content";
import Credits from "../components/index/Credits";

const Styles = styled.div`
    height: 90vh;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: "Avara", serif !important;

    @media (max-width: 768px) {
        font-size: 0.75em;
    }

    @media (max-width: 500px) {
        font-size: 0.5em;
    }
`;

const Home = () => {
    return (
        <Styles>
            <Meta title="home" desc="this is the home page" />
            <WebGif />
            <Content />
            <Credits />
        </Styles>
    );
};

export default Home;
