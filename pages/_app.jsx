import Global from "@components/Global";
import Layout from "@components/Layout";

const MyApp = ({ Component, pageProps }) => {
   return (
      <>
         <Global />
         <Layout>
            <Component {...pageProps} />
         </Layout>
      </>
   );
};

export default MyApp;
