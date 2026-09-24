import { useNavigate } from "react-router";
import { supabase } from "../../integrations/supabase";

const settings = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/auth");
  };

  const cancelSemester = async () => {
    //esta no me la se
    //yo si
  };

  return (
    <div>
      <div>
        <p>CONFIGURACIÓN</p>
        <span className="cursor-pointer" onClick={() => navigate("/profile")}>
          Información del perfil
        </span>
        <span className="cursor-pointer" onClick={cancelSemester}>
          Cancelar semestre
        </span>
        <span className="underline cursor-pointer" onClick={handleLogout}>
          Cerrar sesión
        </span>
      </div>
    </div>
  );
};
export default settings;
