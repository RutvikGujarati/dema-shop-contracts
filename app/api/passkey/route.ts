import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";

// Mock database (for testing only, replace with a real database in production)
const userDatabase: { [email: string]: string } = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { email, passkey } = req.body;

    console.log(email);
    if (!email || !passkey) {
      return res.status(400).json({ error: "Email and passkey are required" });
    }

    const hashedPasskey = await bcrypt.hash(passkey, 10);
    userDatabase[email] = hashedPasskey;

    return res.status(200).json({ message: "Passkey registered successfully" });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
export { handler as GET, handler as POST };
