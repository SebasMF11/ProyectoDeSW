import { supabase } from "../integrations/supabase";
import Calendar from "../components/calendar/Calendar";
import Navbar from "../components/navbar";

function Home() {
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
          <Calendar />
        </div>
        <div>
          <p className="inline-block bg-gray-200 text-gray-600 px-5 py-2 rounded-full text-[20px] font-semibold">
            Day 1 11 asldk
          </p>
          <p className="text-[25px] font-bold text-black">Your classes today</p>

          <p className="text-[25px] font-bold text-black">Events</p>
          <button
            className="bg-blue-500 text-white p-2 rounded"
            onClick={handleSession}
          >
            View Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
