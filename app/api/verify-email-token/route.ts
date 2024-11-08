import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_FILE_PATH = path.join(process.cwd(), "tokens.json");

function loadTokensFromFile() {
  try {
    const data = fs.readFileSync(TOKEN_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tokens file:", error);
    return {};
  }
}

function saveTokensToFile(
  tokens: Record<string, { email: string; expiration: number }>
) {
  fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2));
}

function verifyToken(token: string) {
  const tokens = loadTokensFromFile();
  const storedToken = tokens[token];

  console.log("Available tokens:", tokens);
  if (!storedToken) {
    return { success: false, message: "Invalid token" };
  }

  if (storedToken.expiration < Date.now()) {
    delete tokens[token];
    saveTokensToFile(tokens);
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
    return NextResponse.json(
      { success: true, message: "Token verification successful." },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 400 }
    );
  }
}
