import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";

// --- Tipos ---
interface ExamWeek {
  start: Date;
  end: Date;
}

interface CalendarProps {
  onSelectDate?: (date: Date) => void;
}

// --- Datos ---
const EXAM_WEEKS: ExamWeek[] = [
  { start: new Date(2026, 2, 16), end: new Date(2026, 2, 22) },
];

const EVENTS: Record<string, string[]> = {
  "2026-03-16": ["#e53935"],
  "2026-03-22": ["#1976d2"],
  "2026-03-14": ["#7b1fa2"],
  "2026-03-24": ["#2e7d32"],
  "2026-03-26": ["#f9a825"],
};

// --- Helpers ---
function getExamWeek(date: Date): ExamWeek | null {
  return EXAM_WEEKS.find((w) => date >= w.start && date <= w.end) ?? null;
}

function getExamPosition(
  date: Date,
  week: ExamWeek | null,
): "start" | "mid" | "end" | "full" | null {
  if (!week) return null;
  const isStart = isSameDay(date, week.start);
  const isEnd = isSameDay(date, week.end);
  if (isStart && isEnd) return "full";
  if (isStart) return "start";
  if (isEnd) return "end";
  return "mid";
}

const highlightClasses: Record<string, string> = {
  start: "before:left-0 before:right-0 before:rounded-l-full before:border-r-0",
  mid: "before:left-0 before:right-0 before:rounded-none before:border-x-0",
  end: "before:left-0 before:right-0 before:rounded-r-full before:border-l-0",
  full: "before:left-2 before:right-2 before:rounded-full",
};

// --- Componente ---
export default function Calendar({ onSelectDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleSelect = (day: Date): void => {
    setSelected(day);
    onSelectDate?.(day);
  };

  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-[590px] p-8">
      {/* Header mes */}
      <div className="flex items-center justify-center gap-5 mb-5">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="text-gray-500 hover:text-gray-700 bg-white"
        >
          ◀
        </button>
        <span className="text-[26px] font-medium text-gray-800 w-32 text-center capitalize">
          {format(currentMonth, "MMMM")}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="text-gray-500 hover:text-gray-700 px-3 py-1 transition-colors"
        >
          ▶
        </button>
      </div>

      {/* Labels días */}
      <div className="grid grid-cols-7 mb-1">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
          <div
            key={d}
            className="text-center text-xs text-gray-400 font-medium pb-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Días */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const examWeek = getExamWeek(day);
          const examPos = getExamPosition(day, examWeek);
          const isSelected = isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const key = format(day, "yyyy-MM-dd");
          const dots: string[] = EVENTS[key] ?? [];

          return (
            <div
              key={key}
              onClick={() => isCurrentMonth && handleSelect(day)}
              className={`
                relative flex flex-col items-center py-1 min-h-[58px] cursor-pointer
                ${
                  examPos
                    ? `before:absolute before:inset-y-[2px] before:content-['']
                     before:bg-green-50 before:border before:border-green-600
                     before:z-0 ${highlightClasses[examPos]}`
                    : ""
                }
              `}
            >
              <div
                className={`
                  relative z-10 w-[44px] h-[44px] text-[17px] flex items-center justify-center
                  rounded-full transition-colors
                  ${isSelected ? "bg-gray-400 text-white font-medium" : ""}
                  ${!isSelected && isCurrentMonth ? "text-gray-800 hover:bg-gray-100" : ""}
                  ${!isCurrentMonth ? "text-gray-300" : ""}
                `}
              >
                {format(day, "d")}
              </div>

              {/* Puntos de eventos */}
              {dots.length > 0 && (
                <div className="flex gap-[3px] mt-[2px] z-10">
                  {dots.map((color, i) => (
                    <div
                      key={i}
                      className="w-[7px] h-[7px] gap-[4px] rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
