import styled from "styled-components";
import Link from "next/link";

const Button = styled.button`
   margin: 10px 20px 10px 0;
   padding: 7.5px 12.5px;
   background: #262433;
   color: #fff;
   border: 2px solid #0000;
   border-radius: 10px;
   font-size: 20px;
   align-self: flex-start;

   :hover {
      outline: none;
      border: 2px solid #00bfff;
      box-shadow: 0 0 5px #00bfff;
   }

   :focus {
      transform: scale(0.95);
   }
`;

const LinkBtn = ({ route, children }) => {
   return (
      <Button>
         <Link to={route} href={route}>
            <a>{children}</a>
         </Link>
      </Button>
   );
};

export default LinkBtn;
