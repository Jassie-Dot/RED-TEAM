module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/lib/groqClient.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callGroqJson",
    ()=>callGroqJson,
    "hasGroqCredentials",
    ()=>hasGroqCredentials
]);
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
function hasGroqCredentials() {
    return Boolean(process.env.GROQ_API_KEY);
}
function extractJsonBlock(content = "") {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("Groq response did not contain JSON.");
    }
    return content.slice(start, end + 1);
}
async function callGroqJson({ systemPrompt, userPrompt, temperature = 0.2, maxTokens = 1800 }) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY.");
    }
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: DEFAULT_MODEL,
            temperature,
            max_tokens: maxTokens,
            response_format: {
                type: "json_object"
            },
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ]
        })
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq request failed with ${response.status}: ${errorText}`);
    }
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Groq response was empty.");
    }
    return JSON.parse(extractJsonBlock(content));
}
}),
"[project]/lib/resumeScreening.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeUploadedResume",
    ()=>analyzeUploadedResume,
    "evaluateResumeAuthenticity",
    ()=>evaluateResumeAuthenticity,
    "extractResumeTextFromFile",
    ()=>extractResumeTextFromFile,
    "generateQuestionsForScreening",
    ()=>generateQuestionsForScreening
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mammoth$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mammoth/lib/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$parse$2f$dist$2f$pdf$2d$parse$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-parse/dist/pdf-parse/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$parse$2f$dist$2f$pdf$2d$parse$2f$esm$2f$PDFParse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-parse/dist/pdf-parse/esm/PDFParse.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/groqClient.js [app-route] (ecmascript)");
;
;
;
const LEVEL_SCORE = {
    Foundational: 35,
    Intermediate: 62,
    Advanced: 82,
    Expert: 94
};
const LEVEL_RANK = {
    Foundational: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4
};
const SKILLS = [
    {
        name: "Python",
        keywords: [
            "python",
            "pandas",
            "numpy",
            "fastapi",
            "flask",
            "django"
        ]
    },
    {
        name: "SQL",
        keywords: [
            "sql",
            "postgres",
            "postgresql",
            "mysql",
            "sqlite",
            "snowflake"
        ]
    },
    {
        name: "Machine Learning",
        keywords: [
            "machine learning",
            "tensorflow",
            "pytorch",
            "scikit",
            "xgboost"
        ]
    },
    {
        name: "React",
        keywords: [
            "react",
            "redux",
            "hooks",
            "frontend"
        ]
    },
    {
        name: "Node.js",
        keywords: [
            "node.js",
            "nodejs",
            "express",
            "nest",
            "backend"
        ]
    },
    {
        name: "Next.js",
        keywords: [
            "next.js",
            "nextjs"
        ]
    },
    {
        name: "JavaScript",
        keywords: [
            "javascript",
            "ecmascript"
        ]
    },
    {
        name: "TypeScript",
        keywords: [
            "typescript"
        ]
    },
    {
        name: "AWS",
        keywords: [
            "aws",
            "lambda",
            "s3",
            "ec2"
        ]
    },
    {
        name: "Docker",
        keywords: [
            "docker",
            "containers",
            "containerization"
        ]
    },
    {
        name: "Git",
        keywords: [
            "git",
            "github",
            "gitlab"
        ]
    }
];
const QUESTION_BANK = {
    Python: [
        {
            skill: "Python",
            difficulty: "Intermediate",
            prompt: "Which Python structure stores key-value pairs while preserving insertion order?",
            options: [
                {
                    id: "a",
                    text: "set"
                },
                {
                    id: "b",
                    text: "dictionary"
                },
                {
                    id: "c",
                    text: "tuple"
                },
                {
                    id: "d",
                    text: "generator"
                }
            ],
            correctOptionId: "b",
            rationale: "Modern Python dictionaries preserve insertion order and store key-value pairs."
        },
        {
            skill: "Python",
            difficulty: "Advanced",
            prompt: "Why would a team use a generator in Python?",
            options: [
                {
                    id: "a",
                    text: "To lazily produce values and save memory"
                },
                {
                    id: "b",
                    text: "To sort data automatically"
                },
                {
                    id: "c",
                    text: "To remove imports"
                },
                {
                    id: "d",
                    text: "To replace exceptions"
                }
            ],
            correctOptionId: "a",
            rationale: "Generators are useful for lazy iteration over large datasets or streams."
        }
    ],
    SQL: [
        {
            skill: "SQL",
            difficulty: "Intermediate",
            prompt: "Which clause filters grouped rows after aggregation?",
            options: [
                {
                    id: "a",
                    text: "WHERE"
                },
                {
                    id: "b",
                    text: "HAVING"
                },
                {
                    id: "c",
                    text: "ORDER BY"
                },
                {
                    id: "d",
                    text: "JOIN"
                }
            ],
            correctOptionId: "b",
            rationale: "HAVING filters after GROUP BY aggregation is computed."
        },
        {
            skill: "SQL",
            difficulty: "Advanced",
            prompt: "What is a common way to improve lookups on a heavily filtered column?",
            options: [
                {
                    id: "a",
                    text: "Create an index"
                },
                {
                    id: "b",
                    text: "Duplicate the table"
                },
                {
                    id: "c",
                    text: "Drop the primary key"
                },
                {
                    id: "d",
                    text: "Convert values to images"
                }
            ],
            correctOptionId: "a",
            rationale: "Indexes reduce scan cost on common lookup patterns."
        }
    ],
    "Machine Learning": [
        {
            skill: "Machine Learning",
            difficulty: "Intermediate",
            prompt: "Which metric is often more useful than raw accuracy on imbalanced binary data?",
            options: [
                {
                    id: "a",
                    text: "Precision-recall tradeoff"
                },
                {
                    id: "b",
                    text: "Only training accuracy"
                },
                {
                    id: "c",
                    text: "R-squared"
                },
                {
                    id: "d",
                    text: "Mean squared error for everything"
                }
            ],
            correctOptionId: "a",
            rationale: "Precision and recall reveal minority-class performance better than accuracy alone."
        },
        {
            skill: "Machine Learning",
            difficulty: "Advanced",
            prompt: "What most strongly suggests overfitting?",
            options: [
                {
                    id: "a",
                    text: "Excellent training results but weak validation performance"
                },
                {
                    id: "b",
                    text: "Using a train and validation split"
                },
                {
                    id: "c",
                    text: "Applying regularization"
                },
                {
                    id: "d",
                    text: "Collecting more data"
                }
            ],
            correctOptionId: "a",
            rationale: "Overfitting appears when a model memorizes training data and generalizes poorly."
        }
    ],
    React: [
        {
            skill: "React",
            difficulty: "Intermediate",
            prompt: "What is React state mainly for?",
            options: [
                {
                    id: "a",
                    text: "Holding data that can trigger UI updates"
                },
                {
                    id: "b",
                    text: "Replacing CSS"
                },
                {
                    id: "c",
                    text: "Persisting files to disk"
                },
                {
                    id: "d",
                    text: "Eliminating components"
                }
            ],
            correctOptionId: "a",
            rationale: "State stores dynamic values used by the UI."
        },
        {
            skill: "React",
            difficulty: "Advanced",
            prompt: "Why is a stable `key` important when rendering lists?",
            options: [
                {
                    id: "a",
                    text: "It helps React reconcile list items predictably"
                },
                {
                    id: "b",
                    text: "It encrypts props"
                },
                {
                    id: "c",
                    text: "It removes re-renders completely"
                },
                {
                    id: "d",
                    text: "It replaces hooks"
                }
            ],
            correctOptionId: "a",
            rationale: "React uses keys to understand item identity across re-renders."
        }
    ],
    "Node.js": [
        {
            skill: "Node.js",
            difficulty: "Intermediate",
            prompt: "Why is Node.js good for I/O-heavy systems?",
            options: [
                {
                    id: "a",
                    text: "It uses an event-driven non-blocking model"
                },
                {
                    id: "b",
                    text: "It handles only one request per minute"
                },
                {
                    id: "c",
                    text: "It replaces databases"
                },
                {
                    id: "d",
                    text: "It removes network latency"
                }
            ],
            correctOptionId: "a",
            rationale: "Node excels at coordinating many concurrent I/O operations."
        },
        {
            skill: "Node.js",
            difficulty: "Advanced",
            prompt: "What is middleware in an Express-style app?",
            options: [
                {
                    id: "a",
                    text: "A function in the request-response chain"
                },
                {
                    id: "b",
                    text: "A CSS stylesheet"
                },
                {
                    id: "c",
                    text: "A database backup"
                },
                {
                    id: "d",
                    text: "A build artifact"
                }
            ],
            correctOptionId: "a",
            rationale: "Middleware can inspect or modify requests and responses."
        }
    ]
};
function clean(value = "") {
    return value.replace(/\u0000/g, " ").replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
}
function normalizeText(value = "") {
    return value.replace(/\u0000/g, " ").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function uniqueBy(items, keyFn) {
    const seen = new Set();
    return items.filter((item)=>{
        const key = keyFn(item);
        if (!key || seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
function slugify(value = "") {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function normalizeLevel(value = "") {
    const lower = clean(String(value)).toLowerCase();
    if ([
        "expert",
        "principal",
        "lead"
    ].some((token)=>lower.includes(token))) return "Expert";
    if ([
        "advanced",
        "senior",
        "strong"
    ].some((token)=>lower.includes(token))) return "Advanced";
    if ([
        "intermediate",
        "proficient",
        "working"
    ].some((token)=>lower.includes(token))) return "Intermediate";
    return "Foundational";
}
function scoreToLevel(score) {
    if (score >= 85) return "Expert";
    if (score >= 68) return "Advanced";
    if (score >= 45) return "Intermediate";
    return "Foundational";
}
function roleFit(textLower) {
    if ([
        "machine learning",
        "llm",
        "pytorch",
        "tensorflow"
    ].some((token)=>textLower.includes(token))) return "AI / Machine Learning Candidate";
    if ([
        "react",
        "next.js",
        "node",
        "typescript"
    ].some((token)=>textLower.includes(token))) return "Full-Stack Product Engineer";
    if ([
        "sql",
        "analytics",
        "power bi",
        "tableau"
    ].some((token)=>textLower.includes(token))) return "Data / Analytics Candidate";
    if ([
        "aws",
        "docker",
        "cloud",
        "devops"
    ].some((token)=>textLower.includes(token))) return "Cloud / Platform Engineer";
    return "General Technology Candidate";
}
function contacts(text) {
    return {
        email: text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "Not detected",
        phone: text.match(/(?:\+?\d{1,3}[ -]?)?(?:\(?\d{3}\)?[ -]?)?\d{3}[ -]?\d{4}/)?.[0] ?? "Not detected",
        linkedin: text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[A-Za-z0-9\-_/]+/i)?.[0] ?? "Not detected"
    };
}
function candidateName(lines) {
    const ignored = /resume|curriculum|vitae|profile|summary|experience|education|skills/i;
    for (const line of lines.slice(0, 10)){
        const cleaned = clean(line).replace(/[^A-Za-z .'-]/g, "");
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (!ignored.test(cleaned) && parts.length >= 2 && parts.length <= 4) return cleaned;
    }
    return "Candidate Under Review";
}
function currentTitle(lines, textLower) {
    const titles = [
        "Software Engineer",
        "Full Stack Developer",
        "Frontend Developer",
        "Backend Developer",
        "Data Analyst",
        "Data Scientist",
        "Machine Learning Engineer",
        "DevOps Engineer"
    ];
    const found = titles.find((title)=>textLower.includes(title.toLowerCase()));
    if (found) return found;
    return lines.find((line)=>/engineer|developer|analyst|scientist|manager/i.test(line)) ?? roleFit(textLower);
}
function years(textLower) {
    const exact = textLower.match(/(\d{1,2})\+?\s*(?:years|yrs)\s+of\s+experience/);
    if (exact) return `${exact[1]}+ years`;
    const range = textLower.match(/(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\s*(?:years|yrs)/);
    if (range) return `${range[1]}-${range[2]} years`;
    return "Experience not clearly stated";
}
function evidenceSnippet(textLower, originalText, keyword) {
    const index = textLower.indexOf(keyword.toLowerCase());
    if (index === -1) return "Referenced in resume";
    return clean(originalText.slice(Math.max(0, index - 70), Math.min(originalText.length, index + keyword.length + 70)));
}
function inferredSkillLevel(textLower, keyword) {
    const index = textLower.indexOf(keyword.toLowerCase());
    if (index === -1) return "Intermediate";
    return normalizeLevel(textLower.slice(Math.max(0, index - 80), Math.min(textLower.length, index + keyword.length + 80)));
}
function projectLines(lines) {
    return lines.filter((line)=>/built|developed|designed|led|implemented|launched|created/i.test(line)).slice(0, 3).map((line, index)=>({
            name: `Project ${index + 1}`,
            impact: clean(line),
            stack: SKILLS.filter((skill)=>skill.keywords.some((keyword)=>line.toLowerCase().includes(keyword))).map((skill)=>skill.name).slice(0, 4)
        }));
}
function educationLines(lines) {
    return lines.filter((line)=>/bachelor|master|b\.tech|m\.tech|degree|university|college/i.test(line)).slice(0, 2).map((line)=>({
            label: clean(line)
        }));
}
function riskSignals({ text, foundSkills, personContacts, title }) {
    const lower = text.toLowerCase();
    const result = [];
    if ((lower.match(/expert|guru|ninja|visionary/g) || []).length >= 3) result.push("Resume uses repeated hype language around expertise claims.");
    if (foundSkills.length >= 10) result.push("Very broad skill spread detected and may require deeper validation.");
    if (personContacts.email === "Not detected" || personContacts.phone === "Not detected") result.push("Contact metadata is incomplete or difficult to detect.");
    if (!/\b20\d{2}\b/.test(text)) result.push("Timeline markers are sparse, which makes chronology harder to verify.");
    if (/intern/i.test(title) && /lead|architect|principal/i.test(lower)) result.push("Title language appears inconsistent across the resume.");
    return result.slice(0, 4);
}
function heuristicAnalysis({ resumeText, fileName }) {
    const normalized = normalizeText(resumeText);
    const lower = normalized.toLowerCase();
    const lines = normalized.split("\n").map((line)=>clean(line)).filter(Boolean);
    const foundContacts = contacts(normalized);
    const foundSkills = uniqueBy(SKILLS.filter((skill)=>skill.keywords.some((keyword)=>lower.includes(keyword))).map((skill)=>({
            name: skill.name,
            level: inferredSkillLevel(lower, skill.keywords[0]),
            evidence: evidenceSnippet(lower, normalized, skill.keywords[0]),
            confidence: clamp(60 + skill.keywords.filter((keyword)=>lower.includes(keyword)).length * 10, 55, 96)
        })), (skill)=>skill.name).slice(0, 6);
    const title = currentTitle(lines, lower);
    const signals = riskSignals({
        text: normalized,
        foundSkills,
        personContacts: foundContacts,
        title
    });
    return {
        candidateName: candidateName(lines),
        currentTitle: title,
        yearsOfExperience: years(lower),
        location: lines.find((line)=>/india|usa|remote|hybrid|bangalore|delhi|mumbai|pune|new york|san francisco|london/i.test(line)) ?? "Location not clearly stated",
        summary: clean(lines.slice(0, 5).join(" ")).slice(0, 260) || "Resume uploaded for skill authenticity screening.",
        roleFit: roleFit(lower),
        uploadedFileName: fileName,
        contacts: foundContacts,
        skills: foundSkills.length ? foundSkills : [
            {
                name: "General Technology",
                level: "Intermediate",
                evidence: "Resume text was limited, so a broad placeholder skill was created.",
                confidence: 52
            }
        ],
        projects: projectLines(lines),
        education: educationLines(lines),
        riskSignals: signals,
        confidenceNotes: [
            "Heuristic mode uses detected keywords when the Groq key is missing or an API call fails.",
            "Upload text quality directly affects extraction confidence and interview quality."
        ],
        initialRiskScore: clamp(30 + signals.length * 12 + Math.max(0, foundSkills.length - 4) * 4, 18, 84),
        analysisMode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasGroqCredentials"])() ? "Groq fallback analysis" : "Local fallback analysis",
        extractedTextPreview: normalized.slice(0, 700)
    };
}
function normalizeSkillName(value = "") {
    const cleaned = clean(value);
    const exact = SKILLS.find((skill)=>skill.name.toLowerCase() === cleaned.toLowerCase());
    if (exact) return exact.name;
    const keywordMatch = SKILLS.find((skill)=>skill.keywords.some((keyword)=>keyword === cleaned.toLowerCase()));
    return keywordMatch?.name ?? cleaned;
}
function normalizeSkills(skills, resumeText) {
    const lower = resumeText.toLowerCase();
    return uniqueBy((Array.isArray(skills) ? skills : []).map((skill)=>{
        if (typeof skill === "string") {
            return {
                name: normalizeSkillName(skill),
                level: inferredSkillLevel(lower, skill),
                evidence: evidenceSnippet(lower, resumeText, skill),
                confidence: 70
            };
        }
        const name = normalizeSkillName(skill?.name || skill?.skill || "");
        return {
            name,
            level: normalizeLevel(skill?.level || skill?.claimedLevel || skill?.proficiency),
            evidence: clean(skill?.evidence || skill?.reason || evidenceSnippet(lower, resumeText, name)),
            confidence: clamp(Number(skill?.confidence ?? 72), 45, 99)
        };
    }).filter((skill)=>skill.name), (skill)=>skill.name).slice(0, 6);
}
function normalizeQuestion(question, index) {
    const options = (Array.isArray(question?.options) ? question.options : []).slice(0, 4).map((option, optionIndex)=>({
            id: clean(option?.id || "").toLowerCase() || String.fromCharCode(97 + optionIndex),
            text: clean(option?.text || option?.label || `Option ${optionIndex + 1}`)
        }));
    const correctOptionId = clean(question?.correctOptionId || "").toLowerCase();
    return {
        id: clean(question?.id || `${slugify(question?.skill || "question")}-${index + 1}`),
        skill: normalizeSkillName(question?.skill || "General Technology"),
        difficulty: clean(question?.difficulty || "Intermediate"),
        prompt: clean(question?.prompt || "Explain how you would solve a practical problem in this skill."),
        options,
        correctOptionId: options.some((option)=>option.id === correctOptionId) ? correctOptionId : options[0]?.id ?? "a",
        rationale: clean(question?.rationale || "Correct answer rationale unavailable.")
    };
}
function localQuestions(skillObjects) {
    const result = [];
    for (const skill of skillObjects.slice(0, 3).map((item)=>item.name)){
        const bank = QUESTION_BANK[skill];
        if (bank?.length) {
            result.push(...bank.map((question, index)=>normalizeQuestion({
                    ...question,
                    id: `${slugify(skill)}-${index + 1}`
                }, result.length + index)));
            continue;
        }
        result.push(normalizeQuestion({
            id: `${slugify(skill)}-1`,
            skill,
            prompt: `Which option best demonstrates practical competence in ${skill}?`,
            options: [
                {
                    id: "a",
                    text: "Explaining tradeoffs and real implementation choices"
                },
                {
                    id: "b",
                    text: "Only recognizing the tool name"
                },
                {
                    id: "c",
                    text: "Avoiding examples completely"
                },
                {
                    id: "d",
                    text: "Claiming expertise without proof"
                }
            ],
            correctOptionId: "a",
            rationale: "Practical competence includes concrete decision-making and implementation understanding."
        }, result.length));
    }
    return result.slice(0, 6);
}
function mergeAnalysis(fallback, aiAnalysis, resumeText, fileName) {
    const mergedSkills = normalizeSkills(aiAnalysis?.skills, resumeText);
    const mergedSignals = uniqueBy([
        ...Array.isArray(aiAnalysis?.riskSignals) ? aiAnalysis.riskSignals : [],
        ...fallback.riskSignals || []
    ].map((item)=>clean(item)).filter(Boolean), (item)=>item).slice(0, 4);
    return {
        candidateName: clean(aiAnalysis?.candidateName || aiAnalysis?.name || fallback.candidateName),
        currentTitle: clean(aiAnalysis?.currentTitle || aiAnalysis?.headline || fallback.currentTitle),
        yearsOfExperience: clean(aiAnalysis?.yearsOfExperience || fallback.yearsOfExperience),
        location: clean(aiAnalysis?.location || fallback.location),
        summary: clean(aiAnalysis?.summary || fallback.summary),
        roleFit: clean(aiAnalysis?.roleFit || fallback.roleFit),
        uploadedFileName: fileName,
        contacts: {
            email: clean(aiAnalysis?.contacts?.email || fallback.contacts.email),
            phone: clean(aiAnalysis?.contacts?.phone || fallback.contacts.phone),
            linkedin: clean(aiAnalysis?.contacts?.linkedin || fallback.contacts.linkedin)
        },
        skills: mergedSkills.length ? mergedSkills : fallback.skills,
        projects: Array.isArray(aiAnalysis?.projects) && aiAnalysis.projects.length ? aiAnalysis.projects.slice(0, 3) : fallback.projects,
        education: Array.isArray(aiAnalysis?.education) && aiAnalysis.education.length ? aiAnalysis.education.slice(0, 2) : fallback.education,
        riskSignals: mergedSignals.length ? mergedSignals : fallback.riskSignals,
        confidenceNotes: uniqueBy([
            ...Array.isArray(aiAnalysis?.confidenceNotes) ? aiAnalysis.confidenceNotes : [],
            ...fallback.confidenceNotes || []
        ].map((item)=>clean(item)).filter(Boolean), (item)=>item).slice(0, 4),
        initialRiskScore: clamp(Number(aiAnalysis?.initialRiskScore ?? fallback.initialRiskScore), 0, 100),
        analysisMode: "Groq live analysis",
        extractedTextPreview: fallback.extractedTextPreview
    };
}
async function groqResumeAnalysis({ resumeText, fallback }) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callGroqJson"])({
        systemPrompt: "You are a technical recruiter and resume fraud analyst. Return only JSON grounded in the supplied resume text.",
        userPrompt: `Analyze this resume and return JSON with exact keys: candidateName, currentTitle, yearsOfExperience, location, summary, roleFit, contacts, skills, projects, education, riskSignals, confidenceNotes, initialRiskScore.

