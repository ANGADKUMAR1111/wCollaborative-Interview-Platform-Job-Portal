import  { useContext } from "react";
import { Context } from "../../main";
import { Link } from "react-router-dom";
import { CiLinkedin } from "react-icons/ci";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";


const Footer = () => {
  const { isAuthorized } = useContext(Context);
  return (
    <footer className={isAuthorized ? "footerShow" : "footerHide"}>
      <div>&copy; All Rights Reserved By @AngadKumar.</div>
      <div>
        <Link
          to={"https://www.linkedin.com/in/angad-kumar-95a367251/"}
          target="_blank"
        >
          <CiLinkedin />
        </Link>

        <Link to={"https://github.com/ANGADKUMAR1111/"} target="_blank">
          <FaGithub />
        </Link>
        <Link to={"https://leetcode.com/u/angadkumar1860053/"} target="_blank">
          <SiLeetcode />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
