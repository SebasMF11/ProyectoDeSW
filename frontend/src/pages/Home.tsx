import { supabase } from "../integrations/supabase";
import { useState } from "react";
import Calendar from "../components/calendar/Calendar";
import Navbar from "../components/navbar";
import { format } from "date-fns";

function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log(session);
  };

  return (
    <div>
      <Navbar />

      <div className="bg-white  grid grid-cols-2 gab-2 h-screen ">
        {/*   ----------------- */}
        <div className="flex justify-center pt-5">
          {/*   ----------------- */}
          <Calendar onSelectDate={(date) => setSelectedDate(date)} />
        </div>
        <div className="flex flex-col justify-items-start pt-10">
          {/*   ----------------- */}
          <div>
            <p className="inline-block bg-gray-200 text-gray-600 px-5 py-2 rounded-full text-[20px] font-semibold">
              {format(selectedDate, "MMMM d', ' yyyy")}
            </p>
          </div>{" "}
          <div className="pl-10">
            <p className="text-[25px] font-bold text-black pt-10">
              Your classes today
            </p>
            <div className="pl-10 pt-2 text-gray-600">
              <p>You dont have classes</p>
            </div>
            <p className="text-[25px] font-bold text-black pt-8">Events</p>

            <div className="pl-10 pt-2 text-gray-600">
              <p>You dont have events</p>
            </div>
          </div>
          <button className="w-50 text-white rounded" onClick={handleSession}>
            View Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
