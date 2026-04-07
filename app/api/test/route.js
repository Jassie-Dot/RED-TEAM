import { NextResponse } from "next/server";
import { generateQuestionsForScreening } from "../../../lib/resumeScreening";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const questions = await generateQuestionsForScreening({
      skills: body?.skills ?? [],
      resumeText: body?.resumeText ?? "",
    });

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to generate screening questions.",
      },
      { status: 500 },
    );
  }
}
