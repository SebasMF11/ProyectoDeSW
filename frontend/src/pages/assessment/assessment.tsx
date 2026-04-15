import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { assessmentCreateRequest } from "../../api/assessment.api";
import SemesterSelect from "../../components/SemesterSelect";
import CourseSelect from "../../components/CourseSelect";
import { loadSemesters, type Semester } from "../../utils/loadSemesters";
import { loadCoursesBySemester } from "../../utils/loadCoursesBySemester";

type Course = {
  course_name: string;
};

const assessmentTypes = [
  "midterm",
  "quiz",
  "workshop",
  "project",
  "presentation",
  "lab",
];

const assessment = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { register, handleSubmit, watch, setValue } = useForm();
  const selectedSemester = watch("semesterName");
  const selectedSemesterData = semesters.find(
    (semester) => semester.semester_name === selectedSemester,
  );

  useEffect(() => {
    const initSemesters = async () => {
      // Cargar semestres
      const semesters = await loadSemesters();
      setSemesters(semesters);

      // Seleccionar automáticamente el primer semestre si existe
      if (semesters.length > 0) {
        const semesterName = semesters[0].semester_name;
        setValue("semesterName", semesterName, { shouldValidate: false });

        // Cargar cursos del semestre seleccionado
        const courses = await loadCoursesBySemester(semesterName);
        setCourses(courses);
      }
    };

    initSemesters();
  }, [setValue]);

  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedSemester) {
        setCourses([]);
        setValue("courseName", "");
        return;
      }

      const courses = await loadCoursesBySemester(selectedSemester);
      setCourses(courses);
      setValue("courseName", "");
    };

    loadCourses();
  }, [selectedSemester, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
      const res = await assessmentCreateRequest(values);
      console.log(res);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "Could not create the assessment");
        return;
      }

      setErrorMessage("An unexpected error occurred");
    }
  });

  return (
    <div>
      <div className="formContainer">
        <form onSubmit={onSubmit} className="formLayout">
          <p className="title">Assessment</p>
          {errorMessage ? <p>{errorMessage}</p> : null}
          <SemesterSelect
            semesters={semesters}
            placeholderOptionText="Select a semester"
            emptyOptionText="No semesters available"
            selectProps={{
              defaultValue: "",
              ...register("semesterName", { required: true }),
            }}
          />
          <CourseSelect
            courses={courses}
            placeholderOptionText={
              selectedSemester ? "Select a course" : "Select a semester first"
            }
            emptyOptionText={
              selectedSemester
                ? "No courses in this semester"
                : "Select a semester first"
            }
            selectProps={{
              defaultValue: "",
              ...register("courseName", { required: true }),
            }}
          />
          <input
            className="formControl"
            placeholder="Assessment name"
            type="text"
            {...register("assessmentName", { required: true })}
          />
          <input
            className="formControl"
            placeholder="Assessment date"
            type="date"
            min={selectedSemesterData?.start_date}
            max={selectedSemesterData?.end_date}
            {...register("dueDate", { required: true })}
          />
          <select
            className="formControl"
            defaultValue=""
            {...register("type", { required: true })}>
            <option value="" disabled>
              Select the assessment type
            </option>
            {assessmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="flex flex-row items-center gap-2">
            <input
              className="formControl w-[50%]"
              placeholder="--"
              {...register("percentage", {
                required: true,
                valueAsNumber: true,
              })}
            />
            <p className="text-[25px] text-[#3d483f]">%</p>
          </div>
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};
export default assessment;
