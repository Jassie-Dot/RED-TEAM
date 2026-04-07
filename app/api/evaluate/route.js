import { NextResponse } from "next/server";
import { evaluateAssessment } from "../../../lib/mockAssessment";

export async function POST(request) {
  const body = await request.json();

  const report = evaluateAssessment({
    answers: body?.answers ?? {},
    questionIds: body?.questionIds ?? [],
    skills: body?.skills ?? [],
    claimedLevels: body?.claimedLevels ?? {},
  });

  return NextResponse.json({
    success: true,
    report,
  });
}
