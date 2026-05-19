import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { semesterCreateRequest, semesterViewRequest } from "../api/semester";
import axios from "axios";
import { useEffect, useState } from "react";

type SemesterItem = {
  semester_id: string;
  name: string;
  start_date: string;
  end_date: string;
};

const overlaps = (
  startDate: string,
  endDate: string,
  existing: SemesterItem,
) => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const existingStart = new Date(`${existing.start_date}T00:00:00Z`);
  const existingEnd = new Date(`${existing.end_date}T00:00:00Z`);
  return start < existingEnd && end > existingStart;
};

const Semester = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const { register, handleSubmit, watch } = useForm();
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const { data } = await semesterViewRequest();
        setSemesters(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setSemesters([]);
      }
    };
    loadSemesters();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");

      const { startDate, endDate, midtermWeek } = values;

      if (startDate > endDate) {
        setErrorMessage(
          "The start date cannot be later than the end date",
        );
        return;
      }

      if (midtermWeek < startDate || midtermWeek > endDate) {
        setErrorMessage(
          "The midterm start date must be between the semester start and end dates",
        );
        return;
      }

      const overlappingSemester = semesters.find((semester) =>
        overlaps(startDate, endDate, semester),
      );

      if (overlappingSemester) {
        setErrorMessage(
          `The semester dates overlap with "${overlappingSemester.name}"`,
        );
        return;
      }

      const res = await semesterCreateRequest(values);
      console.log(res);
      navigate("/home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "The semester could not be created");
        return;
      }
      setErrorMessage("An unexpected error occurred");
    }
  });

  return (
    <div>
      <div className="formContainer">
        {errorMessage ? <p>{errorMessage}</p> : null}
        <form className="formLayout" onSubmit={onSubmit}>
          <p className="title">Semester</p>
          <input
            placeholder="Semester Name. Example: 2023-1"
            type="text"
            className="formControl"
            {...register("semesterName", { required: true })}
          />
          <p className="formText">Start date</p>
          <input
            type="date"
            className="formControl"
            {...register("startDate", { required: true })}
          />
          <p className="formText">End date</p>
          <input
            type="date"
            className="formControl"
            min={startDate || undefined}
            {...register("endDate", { required: true })}
          />
          <p className="formText">Midterm week start date</p>
          <input
            type="date"
            className="formControl"
            min={startDate || undefined}
            max={endDate || undefined}
            {...register("midtermWeek", { required: true })}
          />
          <button type="submit">Create</button>
        </form>

        {semesters.length > 0 && (
          <div className="mt-6">
            <p className="formText font-semibold mb-2">Existing semesters</p>
            <ul className="flex flex-col gap-2">
              {semesters.map((s) => (
                <li key={s.semester_id} className="border rounded p-2 text-sm">
                  <strong>{s.name}</strong> — {s.start_date} → {s.end_date}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Semester;
