import { useEffect, useMemo, useState } from "react";
import { semesterViewRequest } from "../api/semester";
import { toSortableTimestamp } from "../utils/date";

export type Semester = {
  semester_id: number;
  semester_name: string;
  start_date?: string;
  end_date?: string;
};

const getLatestSemesterName = (semesters: Semester[]) => {
  if (semesters.length === 0) return "";

  const sortedSemesters = [...semesters].sort((a, b) => {
    const endDateDifference =
      toSortableTimestamp(b.end_date) - toSortableTimestamp(a.end_date);

    if (endDateDifference !== 0) return endDateDifference;

    return (
      toSortableTimestamp(b.start_date) - toSortableTimestamp(a.start_date)
    );
  });

  return sortedSemesters[0].semester_name;
};

const useSemesters = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [semesterError, setSemesterError] = useState("");

  const latestSemesterName = useMemo(
    () => getLatestSemesterName(semesters),
    [semesters],
  );

  const loadSemesters = async () => {
    try {
      setLoadingSemesters(true);
      setSemesterError("");
      const { data } = await semesterViewRequest();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setSemesters([]);
      setSemesterError("No se pudieron cargar los semestres");
    } finally {
      setLoadingSemesters(false);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  return {
    semesters,
    setSemesters,
    loadingSemesters,
    semesterError,
    latestSemesterName,
    reloadSemesters: loadSemesters,
  };
};

export default useSemesters;
