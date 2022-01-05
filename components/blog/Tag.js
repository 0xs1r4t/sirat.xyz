import styled from "styled-components";

const Tag = styled.span`
   color: #fff;
   background: #000;
   padding: 1px 7.5px 2.5px 7.5px;
   margin: 5px;
   border-radius: 7.5px;

   @media (prefers-color-scheme: dark) {
      color: #fff;
      background: #000;
   }
`;

export default Tag;
