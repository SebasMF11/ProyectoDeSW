import { supabase } from "../integrations/supabase";
import { KEY_STORAGE } from "../const/constants";
import { useNavigate } from "react-router";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

function Home() {
  const localizer = momentLocalizer(moment);
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
      <h1 className="text-3xl font-bold text-blue-600">Hola</h1>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={handleSession}
      >
        Ver Session
      </button>
      <button onClick={handleLogout}>Cerrar Sesión</button>
      <Calendar
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}

export default Home;
