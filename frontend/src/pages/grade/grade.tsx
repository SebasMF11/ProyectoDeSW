import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { gradeCreateRequest } from "../../api/grade";
import { semesterViewRequest } from "../../api/semester";
import { courseBySemesterRequest } from "../../api/course";
import { assessmentBySemesterRequest } from "../../api/assessment.api";

type Semester = {
  semester_id: number;
  semester_name: string;
};

type Course = {
  course_name: string;
};

type Assessment = {
  assessment_name: string;
  course: {
    course_name: string;
  };
};

const grade = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { register, handleSubmit, watch, setValue } = useForm();
  const selectedSemesterName = watch("semesterName");
  const selectedCourseName = watch("courseName");

  const selectedSemester = useMemo(
    () =>
      semesters.find(
        (semester) => semester.semester_name === selectedSemesterName,
      ),
    [semesters, selectedSemesterName],
  );

  const filteredAssessments = useMemo(
    () =>
      assessments.filter(
        (assessment) => assessment.course?.course_name === selectedCourseName,
      ),
    [assessments, selectedCourseName],
  );

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

  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedSemesterName) {
        setCourses([]);
        setValue("courseName", "");
        setValue("assessmentName", "");
        return;
      }

      try {
        const { data } = await courseBySemesterRequest(selectedSemesterName);
        const semesterCourses = Array.isArray(data?.courses)
          ? data.courses
          : [];
        setCourses(semesterCourses);
      } catch (error) {
        console.error(error);
        setCourses([]);
      }

      setValue("courseName", "");
      setValue("assessmentName", "");
    };

    loadCourses();
  }, [selectedSemesterName, setValue]);

  useEffect(() => {
    const loadAssessments = async () => {
      if (!selectedSemester?.semester_id) {
        setAssessments([]);
        setValue("assessmentName", "");
        return;
      }

      try {
        const { data } = await assessmentBySemesterRequest(
          selectedSemester.semester_id,
        );
        const semesterAssessments = Array.isArray(data?.assessments)
          ? data.assessments
          : [];
        setAssessments(semesterAssessments);
      } catch (error) {
        console.error(error);
        setAssessments([]);
      }

      setValue("assessmentName", "");
    };

    loadAssessments();
  }, [selectedSemester, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
      const res = await gradeCreateRequest(values);
      console.log(res);
      navigate("/home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "No se pudo crear la nota");
        return;
      }

      setErrorMessage("Ocurrio un error inesperado");
    }
  });

  return (
    <div>
      <div>
        <p>Crear cuenta</p>
        {errorMessage ? <p>{errorMessage}</p> : null}
        <form onSubmit={onSubmit}>
          <select
            defaultValue=""
            {...register("semesterName", { required: true })}
          >
            <option value="" disabled>
              {semesters.length > 0
                ? "Selecciona un semestre"
                : "No hay semestres registrados"}
            </option>
            {semesters.map((semester) => (
              <option key={semester.semester_id} value={semester.semester_name}>
                {semester.semester_name}
              </option>
            ))}
          </select>
          <select
            defaultValue=""
            {...register("courseName", { required: true })}
          >
            <option value="" disabled>
              {selectedSemesterName
                ? courses.length > 0
                  ? "Selecciona un curso"
                  : "No hay cursos en este semestre"
                : "Primero selecciona un semestre"}
            </option>
            {courses.map((course) => (
              <option key={course.course_name} value={course.course_name}>
                {course.course_name}
              </option>
            ))}
          </select>
          <select
            defaultValue=""
            {...register("assessmentName", { required: true })}
          >
            <option value="" disabled>
              {selectedCourseName
                ? filteredAssessments.length > 0
                  ? "Selecciona una actividad"
                  : "No hay actividades para este curso"
                : "Primero selecciona un curso"}
            </option>
            {filteredAssessments.map((assessment) => (
              <option
                key={assessment.assessment_name}
                value={assessment.assessment_name}
              >
                {assessment.assessment_name}
              </option>
            ))}
          </select>
          <input
            placeholder="Nota"
            type="number"
            {...register("value", { required: true, valueAsNumber: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default grade;
