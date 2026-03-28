import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

function BigCalendar() {
  const localizer = momentLocalizer(moment);

  return (
    <div className="w-full calendar-container">
      <Calendar
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, color: "gray" }}
      />
    </div>
  );
}

export default BigCalendar;
