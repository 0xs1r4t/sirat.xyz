import Meta from "@components/layout/Meta";
import Models from "@components/models/Models";
import Contact from "@components/models/Contact";
import House from "@components/models/House";

const Home = () => {
   return (
      <>
         <Meta title="models test" description="under construction!" />
         <h1>i just wanna test my models</h1>
         <p>
            hey there! if you've stumbled upon here, you can't see anything yet because this website
            is under construction. this won't take too long, and my previous website was cute but
            incomplete, so i really need to do this.
         </p>
         <Models />
         {/* <Contact />
         <House /> */}
      </>
   );
};

export default Home;
