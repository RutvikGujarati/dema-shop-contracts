import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { userDatabase } from "./register-passkey";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
	  const { email, passkey } = req.body;
  
	  if (!email || !passkey) {
		return res.status(400).json({ error: "Email and passkey are required" });
	  }
  
	  const hashedPasskey = userDatabase[email];
	  if (!hashedPasskey) {
		return res.status(404).json({ error: "Email not registered" });
	  }
  
	  // Verify the passkey against the hashed passkey
	  const isMatch = await bcrypt.compare(passkey, hashedPasskey);
	  if (!isMatch) {
		return res.status(401).json({ error: "Invalid passkey" });
	  }
  
	  return res.status(200).json({ message: "Passkey verified" });
	} else {
	  res.setHeader("Allow", ["POST"]);
	  res.status(405).end(`Method ${req.method} Not Allowed`);
	}
  }

  export const recoverPasskey = async (email: string, passkey: string) => {
	try {
	  const response = await fetch("/api/verify-email", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, passkey }),
	  });
  
	  if (response.ok) {
		console.log("Passkey verified successfully, proceed with recovery.");
		// Proceed with new passkey generation
	  } else {
		console.error("Failed to verify passkey, check your email or passkey.");
	  }
	} catch (error) {
	  console.error("Error verifying passkey:", error);
	}
  };
  
  