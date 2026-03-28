import { supabase } from "../integrations/supabase";
import { KEY_STORAGE } from "../const/constants";
import { useNavigate } from "react-router";
import logo from "../assets/logo2.png";
import { MdMenu } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";

function navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem(KEY_STORAGE);
    navigate("/auth");
  };

  return (
    <div className="w-full flex items-center justify-between bg-[#009853] p-2">
      <div className="flex items-center gap-2">
        <MdMenu size={30} color="white" />
        <img src={logo} alt="Logo" className="h-10 w-10" />
        <p className="text-[25px] font-bold font-sans text-white">PoliPlan</p>
      </div>

      <div className="flex items-center px-10 gap-3">
        <div className="flex items-center px-20 gap-3">
          <FiUser size={30} color="white" />
          <p className="text-white">User</p>
        </div>
        <IoMdSettings size={30} color="white" />
        <IoIosLogOut onClick={handleLogout} size={35} color="white" />
      </div>
    </div>
  );
}

export default navbar;
