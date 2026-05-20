import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiEdit2Line } from "react-icons/ri";
import SemesterSelect from "../../components/SemesterSelect";
import FloatingActionMenu from "../../components/FloatingActionMenu";
import {
  courseBySemesterRequest,
  courseDeleteRequest,
  courseStatusRequest,
} from "../../api/course";
import useSemesters from "../../hooks/useSemesters";
import "../../styles/lists.css";

type Course = {
  course_id: string;
  courses_id: string;
  courses: {
    name: string;
    prerequisite_course: { name: string } | null;
  };
  teacher?: string;
  credits: number;
  color?: string;
  status?: string;
};

// Qué acción de confirmación está pendiente para cada curso
type PendingAction = "complete" | "fail" | "delete" | null;

function CourseList() {
  const navigate = useNavigate();
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Mapa courseId → acción pendiente de confirmación
  const [pendingActions, setPendingActions] = useState<
    Record<string, PendingAction>
  >({});
  const [showAll, setShowAll] = useState(false);

  const loadCoursesBySemester = async (semesterName: string) => {
    if (!semesterName) {
      setCourses([]);
      return;
    }
    try {
      setLoadingCourses(true);
      setErrorMessage("");
      const { data } = await courseBySemesterRequest(semesterName);
      setCourses(Array.isArray(data?.courses) ? data.courses : []);
    } catch (error) {
      console.error(error);
      setCourses([]);
      setErrorMessage("The semester courses could not be loaded");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (!latestSemesterName) return;
    setSelectedSemester((current) => current || latestSemesterName);
  }, [latestSemesterName]);

  useEffect(() => {
    loadCoursesBySemester(selectedSemester);
  }, [selectedSemester]);

  // Abre el panel de confirmación para un curso
  const requestAction = (courseId: string, action: PendingAction) => {
    setPendingActions((prev) => ({ ...prev, [courseId]: action }));
  };

  // Cancela la confirmación
  const cancelAction = (courseId: string) => {
    setPendingActions((prev) => ({ ...prev, [courseId]: null }));
  };

  const onCompleteCourse = async (courseId: string) => {
    try {
      setErrorMessage("");
      await courseStatusRequest(courseId, "completed");
      cancelAction(courseId);
      await loadCoursesBySemester(selectedSemester);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "The course could not be completed",
        );
        return;
      }
      setErrorMessage("The course could not be completed");
    }
  };

  const onFailCourse = async (courseId: string) => {
    try {
      setErrorMessage("");
      await courseStatusRequest(courseId, "failed");
      cancelAction(courseId);
      await loadCoursesBySemester(selectedSemester);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "The course could not be canceled",
        );
        return;
      }
      setErrorMessage("The course could not be canceled");
    }
  };

  const onDeleteCourse = async (courseId: string) => {
    try {
      setErrorMessage("");
      await courseDeleteRequest(courseId);
      cancelAction(courseId);
      await loadCoursesBySemester(selectedSemester);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "The course could not be deleted",
        );
        return;
      }
      setErrorMessage("The course could not be deleted");
    }
  };

  const onEditCourse = (course: Course) => {
    navigate("/course", {
      state: {
        course_id: course.course_id,
        courses_id: course.courses_id,
        course_name: course.courses.name,
        teacher: course.teacher,
        credits: course.credits,
        color: course.color,
        semester_name: selectedSemester,
      },
    });
  };

  const totalCredits = useMemo(() => {
    return courses.reduce((sum, c) => sum + (c.credits ?? 0), 0);
  }, [courses]);

  // Visible courses in the table - active by default, or all if toggled
  const visibleCourses = useMemo(() => {
    if (showAll) {
      return courses;
    }
    return courses.filter((c) => (c.status || "").toLowerCase() === "active");
  }, [courses, showAll]);

  // Totals / counters
  const activeCoursesCount = useMemo(
    () => visibleCourses.length,
    [visibleCourses],
  );

  const inactiveCoursesCount = useMemo(() => {
    return courses.filter((c) => {
      const s = (c.status || "").toLowerCase();
      return s === "completed" || s === "failed" || s === "inactive";
    }).length;
  }, [courses]);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-4">
        <section aria-label="Semester selection" className="space-y-3 w-40">
          {errorMessage || semesterError ? (
            <p className="text-red-600 text-sm">
              {errorMessage || semesterError}
            </p>
          ) : null}
          <SemesterSelect
            semesters={semesters}
            value={selectedSemester}
            onValueChange={setSelectedSemester}
          />
        </section>

        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Courses by semester</h1>
        </div>

        <div className="w-40">
          <label htmlFor="course-view-select" className="formText">
            View
          </label>
          <select
            id="course-view-select"
            className="formControl"
            value={showAll ? "all" : "active"}
            onChange={(e) => setShowAll(e.target.value === "all")}
          >
            <option value="active">Active Courses</option>
            <option value="all">All Courses</option>
          </select>
        </div>
      </header>
      <div className="mb-4 flex w-full flex-row items-center gap-3">
        <div className="basis-4/5 bg-gray-50 border border-gray-200 rounded p-3 min-w-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-700">{totalCredits}</p>
              <p className="text-xs text-gray-500">Total Credits</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-700">
                {activeCoursesCount}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-700">
                {inactiveCoursesCount}
              </p>
              <p className="text-xs text-gray-500">Inactive</p>
            </div>
          </div>
        </div>

        <div className="flex min-w-[10%] max-w-[20%] flex-1 justify-end self-center">
          <button
            className="p-2 whitespace-nowrap"
            type="button"
            onClick={() => navigate("/day")}
          >
            Add class times
          </button>
        </div>
      </div>

      <section className="mt-6" aria-live="polite">
        {loadingSemesters || loadingCourses ? <p>Loading courses...</p> : null}

        {!loadingSemesters &&
        !loadingCourses &&
        selectedSemester &&
        visibleCourses.length === 0 ? (
          <p>
            {showAll
              ? "No courses available for the selected semester."
              : "There are no active courses available for the selected semester."}
          </p>
        ) : null}

        {!loadingSemesters && !loadingCourses && visibleCourses.length > 0 ? (
          <div className="course-list-table-wrapper">
            <table className="course-list-table course-list-table-locked">
              <thead>
                <tr className="course-list-header-row">
                  <th className="course-list-header-cell course-list-col-course">
                    COURSE
                  </th>
                  <th className="course-list-header-cell course-list-col-teacher">
                    TEACHER
                  </th>
                  <th className="course-list-header-cell course-list-col-credits">
                    CREDITS
                  </th>
                  {showAll && (
                    <th className="course-list-header-cell">STATUS</th>
                  )}
                  <th className="course-list-header-cell course-list-col-actions">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleCourses.map((course) => {
                  const pending = pendingActions[course.course_id] ?? null;

                  return (
                    <tr key={course.course_id} className="course-list-body-row">
                      <td
                        className="course-list-cell course-list-cell-course course-list-col-course"
                        style={{
                          borderLeftColor: course.color,
                        }}
                      >
                        <div>
                          <p className="course-list-course-name">
                            {course.courses.name}
                          </p>
                          {course.courses.prerequisite_course && (
                            <p className="course-list-course-prerequisite">
                              Prerequisite:{" "}
                              {course.courses.prerequisite_course.name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="course-list-cell course-list-cell-teacher course-list-col-teacher">
                        {course.teacher || "Not assigned"}
                      </td>
                      <td className="course-list-cell course-list-cell-credits course-list-col-credits">
                        {course.credits}
                      </td>
                      {showAll && (
                        <td className="course-list-cell">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              course.status?.toLowerCase() === "active"
                                ? "bg-green-100 text-green-800"
                                : course.status?.toLowerCase() === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : course.status?.toLowerCase() === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {course.status
                              ? course.status.charAt(0).toUpperCase() +
                                course.status.slice(1).toLowerCase()
                              : "Unknown"}
                          </span>
                        </td>
                      )}
                      <td className="course-list-cell course-list-cell-actions course-list-col-actions">
                        <div className="course-list-actions-container">
                          {course.status?.toLowerCase() === "active" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  requestAction(course.course_id, "complete")
                                }
                                className="course-list-btn course-list-btn-text"
                              >
                                Mark as completed
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  requestAction(course.course_id, "fail")
                                }
                                className="course-list-btn course-list-btn-text"
                              >
                                Cancel course
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              requestAction(course.course_id, "delete")
                            }
                            className="course-list-btn course-list-btn-icon"
                            title="Delete course"
                          >
                            <FaRegTrashCan size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditCourse(course)}
                            className="course-list-btn course-list-btn-icon"
                            title="Edit course"
                          >
                            <RiEdit2Line size={16} />
                          </button>
                        </div>

                        {/* Panel de confirmación inline */}
                        {pending === "complete" && (
                          <div className="course-list-modal course-list-modal-success">
                            <p className="course-list-modal-title">
                              Mark "{course.courses.name}" as completed?
                            </p>
                            <p className="course-list-modal-description">
                              The course will be marked as completed and will no
                              longer appear in your active list.
                            </p>
                            <div className="course-list-modal-buttons">
                              <button
                                type="button"
                                onClick={() =>
                                  onCompleteCourse(course.course_id)
                                }
                                className="course-list-modal-btn-success"
                              >
                                Yes, mark as completed
                              </button>
                              <button
                                type="button"
                                onClick={() => cancelAction(course.course_id)}
                                className="course-list-modal-btn-cancel"
                              >
                                Cancel action
                              </button>
                            </div>
                          </div>
                        )}

                        {pending === "fail" && (
                          <div className="course-list-modal course-list-modal-warning">
                            <p className="course-list-modal-title">
                              Cancel "{course.courses.name}"?
                            </p>
                            <p className="course-list-modal-description">
                              The course will be marked as canceled. You can
                              re-register it in a future semester.
                            </p>
                            <div className="course-list-modal-buttons">
                              <button
                                type="button"
                                onClick={() => onFailCourse(course.course_id)}
                                className="course-list-modal-btn-warning"
                              >
                                Yes, cancel course
                              </button>
                              <button
                                type="button"
                                onClick={() => cancelAction(course.course_id)}
                                className="course-list-modal-btn-cancel"
                              >
                                Cancel action
                              </button>
                            </div>
                          </div>
                        )}

                        {pending === "delete" && (
                          <div className="course-list-modal course-list-modal-danger">
                            <p className="course-list-modal-title">
                              Delete "{course.courses.name}"?
                            </p>
                            <p className="course-list-modal-description">
                              This action will delete the course and all its
                              related data (evaluations, grades, schedules).
                              This cannot be undone.
                            </p>
                            <div className="course-list-modal-buttons">
                              <button
                                type="button"
                                onClick={() => onDeleteCourse(course.course_id)}
                                className="course-list-modal-btn-danger"
                              >
                                Yes, delete
                              </button>
                              <button
                                type="button"
                                onClick={() => cancelAction(course.course_id)}
                                className="course-list-modal-btn-cancel"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <FloatingActionMenu ariaLabel="Course actions" />
    </main>
  );
}

export default CourseList;
