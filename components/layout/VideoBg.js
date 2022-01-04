import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const Video = styled.video`
   object-fit: cover;
   width: 100%;
   height: 100%;
   position: fixed;
   z-index: -1;
   /*
   @media (prefers-color-scheme: dark) {
      filter: contrast(2) brightness(0.35);
   } */
`;

const VideoBg = () => {
   const videoRef = useRef();

   useEffect(() => {
      setTimeout(() => {
         videoRef.current.play();
      }, 5000);
   }, []);

   return (
      <Video ref={videoRef} loop autoPlay muted>
         <source src="/media/clouds.webm" type="video/webm" />
         <source src="/media/clouds.mp4" type="video/mp4" />
      </Video>
   );
};

export default VideoBg;
