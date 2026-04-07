"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const stages = [
  { id: "upload", label: "Mock Resume Upload" },
  { id: "analysis", label: "Claimed Skills Review" },
  { id: "test", label: "Skill Validation Test" },
  { id: "report", label: "Performance Report" },
];

export default function HomePage() {
  const [activeMode, setActiveMode] = useState(null);
  const [currentStage, setCurrentStage] = useState("upload");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  async function handleResumeUpload(event) {
    event.preventDefault();
    setError("");
    setReport(null);

    if (!resumeFile) {
      setError("Select a resume file to run the mock extraction flow.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      setLoading("Uploading resume and extracting skills...");

      const response = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Resume upload failed.");
      }

      const data = await response.json();
      setResumeData(data.resumeData);
      setQuestions([]);
      setAnswers({});
      setCurrentStage("analysis");
    } catch (uploadError) {
      setError(uploadError.message || "Unable to process the mock resume upload.");
    } finally {
      setLoading("");
    }
  }

  async function handleGenerateTest() {
    if (!resumeData) {
      return;
    }

    try {
      setError("");
      setLoading("Generating skill validation test...");

      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: resumeData.skills,
        }),
      });

      if (!response.ok) {
        throw new Error("Test generation failed.");
      }

      const data = await response.json();
      setQuestions(data.questions);
      setAnswers({});
      setCurrentStage("test");
    } catch (testError) {
      setError(testError.message || "Unable to generate the skill test.");
    } finally {
      setLoading("");
    }
  }

  async function handleEvaluateAssessment(event) {
    event.preventDefault();

    if (!resumeData || !questions.length) {
      return;
    }

    const unansweredQuestions = questions.filter((question) => !answers[question.id]);

    if (unansweredQuestions.length) {
      setError("Answer every question before generating the report.");
      return;
    }

    try {
      setError("");
      setLoading("Evaluating answers and preparing employer report...");

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          questionIds: questions.map((question) => question.id),
          skills: resumeData.skills,
          claimedLevels: resumeData.claimedLevels,
        }),
      });

      if (!response.ok) {
        throw new Error("Evaluation failed.");
      }

      const data = await response.json();
      setReport(data.report);
      setCurrentStage("report");
    } catch (evaluationError) {
      setError(evaluationError.message || "Unable to evaluate answers.");
    } finally {
      setLoading("");
    }
  }

  function resetAssessment() {
    setActiveMode("employer");
    setCurrentStage("upload");
    setResumeFile(null);
    setResumeData(null);
    setQuestions([]);
    setAnswers({});
    setReport(null);
    setError("");
    setLoading("");
  }

  function goToLanding() {
    setActiveMode(null);
    setCurrentStage("upload");
    setResumeFile(null);
    setResumeData(null);
    setQuestions([]);
    setAnswers({});
    setReport(null);
    setError("");
    setLoading("");
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Employer Intelligence Screening</p>
          <h1>VIGIL-AI</h1>
          <p className="hero-text">
            Verify what a resume claims with a fast, skills-aware assessment loop built for hiring teams.
          </p>
        </div>

        {activeMode ? (
          <div className="mode-summary">
            <div>
              <p className="mode-pill">Active Mode</p>
              <strong>Employer Mode</strong>
            </div>
            <button className="ghost-button" onClick={goToLanding} type="button">
              Back to Landing
            </button>
          </div>
        ) : (
          <div className="mode-actions">
            <button className="primary-button" onClick={() => setActiveMode("employer")} type="button">
              Employer Mode
            </button>
            <button className="secondary-button" disabled type="button">
              Student Mode
              <span>Coming soon</span>
            </button>
          </div>
        )}
      </section>

      {activeMode === "employer" && (
        <section className="workspace-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="section-label">Assessment Flow</p>
                <h2>Resume Claim Validation</h2>
              </div>
              <button className="ghost-button" onClick={resetAssessment} type="button">
                Reset
              </button>
            </div>

            <div className="timeline">
              {stages.map((stage) => {
                const activeIndex = stages.findIndex((item) => item.id === currentStage);
                const stageIndex = stages.findIndex((item) => item.id === stage.id);
                const isActive = currentStage === stage.id;
                const isComplete = activeIndex > stageIndex;

                return (
                  <div
                    className={`timeline-step${isActive ? " active" : ""}${isComplete ? " complete" : ""}`}
                    key={stage.id}
                  >
                    <span>{stage.label}</span>
                  </div>
                );
              })}
            </div>

            {loading ? <p className="status-banner">{loading}</p> : null}
            {error ? <p className="error-banner">{error}</p> : null}

            {currentStage === "upload" && (
              <form className="stack" onSubmit={handleResumeUpload}>
                <div className="upload-box">
                  <p>Upload a candidate resume for mock extraction.</p>
                  <label className="upload-input">
                    <span>{resumeFile ? resumeFile.name : "Choose resume file"}</span>
                    <input
                      accept=".pdf,.doc,.docx"
                      onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
                      type="file"
                    />
                  </label>
                  <p className="micro-copy">
                    MVP behavior: the uploaded file triggers a mocked extraction payload for John Doe.
                  </p>
                </div>

                <button className="primary-button" disabled={Boolean(loading)} type="submit">
                  Upload and Extract Skills
                </button>
              </form>
            )}

            {currentStage === "analysis" && resumeData && (
              <div className="stack">
                <div className="candidate-card">
                  <div>
                    <p className="section-label">Candidate</p>
                    <h3>{resumeData.name}</h3>
                  </div>
                  <div className="candidate-meta">
                    <span>{resumeData.roleFit}</span>
                    <span>{resumeData.extractionStatus}</span>
                  </div>
                </div>

                <div className="skill-grid">
                  {resumeData.skills.map((skill) => (
                    <div className="skill-card" key={skill}>
                      <p className="section-label">Claimed Skill</p>
                      <strong>{skill}</strong>
                      <span>{resumeData.claimedLevels[skill]}</span>
                    </div>
                  ))}
                </div>

                <button className="primary-button" disabled={Boolean(loading)} onClick={handleGenerateTest} type="button">
                  Generate Skill Test
                </button>
              </div>
            )}

            {currentStage === "test" && questions.length > 0 && (
              <form className="stack" onSubmit={handleEvaluateAssessment}>
                {questions.map((question, index) => (
                  <div className="question-card" key={question.id}>
                    <div className="question-header">
                      <span>Question {index + 1}</span>
                      <span>{question.skill}</span>
                    </div>
                    <h3>{question.prompt}</h3>
                    <div className="options-grid">
                      {question.options.map((option) => (
                        <label
                          className={`option-tile${answers[question.id] === option.id ? " selected" : ""}`}
                          key={option.id}
                        >
                          <input
                            checked={answers[question.id] === option.id}
                            name={question.id}
                            onChange={() =>
                              setAnswers((currentAnswers) => ({
                                ...currentAnswers,
                                [question.id]: option.id,
                              }))
                            }
                            type="radio"
                            value={option.id}
                          />
                          <span>{option.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button className="primary-button" disabled={Boolean(loading)} type="submit">
                  Evaluate Candidate
                </button>
              </form>
            )}

            {currentStage === "report" && report && resumeData && (
              <div className="stack">
                <div className="report-summary">
                  <div className="metric-card">
                    <span>Overall Score</span>
                    <strong>{report.overallScore}%</strong>
                  </div>
                  <div className="metric-card">
                    <span>Validated Skills</span>
                    <strong>{report.verifiedSkills}</strong>
                  </div>
                  <div className="metric-card">
                    <span>Skill Gaps</span>
                    <strong>{report.gapSkills}</strong>
                  </div>
                  <div className="metric-card">
                    <span>Recommendation</span>
                    <strong>{report.recommendation}</strong>
                  </div>
                </div>

                <div className="panel nested-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="section-label">Claimed vs Actual</p>
                      <h3>Performance Alignment</h3>
                    </div>
                  </div>
                  <div className="chart-wrap">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart data={report.chartData}>
                        <CartesianGrid stroke="rgba(146, 161, 185, 0.2)" strokeDasharray="4 4" />
                        <XAxis dataKey="skill" stroke="#d6deeb" />
                        <YAxis domain={[0, 100]} stroke="#d6deeb" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Claimed" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Actual" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel nested-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="section-label">Employer Summary</p>
                      <h3>{resumeData.name}</h3>
                    </div>
                  </div>
                  <p className="hero-text">{report.narrative}</p>
                  <div className="skill-grid">
                    {report.skillBreakdown.map((skill) => (
                      <div className="skill-card" key={skill.skill}>
                        <p className="section-label">{skill.skill}</p>
                        <strong>
                          {skill.score}% ({skill.correctAnswers}/{skill.totalQuestions})
                        </strong>
                        <span>
                          Claimed: {skill.claimedLevel} | Actual: {skill.actualLevel}
                        </span>
                        <p className="micro-copy">{skill.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel nested-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="section-label">Question Review</p>
                      <h3>Observed Answers</h3>
                    </div>
                  </div>
                  <div className="question-review-list">
                    {report.questionResults.map((item, index) => (
                      <div className="review-item" key={item.id}>
                        <div className="question-header">
                          <span>Q{index + 1}</span>
                          <span className={item.isCorrect ? "tag-success" : "tag-warning"}>
                            {item.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                        <h4>{item.prompt}</h4>
                        <p>
                          <strong>Selected:</strong> {item.selectedOption}
                        </p>
                        <p>
                          <strong>Expected:</strong> {item.correctOption}
                        </p>
                        <p className="micro-copy">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="side-panel">
            <div className="panel sticky-panel">
              <p className="section-label">MVP Scope</p>
              <h2>Working Demo Notes</h2>
              <ul className="notes-list">
                <li>Resume parsing is mocked after file upload.</li>
                <li>Test generation is skill-driven using a local question bank.</li>
                <li>Evaluation compares claimed proficiency against observed quiz performance.</li>
                <li>Student Mode is intentionally disabled for this first release.</li>
              </ul>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
