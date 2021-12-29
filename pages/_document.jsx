import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";

const APP_NAME = "Sirat Baweja";
const APP_DESCRIPTION = "This is Sirat Baweja's website. Click here to find out more about her.";
class MyDocument extends Document {
   static async getInitialProps(ctx) {
      const sheet = new ServerStyleSheet();
      const originalRenderPage = ctx.renderPage;

      try {
         ctx.renderPage = () =>
            originalRenderPage({
               enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
            });

         const initialProps = await Document.getInitialProps(ctx);
         return {
            ...initialProps,
            styles: (
               <>
                  {initialProps.styles}
                  {sheet.getStyleElement()}
               </>
            ),
         };
      } finally {
         sheet.seal();
      }
   }

   render() {
      return (
         <Html lang="en" dir="ltr">
            <Head>
               <meta name="application-name" content={APP_NAME} />
               <meta name="apple-mobile-web-app-capable" content="yes" />
               <meta name="apple-mobile-web-app-status-bar-style" content="default" />
               <meta name="apple-mobile-web-app-title" content={APP_NAME} />
               <meta name="description" content={APP_DESCRIPTION} />
               <meta name="format-detection" content="telephone=no" />
               <meta name="mobile-web-app-capable" content="yes" />
               <meta name="theme-color" content="#000000" />

               <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
               <link rel="shortcut icon" href="/icons/favicon.ico" />

               <link rel="preconnect" href="https://fonts.googleapis.com" />
               <link rel="preconnect" href="https://fonts.gstatic.com" />
               <link
                  href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
                  rel="stylesheet"
               />
            </Head>
            <body>
               <Main />
               <NextScript />
               <script
                  defer
                  src="https://static.cloudflareinsights.com/beacon.min.js"
                  data-cf-beacon='{"token": "49140d9fed1e4b28a59e8962efd8ef27"}'
               />
               <style jsx global>{`
                  /* global style override */

                  #__next {
                     height: 100%;
                  }
               `}</style>
            </body>
         </Html>
      );
   }
}

export default MyDocument;
