const baseResumeData = {
  name: "John Doe",
  skills: ["Python", "SQL", "Machine Learning"],
  claimedLevels: {
    Python: "Expert",
    SQL: "Intermediate",
    "Machine Learning": "Expert",
  },
};

const questionBank = [
  {
    id: "python-1",
    skill: "Python",
    prompt: "Which Python data structure keeps insertion order and stores key-value pairs?",
    options: [
      { id: "a", text: "tuple" },
      { id: "b", text: "set" },
      { id: "c", text: "dictionary" },
      { id: "d", text: "generator" },
    ],
    correctOptionId: "c",
    explanation:
      "Python dictionaries store key-value pairs and preserve insertion order in modern Python versions.",
  },
  {
    id: "python-2",
    skill: "Python",
    prompt: "What is the output type of `range(5)` in Python 3?",
    options: [
      { id: "a", text: "list" },
      { id: "b", text: "range object" },
      { id: "c", text: "tuple" },
      { id: "d", text: "iterator string" },
    ],
    correctOptionId: "b",
    explanation:
      "`range(5)` returns a lazy range object, not a list, in Python 3.",
  },
  {
    id: "sql-1",
    skill: "SQL",
    prompt: "Which SQL clause is used to filter grouped records after aggregation?",
    options: [
      { id: "a", text: "WHERE" },
      { id: "b", text: "ORDER BY" },
      { id: "c", text: "HAVING" },
      { id: "d", text: "JOIN" },
    ],
    correctOptionId: "c",
    explanation:
      "`HAVING` filters grouped rows after aggregate functions are applied.",
  },
  {
    id: "sql-2",
    skill: "SQL",
    prompt: "Which query returns unique department names from an `employees` table?",
    options: [
      { id: "a", text: "SELECT UNIQUE department FROM employees;" },
      { id: "b", text: "SELECT DISTINCT department FROM employees;" },
      { id: "c", text: "SELECT department ONLY FROM employees;" },
      { id: "d", text: "SELECT department GROUPED FROM employees;" },
    ],
    correctOptionId: "b",
    explanation:
      "`DISTINCT` removes duplicate values from the result set.",
  },
  {
    id: "ml-1",
    skill: "Machine Learning",
    prompt: "Which metric is commonly used to evaluate a binary classifier when classes are imbalanced?",
    options: [
      { id: "a", text: "Accuracy only" },
      { id: "b", text: "Precision-recall tradeoff" },
      { id: "c", text: "Mean squared error" },
      { id: "d", text: "R-squared" },
    ],
    correctOptionId: "b",
    explanation:
      "Precision and recall help evaluate classifiers more fairly under class imbalance.",
  },
  {
    id: "ml-2",
    skill: "Machine Learning",
    prompt: "What does overfitting usually mean in a machine learning model?",
    options: [
      { id: "a", text: "The model performs well on training data but poorly on new data." },
      { id: "b", text: "The model has too little data to train at all." },
      { id: "c", text: "The model uses a GPU during training." },
      { id: "d", text: "The model is always linear." },
    ],
    correctOptionId: "a",
    explanation:
      "Overfitting happens when a model memorizes training data patterns and generalizes poorly.",
  },
];

const claimedLevelBenchmark = {
  Beginner: 35,
  Intermediate: 65,
  Expert: 90,
};

const levelRank = {
  Beginner: 1,
  Intermediate: 2,
  Expert: 3,
};

function mapScoreToLevel(score) {
  if (score >= 80) {
    return "Expert";
  }

  if (score >= 55) {
    return "Intermediate";
  }

  return "Beginner";
}

function sanitizeQuestion(question) {
  return {
    id: question.id,
    skill: question.skill,
    prompt: question.prompt,
    options: question.options,
  };
}

function getQuestionsByIds(questionIds) {
  const idSet = new Set(questionIds);
  return questionBank.filter((question) => idSet.has(question.id));
}

function buildSkillInsight(skillResult) {
  const claimedRank = levelRank[skillResult.claimedLevel] ?? levelRank.Beginner;
  const actualRank = levelRank[skillResult.actualLevel] ?? levelRank.Beginner;

  if (actualRank >= claimedRank) {
    return "Claim validated";
  }

  if (claimedRank - actualRank === 1) {
    return "Claim slightly ahead of observed performance";
  }

  return "High mismatch between claimed and demonstrated level";
}

