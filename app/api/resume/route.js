import { NextResponse } from "next/server";
import { getMockResume } from "../../../lib/mockAssessment";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("resume");
  const fileName = typeof file?.name === "string" ? file.name : "mock_resume.pdf";

  return NextResponse.json({
    success: true,
    resumeData: getMockResume(fileName),
  });
}
