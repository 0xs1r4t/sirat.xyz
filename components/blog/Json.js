import styled from "styled-components";

const Json = styled.pre`
   margin: 2em;
   padding: 1em;
   color: #000;
   background: #fff;
   border: 2px solid #000;
   border-radius: 15px;
   overflow-x: hidden;

   @media (prefers-color-scheme: dark) {
      color: #fff;
      background: #000;
      border: 2px solid #fff;
   }
`;

export default Json;
