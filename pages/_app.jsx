import Global from "@components/Global";
import Layout from "@components/layout/Layout";
import VideoBg from "@components/layout/VideoBg";

const MyApp = ({ Component, pageProps }) => {
   return (
      <>
         <Global />
         <VideoBg />
         <Layout>
            <Component {...pageProps} />
         </Layout>
      </>
   );
};

export default MyApp;
