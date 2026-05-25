import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
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

function AssessmentList() {
  const navigate = useNavigate();
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [selectedSemester, setSelectedSemester] = useState("");
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
    if (!latestSemesterName) return;
    setSelectedSemester((current) => current || latestSemesterName);
  }, [latestSemesterName]);

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
        <section aria-label="Semester selection" className="space-y-3 w-40">
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
        <div>
          <button type="button" onClick={() => navigate("/grade")}>
            Add Grade
          </button>
        </div>
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

            {courses.map((course) => {
              const courseName = course.courses.name;
              const courseAssessments = [
                ...(assessmentsByCourse[courseName] || []),
              ].sort((a, b) => {
                const first = a.due_date ? new Date(a.due_date).getTime() : 0;
                const second = b.due_date ? new Date(b.due_date).getTime() : 0;
                return first - second;
              });

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
                      {course.teacher || "Unassigned"} • {course.credits ?? "-"}{" "}
                      credits
                    </p>
                  </header>

                  {courseAssessments.length === 0 ? (
                    <p className="text-[#47554c]">
                      This course has no assessments.
                    </p>
                  ) : (
                    <div className="course-list-table-wrapper">
                      <table className="course-list-table">
                        <colgroup>
                          <col />
                          <col style={{ width: 96 }} />
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
                                        {hasGrade ? "Unmark" : "Mark completed"}
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
                                          Mark &quot;{assessment.name}&quot; as
                                          completed?
                                        </p>
                                        <p className="course-list-modal-description">
                                          You will be taken to the grade form to
                                          create the note. Once the grade is
                                          saved, the activity will be considered
                                          completed.
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
                                          Unmark &quot;{assessment.name}&quot;?
                                        </p>
                                        <p className="course-list-modal-description">
                                          The grade will be deleted and the
                                          activity will return to pending state.
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
                                          Delete &quot;{assessment.name}&quot;?
                                        </p>
                                        <p className="course-list-modal-description">
                                          This will delete the assessment and
                                          its related grade data. This cannot be
                                          undone.
                                        </p>
                                        <div className="course-list-modal-buttons">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteAssessment(assessment)
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
                  )}
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <FloatingActionMenu ariaLabel="Assessment actions" />
    </main>
  );
}

export default AssessmentList;
