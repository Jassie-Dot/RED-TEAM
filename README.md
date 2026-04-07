# VIGIL-AI

Cyber-styled fake resume detector for employer screening.

## What it does

1. Plays a boot sequence and opens role-based entry for `Employer` and `Student`
2. Uploads a resume from the employer dashboard
3. Extracts readable text from `PDF`, `DOCX`, and text-based files
4. Uses `Groq` to analyze the resume and generate technical screening questions when `GROQ_API_KEY` is present
5. Falls back to a local heuristic pipeline when the API key is missing or the API call fails
6. Evaluates answers and returns an authenticity verdict with a digital resume twin and scorecards

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create a local `.env.local` file with:

```bash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

`GROQ_MODEL` is optional. If omitted, the app uses the default above.

## Notes

- Resume extraction is strongest with text-rich PDF or DOCX files.
- If Groq is unavailable, the app still works in fallback mode.
- The employer flow redirects straight from upload into the generated questions phase.
