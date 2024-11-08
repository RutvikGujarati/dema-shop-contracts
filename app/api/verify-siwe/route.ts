import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const SIGN_IN_MESSAGE = "Sign this message to authenticate your login.";

export async function POST(request: NextRequest) {
  const { address, signature } = await request.json();
  console.log("Received data:", { address, signature });

  if (!address || !signature) {
    return NextResponse.json(
      { success: false, message: "Address and signature are required." },
      { status: 400 }
    );
  }

  try {
    const recoveredAddress = ethers.verifyMessage(SIGN_IN_MESSAGE, signature);

    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      return NextResponse.json({
        success: true,
        message: "Authentication successful.",
        from: "verify-siwe API",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Signature verification failed." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying signature:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
