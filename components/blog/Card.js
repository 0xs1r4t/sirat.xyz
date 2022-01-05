import styled from "styled-components";

const Card = styled.div`
   margin: 2em;
   padding: 0em 1em 0.1em 1em;
   color: #000;
   background: #fff;
   border: 2px solid #000;
   border-radius: 15px;

   @media (prefers-color-scheme: dark) {
      color: #fff;
      background: #000;
      border: 2px solid #fff;
   }
`;

export default Card;
