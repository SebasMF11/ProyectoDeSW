import { supabase } from "../integrations/supabase";
import { KEY_STORAGE } from "../const/constants";
import { useNavigate } from "react-router";

function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem(KEY_STORAGE);
    navigate("/auth");
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="hero-section">
          <h1 className="hero-title">Bienvenido a ManteniFácil</h1>
          <p className="hero-subtitle">
            Gestiona el mantenimiento de todos tus dispositivos en un solo lugar
          </p>
        </div>

        <div className="action-bar">
          <h2 className="action-bar-title">Acciones Rápidas</h2>
          <div className="action-bar-buttons">
            <button className="btn-danger" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