Rules:
- skills must be objects with name, level, evidence, confidence.
- level must be one of Foundational, Intermediate, Advanced, Expert.
- projects must contain name, impact, stack.
- education must contain label.
- riskSignals and confidenceNotes must each have 2 to 4 short strings.
- initialRiskScore must be an integer 0-100 where higher means more suspicious.
- Only use details actually supported by the text.

Resume:
${resumeText.slice(0, 12000)}`,
        temperature: 0.1,
        maxTokens: 1600
    });
    return mergeAnalysis(fallback, response, resumeText, fallback.uploadedFileName);
}
async function groqQuestions({ resumeData, resumeText }) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callGroqJson"])({
        systemPrompt: "You generate realistic technical screening questions for hiring teams. Return only JSON.",
        userPrompt: `Create exactly 6 multiple-choice questions to test whether the candidate truly understands their claimed skills.

Return JSON with one key: questions.
Each question must include: id, skill, difficulty, prompt, options, correctOptionId, rationale.
Options must contain exactly 4 answers with ids a, b, c, d.
Prioritize these skills: ${resumeData.skills.map((skill)=>`${skill.name} (${skill.level})`).join(", ")}.

Candidate summary:
${resumeData.summary}

Resume excerpt:
${resumeText.slice(0, 6000)}`,
        temperature: 0.25,
        maxTokens: 1700
    });
    const prepared = (Array.isArray(response?.questions) ? response.questions : []).map(normalizeQuestion).filter((question)=>question.options.length === 4);
    return prepared.length ? prepared.slice(0, 6) : localQuestions(resumeData.skills);
}
function questionResults(questions, answers) {
    let totalCorrect = 0;
    const results = questions.map((question)=>{
        const selectedId = clean(answers?.[question.id] || "").toLowerCase();
        const selectedOption = question.options.find((option)=>option.id === selectedId)?.text ?? "No answer selected";
        const correctOption = question.options.find((option)=>option.id === question.correctOptionId)?.text ?? "Correct option unavailable";
        const isCorrect = selectedId === question.correctOptionId;
        if (isCorrect) totalCorrect += 1;
        return {
            id: question.id,
            skill: question.skill,
            prompt: question.prompt,
            difficulty: question.difficulty,
            selectedOption,
            correctOption,
            isCorrect,
            rationale: question.rationale
        };
    });
    return {
        results,
        totalCorrect
    };
}
function skillBreakdown(results, resumeData) {
    return resumeData.skills.map((skill)=>{
        const relevant = results.filter((result)=>result.skill === skill.name);
        const correctAnswers = relevant.filter((result)=>result.isCorrect).length;
        const score = relevant.length ? Math.round(correctAnswers / relevant.length * 100) : 0;
        const claimedLevel = normalizeLevel(skill.level);
        const actualLevel = scoreToLevel(score);
        const delta = (LEVEL_RANK[claimedLevel] ?? 2) - (LEVEL_RANK[actualLevel] ?? 1);
        let insight = "Claim aligns with observed answers.";
        if (delta === 1) insight = "Claim is slightly ahead of interview performance and should be validated live.";
        if (delta >= 2) insight = "Claim significantly exceeds demonstrated knowledge and is a strong risk signal.";
        return {
            skill: skill.name,
            claimedLevel,
            actualLevel,
            score,
            correctAnswers,
            totalQuestions: relevant.length,
            evidence: skill.evidence,
            confidence: skill.confidence,
            insight
        };
    });
}
function verdictFromScore(score, gapSkills) {
    if (score >= 78 && gapSkills === 0) return "Likely Original";
    if (score >= 55) return "Needs Deeper Validation";
    return "Likely Inflated / Fake Risk";
}
function recommendation(verdict) {
    if (verdict === "Likely Original") return "Proceed to a live technical interview with confidence.";
    if (verdict === "Needs Deeper Validation") return "Run a focused panel interview on the mismatched skill areas before shortlisting.";
    return "Pause shortlist progression and require stronger evidence or supervised live verification.";
}
function localReport({ answers, questions, resumeData }) {
    const { results, totalCorrect } = questionResults(questions, answers);
    const overallScore = questions.length ? Math.round(totalCorrect / questions.length * 100) : 0;
    const skills = skillBreakdown(results, resumeData);
    const gapSkills = skills.filter((skill)=>(LEVEL_RANK[skill.actualLevel] ?? 1) < (LEVEL_RANK[skill.claimedLevel] ?? 1)).length;
    const severeGapSkills = skills.filter((skill)=>(LEVEL_RANK[skill.claimedLevel] ?? 1) - (LEVEL_RANK[skill.actualLevel] ?? 1) >= 2).length;
    const verifiedSkills = skills.length - gapSkills;
    const consistencyScore = 100 - gapSkills * 16 - severeGapSkills * 10;
    const authenticityScore = clamp(Math.round(overallScore * 0.72 + clamp(consistencyScore, 10, 100) * 0.18 + (100 - resumeData.initialRiskScore) * 0.1), 0, 100);
    const authenticityVerdict = verdictFromScore(authenticityScore, gapSkills);
    return {
        overallScore,
        authenticityScore,
        authenticityVerdict,
        verifiedSkills,
        gapSkills,
        recommendation: recommendation(authenticityVerdict),
        narrative: authenticityVerdict === "Likely Original" ? `${resumeData.candidateName} showed strong alignment between claimed expertise and observed answers.` : authenticityVerdict === "Needs Deeper Validation" ? `${resumeData.candidateName} shows some real signal, but the screening uncovered gaps that need live follow-up.` : `${resumeData.candidateName} shows a meaningful mismatch between resume claims and screening answers.`,
        riskSummary: resumeData.riskSignals[0] || "No major pre-interview anomalies were detected from the resume text.",
        chartData: skills.map((skill)=>({
                skill: skill.skill,
                Claimed: LEVEL_SCORE[skill.claimedLevel] ?? 50,
                Observed: skill.score
            })),
        signalCards: [
            {
                label: "Interview Accuracy",
                value: `${overallScore}%`,
                tone: overallScore >= 70 ? "good" : overallScore >= 50 ? "warn" : "risk"
            },
            {
                label: "Authenticity Confidence",
                value: `${authenticityScore}%`,
                tone: authenticityScore >= 70 ? "good" : authenticityScore >= 50 ? "warn" : "risk"
            },
            {
                label: "Resume Risk Signals",
                value: `${resumeData.riskSignals.length}`,
                tone: resumeData.riskSignals.length <= 1 ? "good" : resumeData.riskSignals.length <= 2 ? "warn" : "risk"
            },
            {
                label: "Pipeline",
                value: resumeData.analysisMode.includes("Groq") ? "Groq" : "Fallback",
                tone: "neutral"
            }
        ],
        interviewInsights: [
            gapSkills === 0 ? "No claimed skill fell below the demonstrated level threshold in this round." : `${gapSkills} claimed skill area(s) performed below the advertised proficiency level.`,
            severeGapSkills > 0 ? `${severeGapSkills} skill area(s) showed a severe claim-to-performance gap.` : "No severe mismatches were detected in the answer set.",
            resumeData.riskSignals[0] || "Resume text quality was sufficient for analysis."
        ],
        followUps: [
            recommendation(authenticityVerdict),
            gapSkills > 0 ? "Ask for project walk-throughs proving ownership on the weakest skills." : "Use project deep dives to verify depth, not just recall.",
            "Cross-check employment timeline and portfolio links before a final hiring decision."
        ],
        skillBreakdown: skills,
        questionResults: results,
        totalQuestions: questions.length,
        correctAnswers: totalCorrect
    };
}
async function groqEvaluation({ resumeData, local }) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callGroqJson"])({
        systemPrompt: "You are a technical hiring evaluator deciding whether a resume appears genuine, inflated, or fake after a screening quiz. Return only JSON.",
        userPrompt: `Return JSON with exact keys: authenticityVerdict, authenticityScore, recommendation, narrative, riskSummary, interviewInsights, followUps.

