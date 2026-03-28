import logo from "../assets/logo2.png";
import { MdMenu } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";

function navbar() {
  return (
    <div className="w-full flex items-center justify-between bg-[#009853] p-2">
      <div className="flex items-center gap-2">
        <MdMenu size={30} color="white" />
        <img src={logo} alt="Logo" className="h-10 w-10" />
        <p className="text-[25px] font-bold font-sans text-white">PoliPlan</p>
      </div>

      <div className="flex items-center px-4 gap-3">
        <FiUser size={30} color="white" />
        <p className="text-white">Usuario</p>
        <IoMdSettings size={30} color="white" />
        <IoIosLogOut size={30} color="white" />
      </div>
    </div>
  );
}

export default navbar;
