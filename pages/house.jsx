import Meta from "@components/layout/Meta";
import House from "@components/models/House";

const Home = () => {
   return (
      <>
         <Meta title="house" description="a cute house" />
         <h1>house</h1>
         <House />
      </>
   );
};

export default Home;
