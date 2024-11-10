// login-email.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const EMAIL_FILE_PATH = path.join(process.cwd(), "emails.json");

function loadEmailsFromFile(): string[] {
  try {
    const data = fs.readFileSync(EMAIL_FILE_PATH, "utf-8");
    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData.verifiedEmails) ? parsedData.verifiedEmails : [];
  } catch (error) {
    console.error("Error reading emails file:", error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  const { Loginemail } = await req.json();

  if (!Loginemail) {
    return NextResponse.json(
      { success: false, message: "Email is required." },
      { status: 400 }
    );
  }

  const verifiedEmails = loadEmailsFromFile();

  if (verifiedEmails.includes(Loginemail)) {
    return NextResponse.json(
      { success: true, message: "Email login successful." },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { success: false, message: "Email not verified. Please verify your email first." },
      { status: 400 }
    );
  }
}
