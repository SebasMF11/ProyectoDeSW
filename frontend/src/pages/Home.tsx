import { supabase } from "../integrations/supabase";
import { KEY_STORAGE } from "../const/constants";
import { useNavigate } from "react-router";
import BigCalendar from "../components/BigCalendar";
import Navbar from "../components/navbar";

function Home() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem(KEY_STORAGE);
    navigate("/auth");
  };
  const handleSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log(session);
  };

  return (
    <div>
      <Navbar />

      <div className="bg-white bgrelative w-full min-h-screen flex items-center justify-center">
        <div>
          <BigCalendar />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Tus clases hoy</h1>

          <h1 className="text-3xl font-bold text-blue-600">Eventos</h1>
          <button
            className="bg-blue-500 text-white p-2 rounded"
            onClick={handleSession}
          >
            View Session
          </button>
          <button onClick={handleLogout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
