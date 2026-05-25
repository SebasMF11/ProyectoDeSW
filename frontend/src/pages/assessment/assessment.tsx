import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  assessmentCreateRequest,
  assessmentUpdateRequest,
} from "../../api/assessment.api";
import { semesterViewRequest } from "../../api/semester";
import { courseBySemesterRequest } from "../../api/course";
import SemesterSelect from "../../components/SemesterSelect";
import CourseSelect, { type Course } from "../../components/CourseSelect";

type Semester = {
  semester_id: string;
  name: string;
  start_date: string;
  end_date: string;
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
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { register, handleSubmit, watch, setValue } = useForm();
  const editAssessment = (location.state as any)?.assessment;
  const isEditing = !!editAssessment;
  const editAssessmentId = editAssessment?.assessment_id;
  const selectedSemesterName = watch("semesterName");
  const selectedSemesterData = semesters.find(
    (semester) => semester.name === selectedSemesterName,
  );

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const { data } = await semesterViewRequest();
        const list = Array.isArray(data) ? data : [];
        setSemesters(list);
        if (list.length > 0 && !isEditing) {
          setValue("semesterName", list[0].name);
        }
      } catch (error) {
        console.error(error);
        setSemesters([]);
      }
    };
    loadSemesters();
  }, [isEditing, setValue]);

  useEffect(() => {
    if (!isEditing) return;
    // Prefill form values from router state when editing
    try {
      const locationState = (location.state as any) || {};
      setValue(
        "semesterName",
        editAssessment.semesterName || locationState.semesterName || "",
      );
      setValue(
        "courseName",
        editAssessment.courseName || locationState.courseName || "",
      );
      setValue(
        "assessmentName",
        editAssessment.name || editAssessment.assessmentName || "",
      );

      // due_date may be full ISO; convert to YYYY-MM-DD for input[type=date]
      const rawDue = editAssessment.due_date || editAssessment.dueDate || "";
      const toDateInput = (iso?: string) => {
        if (!iso) return "";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso.split("T")[0] || "";
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      setValue("dueDate", toDateInput(rawDue));
      setValue("type", editAssessment.type || "");
      setValue("percentage", editAssessment.percentage ?? "");
    } catch (e) {
      console.error("Error pre-filling assessment form:", e);
    }
  }, [isEditing, editAssessment, setValue]);

  useEffect(() => {
    const loadCoursesBySemester = async () => {
      if (!selectedSemesterName) {
        setCourses([]);
        if (!isEditing) {
          setValue("courseName", "");
        }
        return;
      }
      try {
        const { data } = await courseBySemesterRequest(selectedSemesterName);
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
        if (!isEditing) {
          setValue("courseName", "");
        } else if (editAssessment?.courseName) {
          setValue("courseName", editAssessment.courseName);
        }
      } catch (error) {
        console.error(error);
        setCourses([]);
        if (!isEditing) {
          setValue("courseName", "");
        }
      }
    };
    loadCoursesBySemester();
  }, [editAssessment?.courseName, isEditing, selectedSemesterName, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      if (isEditing && editAssessmentId) {
        const payload = {
          assessmentName: values.assessmentName,
          type: values.type,
          dueDate: values.dueDate,
          percentage: values.percentage,
        };
        await assessmentUpdateRequest(editAssessmentId, payload);
        navigate("/assessment-list", {
          state: {
            refreshAssessmentData: true,
            semesterName: values.semesterName,
          },
        });
        return;
      }

      await assessmentCreateRequest(values);
      navigate("/assessment-list", {
        state: {
          refreshAssessmentData: true,
          semesterName: values.semesterName,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "Could not create the assessment");
        return;
      }
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
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
              selectedSemesterName
                ? "Select a course"
                : "Select a semester first"
            }
            emptyOptionText={
              selectedSemesterName
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

          <label className="formText" htmlFor="assessment-type">
            Type
          </label>
          <select
            id="assessment-type"
            className="formControl"
            defaultValue=""
            {...register("type", { required: true })}
          >
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
              placeholder="Percentage"
              type="number"
              min={1}
              max={100}
              {...register("percentage", {
                required: true,
                valueAsNumber: true,
              })}
            />
            <p className="text-[25px] text-[#3d483f]">%</p>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update"
                : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default assessment;
