import { NextResponse } from "next/server";
import { generateQuestionsForSkills } from "../../../lib/mockAssessment";

export async function POST(request) {
  const body = await request.json();
  const questions = generateQuestionsForSkills(body?.skills ?? []);

  return NextResponse.json({
    success: true,
    questions,
  });
}