Rules:
- authenticityVerdict must be one of: Likely Original, Needs Deeper Validation, Likely Inflated / Fake Risk.
- authenticityScore must be an integer 0-100 where higher means more likely genuine.
- interviewInsights and followUps must each contain 2 to 4 short strings.
- Base the answer only on the evidence below.

Resume summary:
${JSON.stringify({
            candidateName: resumeData.candidateName,
            currentTitle: resumeData.currentTitle,
            roleFit: resumeData.roleFit,
            initialRiskScore: resumeData.initialRiskScore,
            riskSignals: resumeData.riskSignals,
            skills: resumeData.skills
        })}

Local evaluation:
${JSON.stringify({
            overallScore: local.overallScore,
            authenticityScore: local.authenticityScore,
            verifiedSkills: local.verifiedSkills,
            gapSkills: local.gapSkills,
            skillBreakdown: local.skillBreakdown,
            questionResults: local.questionResults
        })}`,
        temperature: 0.15,
        maxTokens: 1200
    });
    return {
        authenticityVerdict: clean(response?.authenticityVerdict),
        authenticityScore: clamp(Number(response?.authenticityScore ?? local.authenticityScore), 0, 100),
        recommendation: clean(response?.recommendation),
        narrative: clean(response?.narrative),
        riskSummary: clean(response?.riskSummary),
        interviewInsights: Array.isArray(response?.interviewInsights) ? response.interviewInsights.map((item)=>clean(item)).filter(Boolean).slice(0, 4) : [],
        followUps: Array.isArray(response?.followUps) ? response.followUps.map((item)=>clean(item)).filter(Boolean).slice(0, 4) : []
    };
}
function mergeReport(local, ai) {
    if (!ai) return local;
    const authenticityScore = clamp(Math.round(local.authenticityScore * 0.55 + ai.authenticityScore * 0.45), 0, 100);
    return {
        ...local,
        authenticityScore,
        authenticityVerdict: clean(ai.authenticityVerdict || verdictFromScore(authenticityScore, local.gapSkills)),
        recommendation: clean(ai.recommendation || local.recommendation),
        narrative: clean(ai.narrative || local.narrative),
        riskSummary: clean(ai.riskSummary || local.riskSummary),
        interviewInsights: ai.interviewInsights?.length ? ai.interviewInsights : local.interviewInsights,
        followUps: ai.followUps?.length ? ai.followUps : local.followUps
    };
}
async function extractResumeTextFromFile(file) {
    const fileName = typeof file?.name === "string" ? file.name : "uploaded-resume";
    const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase() : "";
    const buffer = Buffer.from(await file.arrayBuffer());
    if (extension === ".pdf") {
        const parser = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$parse$2f$dist$2f$pdf$2d$parse$2f$esm$2f$PDFParse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PDFParse"]({
            data: buffer
        });
        try {
            const result = await parser.getText();
            return normalizeText(result?.text || "");
        } finally{
            await parser.destroy();
        }
    }
    if (extension === ".docx") {
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mammoth$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].extractRawText({
            buffer
        });
        return normalizeText(result?.value || "");
    }
    return normalizeText(buffer.toString("utf8"));
}
async function analyzeUploadedResume(file) {
    const fileName = typeof file?.name === "string" ? file.name : "uploaded-resume";
    const resumeText = await extractResumeTextFromFile(file);
    if (!resumeText || resumeText.length < 60) {
        throw new Error("The uploaded file did not contain enough readable text. Try a text-rich PDF, DOCX, or TXT resume.");
    }
    const fallback = heuristicAnalysis({
        resumeText,
        fileName
    });
    let resumeData = fallback;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasGroqCredentials"])()) {
        try {
            resumeData = await groqResumeAnalysis({
                resumeText,
                fallback
            });
        } catch (error) {
            resumeData = {
                ...fallback,
                confidenceNotes: [
                    `Groq resume analysis fallback activated: ${error.message}`,
                    ...fallback.confidenceNotes
                ].slice(0, 4)
            };
        }
    }
    let questions = localQuestions(resumeData.skills);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasGroqCredentials"])()) {
        try {
            questions = await groqQuestions({
                resumeData,
                resumeText
            });
        } catch (error) {
            questions = localQuestions(resumeData.skills);
            resumeData = {
                ...resumeData,
                confidenceNotes: [
                    `Groq question generation fallback activated: ${error.message}`,
                    ...resumeData.confidenceNotes
                ].slice(0, 4)
            };
        }
    }
    return {
        resumeData,
        questions,
        resumeText
    };
}
async function generateQuestionsForScreening({ skills = [], resumeText = "" }) {
    const normalizedSkills = normalizeSkills(skills.map((skill)=>typeof skill === "string" ? skill : skill?.name || skill?.skill).filter(Boolean), resumeText || skills.join(" "));
    return localQuestions(normalizedSkills);
}
async function evaluateResumeAuthenticity({ answers, questions, resumeData }) {
    const local = localReport({
        answers,
        questions,
        resumeData
    });
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasGroqCredentials"])()) return local;
    try {
        const ai = await groqEvaluation({
            resumeData,
            local
        });
        return mergeReport(local, ai);
    } catch (error) {
        return {
            ...local,
            interviewInsights: [
                `Groq authenticity fallback activated: ${error.message}`,
                ...local.interviewInsights
            ].slice(0, 4)
        };
    }
}
}),
"[project]/app/api/evaluate/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resumeScreening$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/resumeScreening.js [app-route] (ecmascript)");
;
;
const runtime = "nodejs";
async function POST(request) {
    try {
        const body = await request.json();
        const report = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resumeScreening$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateResumeAuthenticity"])({
            answers: body?.answers ?? {},
            questions: body?.questions ?? [],
            resumeData: body?.resumeData ?? null
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            report
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || "Unable to evaluate the interview responses."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0o_e1it._.js.map