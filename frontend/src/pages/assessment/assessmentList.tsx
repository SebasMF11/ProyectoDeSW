import { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiEdit2Line } from "react-icons/ri";
import FloatingActionMenu from "../../components/FloatingActionMenu";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";
import { assessmentDeleteRequest } from "../../api/assessment.api";
import { gradeDeleteRequest } from "../../api/grade";
import {
  assessmentKey,
  useAssessmentListData,
  type Assessment,
} from "../../hooks/useAssessmentListData";

type AssessmentStatusFilter = "all" | "completed" | "delayed" | "pending";

const assessmentStatusOptions: Array<{
  value: AssessmentStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completada" },
  { value: "delayed", label: "Retrasada" },
  { value: "pending", label: "Pendiente" },
];

const formatAssessmentDate = (dateValue?: string) => {
  if (!dateValue) return "No date";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(parsed);
};

const formatGradeValue = (grade?: number) => {
  if (!Number.isFinite(grade)) return "Pending";
  return Number(grade).toFixed(1);
};

const getLocalDateKey = (dateValue: Date) =>
  `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(dateValue.getDate()).padStart(2, "0")}`;

const getAssessmentDueDateKey = (dateValue?: string) => {
  if (!dateValue) return "";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";

  return getLocalDateKey(parsed);
};

const getAssessmentStatus = (
  assessment: Assessment,
  hasGrade: boolean,
  todayKey: string,
): Exclude<AssessmentStatusFilter, "all"> => {
  if (hasGrade) {
    return "completed";
  }

  const dueDateKey = getAssessmentDueDateKey(assessment.due_date);

  if (dueDateKey && dueDateKey < todayKey) {
    return "delayed";
  }

  return "pending";
};

const getAssessmentStatusLabel = (
  status: Exclude<AssessmentStatusFilter, "all">,
) => {
  switch (status) {
    case "completed":
      return "Completada";
    case "delayed":
      return "Retrasada";
    case "pending":
      return "Pendiente";
  }

  return status;
};

