import { NextResponse } from "next/server";
import { analyzeUploadedResume } from "../../../lib/resumeScreening";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ success: false, error: "Upload a resume file before starting the scan." }, { status: 400 });
    }

    const { resumeData, questions } = await analyzeUploadedResume(file);

    return NextResponse.json({
      success: true,
      resumeData,
      questions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to analyze the uploaded resume.",
      },
      { status: 500 },
    );
  }
}
