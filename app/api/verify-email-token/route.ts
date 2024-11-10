import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_FILE_PATH = path.join(process.cwd(), "tokens.json");
const EMAIL_FILE_PATH = path.join(process.cwd(), "emails.json");

function loadTokensFromFile() {
  try {
    const data = fs.readFileSync(TOKEN_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tokens file:", error);
    return {};
  }
}

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
  

function saveEmailsToFile(emails: string[]) {
	const data = { verifiedEmails: emails };
	fs.writeFileSync(EMAIL_FILE_PATH, JSON.stringify(data, null, 2));
  }
  

function verifyToken(token: any) {
  const tokens = loadTokensFromFile();
  const storedToken = tokens[token];

  if (!storedToken) {
    return { success: false, message: "Invalid token" };
  }

  if (storedToken.expiration < Date.now()) {
    delete tokens[token];
    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2));
    return { success: false, message: "Token has expired" };
  }

  return { success: true, email: storedToken.email };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Token is required." },
      { status: 400 }
    );
  }

  const result = verifyToken(token);

  if (result.success) {
    const verifiedEmails = loadEmailsFromFile();

    if (!verifiedEmails.includes(result.email)) {
      verifiedEmails.push(result.email); 
      saveEmailsToFile(verifiedEmails); 
    }

    return NextResponse.json(
      {
        success: true,
        email: result.email,
        message: "Token verification successful.",
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 400 }
    );
  }
}