function buildRecommendation(overallScore, gapCount) {
  if (overallScore >= 80 && gapCount === 0) {
    return "Strong shortlist";
  }

  if (overallScore >= 60) {
    return "Proceed with a focused technical interview";
  }

  return "Needs deeper validation before shortlist";
}

function buildNarrative(overallScore, verifiedCount, gapCount) {
  if (overallScore >= 80) {
    return `Candidate demonstrates strong alignment between resume claims and live assessment, with ${verifiedCount} validated skill areas.`;
  }

  if (overallScore >= 60) {
    return `Candidate shows usable fundamentals, but ${gapCount} skill area(s) should be probed further in interview.`;
  }

  return "Assessment indicates a clear gap between claimed proficiency and observed performance in the MVP screening round.";
}

export function getMockResume(fileName) {
  return {
    ...baseResumeData,
    uploadedFileName: fileName,
    extractionStatus: "Mock extraction complete",
    roleFit: "AI / Data Candidate",
  };
}

export function generateQuestionsForSkills(skills = []) {
  const selectedSkills = skills.length ? skills : baseResumeData.skills;

  return questionBank
    .filter((question) => selectedSkills.includes(question.skill))
    .map(sanitizeQuestion);
}

export function evaluateAssessment({
  answers = {},
  questionIds = [],
  skills = [],
  claimedLevels = {},
}) {
  const selectedQuestions = getQuestionsByIds(questionIds);
  const selectedSkills = skills.length
    ? skills
    : [...new Set(selectedQuestions.map((question) => question.skill))];

  let totalCorrect = 0;

  const questionResults = selectedQuestions.map((question) => {
    const selectedOptionId = answers[question.id] ?? null;
    const selectedOption =
      question.options.find((option) => option.id === selectedOptionId)?.text ?? "No answer selected";
    const correctOption =
      question.options.find((option) => option.id === question.correctOptionId)?.text ?? "Not available";
    const isCorrect = selectedOptionId === question.correctOptionId;

    if (isCorrect) {
      totalCorrect += 1;
    }

    return {
      id: question.id,
      skill: question.skill,
      prompt: question.prompt,
      selectedOption,
      correctOption,
      isCorrect,
      explanation: question.explanation,
    };
  });

  const overallScore = selectedQuestions.length
    ? Math.round((totalCorrect / selectedQuestions.length) * 100)
    : 0;

  const skillBreakdown = selectedSkills.map((skill) => {
    const skillQuestions = questionResults.filter((result) => result.skill === skill);
    const correctAnswers = skillQuestions.filter((result) => result.isCorrect).length;
    const score = skillQuestions.length
      ? Math.round((correctAnswers / skillQuestions.length) * 100)
      : 0;
    const claimedLevel = claimedLevels[skill] ?? "Beginner";
    const actualLevel = mapScoreToLevel(score);

    return {
      skill,
      claimedLevel,
      actualLevel,
      score,
      correctAnswers,
      totalQuestions: skillQuestions.length,
      insight: buildSkillInsight({ claimedLevel, actualLevel }),
    };
  });

  const verifiedSkills = skillBreakdown.filter((skill) => {
    return (levelRank[skill.actualLevel] ?? 1) >= (levelRank[skill.claimedLevel] ?? 1);
  }).length;

  const gapSkills = skillBreakdown.filter((skill) => {
    return (levelRank[skill.actualLevel] ?? 1) < (levelRank[skill.claimedLevel] ?? 1);
  }).length;

  const chartData = skillBreakdown.map((skill) => ({
    skill: skill.skill,
    Claimed: claimedLevelBenchmark[skill.claimedLevel] ?? claimedLevelBenchmark.Beginner,
    Actual: skill.score,
  }));

  return {
    overallScore,
    totalQuestions: selectedQuestions.length,
    correctAnswers: totalCorrect,
    verifiedSkills,
    gapSkills,
    recommendation: buildRecommendation(overallScore, gapSkills),
    narrative: buildNarrative(overallScore, verifiedSkills, gapSkills),
    skillBreakdown,
    questionResults,
    chartData,
  };
}
