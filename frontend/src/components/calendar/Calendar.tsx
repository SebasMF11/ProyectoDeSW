import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { CalendarProps } from "./calendarTypes";
import DayCell from "./DayCell";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar({ onSelectDate }: CalendarProps) {
  // Estado para el mes actual mostrado y el día seleccionado
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date>(new Date());

  // Calcular el rango de días a mostrar en el calendario, incluyendo días del mes anterior y siguiente para completar las semanas
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  //Esta variable memoiza el array de días a mostrar en el calendario, recalculándolo solo cuando cambian las fechas de inicio o fin del calendario. Esto mejora el rendimiento al evitar cálculos innecesarios en cada renderizado.
  const days = useMemo(
    () => eachDayOfInterval({ start: calStart, end: calEnd }),
    [calStart, calEnd],
  );

  //Funcion para actualizar el dia seleccionado y llamar al callback externo cuando se selecciona un día. Solo permite seleccionar días que pertenecen al mes actual.
  const handleSelect = (day: Date) => {
    setSelected(day);
    onSelectDate?.(day);
  };

  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-center gap-5 mb-5">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FiChevronLeft size={20} />
        </button>

        <span className="text-xl font-medium text-gray-800 w-32 text-center capitalize">
          {format(currentMonth, "MMMM", { locale: es })}
        </span>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Labels días */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-gray-400 font-medium pb-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            selected={selected}
            currentMonth={currentMonth}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
