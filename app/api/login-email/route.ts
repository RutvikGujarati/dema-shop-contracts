// pages/api/save-verified-email.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// Path to the file where we store verified emails
const EMAIL_FILE_PATH = path.join(process.cwd(), "emails.json");

// Load existing verified emails from the file
function loadEmailsFromFile(): Record<string, string> {
  try {
    const data = fs.readFileSync(EMAIL_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading emails file:", error);
    return {};
  }
}

// Save verified emails to the file
function saveEmailsToFile(emails: Record<string, string>) {
  fs.writeFileSync(EMAIL_FILE_PATH, JSON.stringify(emails, null, 2));
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email is required." },
      { status: 400 }
    );
  }

  // Load the existing emails
  const allEmails = loadEmailsFromFile();

  // Check if the email is already stored to avoid duplicates
  if (allEmails[email]) {
    return NextResponse.json(
      { success: false, message: "This email is already verified." },
      { status: 400 }
    );
  }

  // Store the email as verified
  allEmails[email] = email;

  // Save the updated emails back to the file
  saveEmailsToFile(allEmails);

  return NextResponse.json(
    { success: true, message: "Email verified and saved." },
    { status: 200 }
  );
}
