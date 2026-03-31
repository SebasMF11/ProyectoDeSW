import { format, isSameDay, isSameMonth } from "date-fns";
import type { DayCellProps } from "./calendarTypes";
import {
  EVENTS,
  getExamWeek,
  getExamPosition,
  getHighlightClass,
} from "./calendarHelpers";

//Este componente representa cada celda (dia) del calendario, mostrando el día y los eventos asociados. Se resalta el día seleccionado y se indican los días que pertenecen al mes actual. Además, se aplican estilos especiales para las semanas de exámenes.

export default function DayCell({
  day,
  selected,
  currentMonth,
  onSelect,
}: DayCellProps) {
  // Obtener información de la semana de exámenes y su posición para aplicar estilos
  const examWeek = getExamWeek(day);
  const examPos = getExamPosition(day, examWeek);

  // Verificar si el día es el seleccionado y si pertenece al mes actual
  const isSelected = isSameDay(day, selected);
  const isCurrentMonth = isSameMonth(day, currentMonth);

  // Obtener eventos para el día actual
  const key = day.toISOString().split("T")[0];
  const dots = EVENTS[key] ?? [];

  return (
    <div
      onClick={() => isCurrentMonth && onSelect(day)}
      className={`relative flex flex-col items-center py-1 min-h-[44px] ${
        isCurrentMonth ? "cursor-pointer" : "cursor-default"
      } ${getHighlightClass(examPos)}`}
    >
      <div
        className={`relative z-10 w-[34px] h-[34px] flex items-center justify-center
          rounded-full text-sm transition-all
          ${isSelected ? "bg-gray-400 text-white font-medium" : ""}
          ${!isSelected && isCurrentMonth ? "text-gray-800 hover:bg-gray-100" : ""}
          ${!isCurrentMonth ? "text-gray-300" : ""}
        `}
      >
        {format(day, "d")}
      </div>

      {dots.length > 0 && (
        <div className="flex gap-[3px] mt-[2px] z-10">
          {dots.map((color, i) => (
            <div
              key={i}
              className="w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
