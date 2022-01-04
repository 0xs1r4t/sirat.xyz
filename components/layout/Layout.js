import styled from "styled-components";
import Head from "next/head";

const Main = styled.main`
   padding: 5vh 20vw;
   font-size: 1.25em;

   display: flex;
   flex-direction: column;
   align-items: stretch;

   @media (max-width: 768px) {
      padding: 7.5vh 7.5vw;
      font-size: 1em;
   }
`;

/*
const Bg = styled.span`
   padding: 5em;
   background: #ffc;
   min-height: 90vh;

   @media (max-width: 768px) {
      min-height: 85vh;
   }
`;
*/

const Layout = ({ children }) => {
   return (
      <>
         <Head>
            <meta
               name="viewport"
               content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
            />
            <meta charSet="utf-8" />
         </Head>
         <Main>{children}</Main>
      </>
   );
};

export default Layout;
