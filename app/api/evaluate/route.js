import { NextResponse } from "next/server";
import { evaluateResumeAuthenticity } from "../../../lib/resumeScreening";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const report = await evaluateResumeAuthenticity({
      answers: body?.answers ?? {},
      questions: body?.questions ?? [],
      resumeData: body?.resumeData ?? null,
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to evaluate the interview responses.",
      },
      { status: 500 },
    );
  }
}
