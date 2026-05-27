import { useDailyClasses } from "../hooks/useDailyClasses";

type DailyClassesListProps = {
  selectedDate: Date;
  selectedSemester: string;
};

export default function DailyClassesList({
  selectedDate,
  selectedSemester,
}: DailyClassesListProps) {
  const { classes, loading, errorMessage } = useDailyClasses(
    selectedDate,
    selectedSemester,
  );

  if (!selectedSemester) {
    return <p className="text-gray-500">Select a semester to see classes.</p>;
  }

  if (loading) {
    return <p className="text-gray-500">Loading classes...</p>;
  }

  if (errorMessage) {
    return <p className="text-red-600 text-sm">{errorMessage}</p>;
  }

  if (classes.length === 0) {
    return (
      <p className="text-gray-500">You don't have classes for this day.</p>
    );
  }

  return (
    <div className="space-y-2">
      {classes.map((classItem) => (
        <div
          key={classItem.dayId}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {classItem.courseName}
              </p>
              <p className="text-xs text-gray-600">
                {classItem.startTime} - {classItem.endTime}
              </p>
            </div>
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: classItem.color }}
              aria-hidden="true"
            />
          </div>

          {classItem.classroom ? (
            <p className="mt-1.5 text-xs text-gray-500">
              Classroom: {classItem.classroom}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
