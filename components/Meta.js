import Head from "next/head";

const Meta = ({ title, description, favicon }) => {
   return (
      <Head>
         <title>{title}</title>
         <meta name="description" content={description} />
         if (favicon !== undefined) {<link rel="icon" href={favicon} />}
      </Head>
   );
};

export default Meta;
