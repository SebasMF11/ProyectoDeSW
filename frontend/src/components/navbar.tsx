import { supabase } from "../integrations/supabase";
import { useNavigate } from "react-router";
import logo from "../assets/logo2.png";
import { FiUser } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import Menu from "./menu";

function navbar() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/auth");
  };

  return (
    <div className="w-full flex items-center justify-between bg-[#009853] p-2">
      <div className="flex items-center gap-2">
        <Menu />
        <img src={logo} alt="Logo" className="h-10 w-10" />
        <p className="text-[25px] font-bold font-sans text-white">PoliPlan</p>
      </div>

      <div className="flex items-center px-10 gap-3">
        <div className="flex items-center px-20 gap-3">
          <FiUser
            size={30}
            color="white"
            className="cursor-pointer"
            onClick={() => navigate("/profile")}
          />
          <p className="text-white">User</p>
        </div>
        <IoMdSettings
          size={30}
          color="white"
          onClick={() => navigate("/settings")}
          className="cursor-pointer"
        />
        <IoIosLogOut
          onClick={handleLogout}
          size={35}
          color="white"
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}

export default navbar;
