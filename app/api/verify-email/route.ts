import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";

const TOKEN_FILE_PATH = "tokens.json";

 const tokens: Record<string, { email: string; expiration: number }> =
  loadTokensFromFile();


const generateVerificationToken = () =>
  Math.random().toString(36).substr(2, 16);

function loadTokensFromFile() {
  try {
    const data = fs.readFileSync(TOKEN_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}


function storeTokenToFile(token: string, email: string) {
  tokens[token] = {
    email,
    expiration: Date.now() + 1000 * 60 * 15, // 15-minute expiration
  };
  fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2));
}

// POST handler
export async function POST(req: Request) {
  const { address, email } = await req.json();

  if (!address || !email) {
    return NextResponse.json(
      { success: false, message: "Address and email are required." },
      { status: 400 }
    );
  }

  // Generate a new token and store it
  const token = generateVerificationToken();
  storeTokenToFile(token, email);

  console.log("Stored tokens:", tokens); 

  // Set up email transport
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });

  // Send the verification email
  const verificationLink = `${process.env.NEXT_PUBLIC_API_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: '"Dema Verification"',
    to: email,
    subject: "Verify your email",
    text: `Click the following link to verify your email address: ${verificationLink}`,
  });

  return NextResponse.json({
    success: true,
    message: "Verification email sent.",
  });
}