function AssessmentList() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnState = location.state as {
    refreshAssessmentData?: boolean;
    semesterName?: string;
  } | null;
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [selectedSemester, setSelectedSemester] = useState(
    () => returnState?.semesterName ?? "",
  );
  const [selectedStatus, setSelectedStatus] =
    useState<AssessmentStatusFilter>("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingAssessmentId, setPendingAssessmentId] = useState<string | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<
    "complete" | "deleteGrade" | "deleteAssessment" | null
  >(null);
  const {
    courses,
    assessments,
    gradeMap,
    gradeDetailsMap,
    loading,
    errorMessage: loadError,
    reloadAssessmentData,
  } = useAssessmentListData(selectedSemester, semesters);

  useEffect(() => {
    if (!returnState?.refreshAssessmentData) return;

    reloadAssessmentData(returnState.semesterName);
  }, [
    reloadAssessmentData,
    returnState?.refreshAssessmentData,
    returnState?.semesterName,
  ]);

  useEffect(() => {
    if (!latestSemesterName || returnState?.semesterName) return;
    setSelectedSemester((current) => current || latestSemesterName);
  }, [latestSemesterName, returnState?.semesterName]);

  const assessmentsByCourse = useMemo(() => {
    const grouped: Record<string, Assessment[]> = {};
    assessments.forEach((assessment) => {
      const courseName =
        assessment.course?.courses?.name || "No course assigned";
      if (!grouped[courseName]) grouped[courseName] = [];
      grouped[courseName].push(assessment);
    });
    return grouped;
  }, [assessments]);

  const todayKey = getLocalDateKey(new Date());

  const visibleCourseAssessments = useMemo(() => {
    return courses
      .map((course) => {
        const courseName = course.courses.name;
        const sortedAssessments = [
          ...(assessmentsByCourse[courseName] || []),
        ].sort((a, b) => {
          const first = a.due_date ? new Date(a.due_date).getTime() : 0;
          const second = b.due_date ? new Date(b.due_date).getTime() : 0;
          return first - second;
        });

        const filteredAssessments = sortedAssessments.filter((assessment) => {
          const key = assessmentKey(
            courseName,
            assessment.name,
            assessment.due_date,
          );
          const hasGrade = typeof gradeMap[key] === "number";
          const status = getAssessmentStatus(assessment, hasGrade, todayKey);

          return selectedStatus === "all" || status === selectedStatus;
        });

        return {
          course,
          assessments: filteredAssessments,
        };
      })
      .filter((group) => group.assessments.length > 0);
  }, [assessmentsByCourse, courses, gradeMap, selectedStatus, todayKey]);

  const fallbackCourseColor = "#0f93ad";

  const requestCompletionToggle = (
    courseName: string,
    assessment: Assessment,
  ) => {
    const key = assessmentKey(courseName, assessment.name, assessment.due_date);
    const gradeDetails = gradeDetailsMap[key];

    setPendingAssessmentId(assessment.assessment_id);
    setPendingAction(gradeDetails ? "deleteGrade" : "complete");
  };

  const requestAssessmentDelete = (assessment: Assessment) => {
    setPendingAssessmentId(assessment.assessment_id);
    setPendingAction("deleteAssessment");
  };

  const cancelAction = () => {
    setPendingAssessmentId(null);
    setPendingAction(null);
  };

  const handleCompleteAssessment = (
    courseName: string,
    assessment: Assessment,
  ) => {
    navigate("/grade", {
      state: {
        semesterName: selectedSemester,
        courseName,
        assessmentName: assessment.name,
        redirectTo: "/assessment-list",
      },
    });
  };

  const handleDeleteGrade = async (
    assessment: Assessment,
    courseName: string,
  ) => {
    const key = assessmentKey(courseName, assessment.name, assessment.due_date);
    const gradeDetails = gradeDetailsMap[key];

    if (!gradeDetails) return;

    try {
      await gradeDeleteRequest(gradeDetails.gradeId);
      reloadAssessmentData();
      cancelAction();
    } catch (error) {
      console.error(error);
      setErrorMessage("The grade could not be deleted");
    }
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
    try {
      await assessmentDeleteRequest(assessment.assessment_id);
      reloadAssessmentData();
      cancelAction();
    } catch (error) {
      console.error(error);
      setErrorMessage("The assessment could not be deleted");
    }
  };

  return (
    <main className="mx-auto max-w-6xl bg-white px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-3 mb-4">
        <section aria-label="Assessment filters" className="space-y-3 w-44">
          <SemesterSelect
            semesters={semesters}
            value={selectedSemester}
            onValueChange={setSelectedSemester}
          />
        </section>
        <div className="flex flex-1 items-center justify-center gap-4">
          <h1 className="text-xl font-semibold text-center">
            Assessments by semester
          </h1>
        </div>
        <section aria-label="Assessment filters" className="space-y-3 w-44">
          <div>
            <label htmlFor="assessment-status-filter" className="formText">
              Filter by status
            </label>
            <select
              id="assessment-status-filter"
              className="formControl"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as AssessmentStatusFilter)
              }
            >
              {assessmentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>
      </header>

      {errorMessage || loadError || semesterError ? (
        <p className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage || loadError || semesterError}
        </p>
      ) : null}

      <section className="mt-2" aria-live="polite">
        {loadingSemesters || loading ? (
          <p className="text-sm text-[#425047]">Loading information...</p>
        ) : null}

        {!loadingSemesters &&
        !loading &&
        selectedSemester &&
        courses.length === 0 ? (
          <p className="text-sm text-[#425047]">
            No courses are assigned to this semester.
          </p>
        ) : null}

        {!loadingSemesters && !loading && courses.length > 0 ? (
          <div className="space-y-7">
            <div className="mb-1 hidden sm:gap-3 sm:pl-10 sm:items-center assessment-grid">
              <p className="col-start-3 text-center text-sm font-semibold uppercase tracking-wide text-[#1a1a1a]">
                Grade
              </p>
            </div>

            {visibleCourseAssessments.length > 0 ? (
              visibleCourseAssessments.map(
                ({ course, assessments: courseAssessments }) => {
                  const courseName = course.courses.name;

                  return (
                    <article key={course.course_id} className="relative pl-10">
                      <span
                        className="absolute left-2 top-1 h-5 w-5 rounded-full"
                        style={{
                          backgroundColor: course.color || fallbackCourseColor,
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="absolute left-[18px] top-6 bottom-0 w-px bg-[#8f8f8f]"
                        aria-hidden="true"
                      />

                      <header className="mb-2 flex items-baseline justify-between gap-3">
                        <h2 className="text-lg leading-6 font-bold text-[#0f1412] sm:text-xl">
                          {courseName}
                        </h2>
                        <p className="text-xs text-[#55635a]">
                          {course.teacher || "Unassigned"} •{" "}
                          {course.credits ?? "-"} credits
                        </p>
                      </header>

                      <div className="course-list-table-wrapper">
                        <table className="course-list-table">
                          <colgroup>
                            <col />
                            <col style={{ width: 120 }} />
                            <col style={{ width: 96 }} />
                            <col style={{ width: 280 }} />
                          </colgroup>
                          <tbody>
                            {courseAssessments.map((assessment) => {
                              const key = assessmentKey(
                                courseName,
                                assessment.name,
                                assessment.due_date,
                              );
                              const gradeValue = gradeMap[key];
                              const hasGrade = typeof gradeValue === "number";
                              const status = getAssessmentStatus(
                                assessment,
                                hasGrade,
                                todayKey,
                              );

                              return (
                                <Fragment key={assessment.assessment_id}>
                                  <tr
                                    key={assessment.assessment_id}
                                    className="course-list-body-row"
                                  >
                                    <td className="course-list-cell course-list-cell-course">
                                      <p className="text-sm capitalize text-[#6b6b6b]">
                                        {formatAssessmentDate(
                                          assessment.due_date,
                                        )}
                                      </p>
                                      <p className="text-base leading-6 font-medium text-[#131313] sm:text-lg">
                                        {assessment.type}: {assessment.name}
                                      </p>
                                      <span
                                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                          status === "completed"
                                            ? "bg-[#d9dcda] text-[#1f2521]"
                                            : status === "delayed"
                                              ? "bg-red-100 text-red-700"
                                              : "bg-amber-100 text-amber-800"
                                        }`}
                                      >
                                        {getAssessmentStatusLabel(status)}
                                      </span>
                                    </td>
                                    <td className="course-list-cell course-list-cell-credits text-center">
                                      <span className="assessment-pill inline-flex h-11 items-center justify-center rounded-full bg-[#d9dcda] px-4 text-lg font-semibold text-[#1f2521]">
                                        {assessment.percentage ?? "-"}%
                                      </span>
                                    </td>
                                    <td className="course-list-cell text-center">
                                      <span
                                        className={`assessment-pill inline-flex h-11 items-center justify-center rounded-full px-4 text-lg font-semibold ${
                                          hasGrade
                                            ? "bg-[#d9dcda] text-[#1f2521]"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {formatGradeValue(gradeValue)}
                                      </span>
                                    </td>
                                    <td className="course-list-cell course-list-cell-actions">
                                      <div className="course-list-actions-container">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            requestCompletionToggle(
                                              courseName,
                                              assessment,
                                            )
                                          }
                                          className={`course-list-btn w-full whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold sm:w-auto ${
                                            hasGrade
                                              ? "bg-gray-200 text-gray-700"
                                              : "bg-emerald-100 text-emerald-700"
                                          }`}
                                          title={
                                            hasGrade
                                              ? "Unmark completed"
                                              : "Mark as completed"
                                          }
                                        >
                                          {hasGrade
                                            ? "Unmark"
                                            : "Mark completed"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            requestAssessmentDelete(assessment)
                                          }
                                          className="course-list-btn course-list-btn-icon bg-red-100 text-red-700 hover:bg-red-200"
                                          title="Delete assessment"
                                        >
                                          <FaRegTrashCan size={16} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            navigate("/assessment", {
                                              state: {
                                                assessment,
                                                semesterName: selectedSemester,
                                                courseName,
                                              },
                                            })
                                          }
                                          className="course-list-btn course-list-btn-icon"
                                          title="Edit assessment"
                                        >
                                          <RiEdit2Line size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>

                                  {pendingAssessmentId ===
                                    assessment.assessment_id &&
                                  pendingAction === "complete" ? (
                                    <tr
                                      key={`${assessment.assessment_id}-modal-complete`}
                                    >
                                      <td colSpan={4}>
                                        <div className="course-list-modal course-list-modal-success">
                                          <p className="course-list-modal-title">
                                            Mark &quot;{assessment.name}&quot;
                                            as completed?
                                          </p>
                                          <p className="course-list-modal-description">
                                            You will be taken to the grade form
                                            to create the note. Once the grade
                                            is saved, the activity will be
                                            considered completed.
                                          </p>
                                          <div className="course-list-modal-buttons">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleCompleteAssessment(
                                                  courseName,
                                                  assessment,
                                                )
                                              }
                                              className="course-list-modal-btn-success"
                                            >
                                              Yes, continue
                                            </button>
                                            <button
                                              type="button"
                                              onClick={cancelAction}
                                              className="course-list-modal-btn-cancel"
                                            >
                                              Cancel action
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : null}

                                  {pendingAssessmentId ===
                                    assessment.assessment_id &&
                                  pendingAction === "deleteGrade" ? (
                                    <tr
                                      key={`${assessment.assessment_id}-modal-unmark`}
                                    >
                                      <td colSpan={4}>
                                        <div className="course-list-modal course-list-modal-danger">
                                          <p className="course-list-modal-title">
                                            Unmark &quot;{assessment.name}
                                            &quot;?
                                          </p>
                                          <p className="course-list-modal-description">
                                            The grade will be deleted and the
                                            activity will return to pending
                                            state.
                                          </p>
                                          <div className="course-list-modal-buttons">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteGrade(
                                                  assessment,
                                                  courseName,
                                                )
                                              }
                                              className="course-list-modal-btn-danger"
                                            >
                                              Yes, delete grade
                                            </button>
                                            <button
                                              type="button"
                                              onClick={cancelAction}
                                              className="course-list-modal-btn-cancel"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : null}

                                  {pendingAssessmentId ===
                                    assessment.assessment_id &&
                                  pendingAction === "deleteAssessment" ? (
                                    <tr
                                      key={`${assessment.assessment_id}-modal-delete`}
                                    >
                                      <td colSpan={4}>
                                        <div className="course-list-modal course-list-modal-danger">
                                          <p className="course-list-modal-title">
                                            Delete &quot;{assessment.name}
                                            &quot;?
                                          </p>
                                          <p className="course-list-modal-description">
                                            This will delete the assessment and
                                            its related grade data. This cannot
                                            be undone.
                                          </p>
                                          <div className="course-list-modal-buttons">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteAssessment(
                                                  assessment,
                                                )
                                              }
                                              className="course-list-modal-btn-danger"
                                            >
                                              Yes, delete assessment
                                            </button>
                                            <button
                                              type="button"
                                              onClick={cancelAction}
                                              className="course-list-modal-btn-cancel"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : null}
                                </Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  );
                },
              )
            ) : (
              <p className="text-sm text-[#425047]">
                No activities match the selected status.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <FloatingActionMenu ariaLabel="Assessment actions" />
    </main>
  );
}

export default AssessmentList;
