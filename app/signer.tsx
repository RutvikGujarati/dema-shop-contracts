// signer.js
import { getSigner } from "@account-kit/core";
import { useState, useEffect } from "react";
import { AlchemyWebSigner } from "@account-kit/signer";

const CreateSigner = (config: any) => {
  const [signer, setSigner] = useState<AlchemyWebSigner | null>(null);

  

  const initializeSigner = async () => {
    if (typeof window === "undefined") return;

    // Small delay to ensure client is ready
    await new Promise((resolve) => setTimeout(resolve, 50));
    const signerInstance = getSigner(config);

    if (signerInstance) {
      setSigner(signerInstance);
      console.log("Signer initialized successfully", signer);
    } else {
      console.error("Failed to initialize signer");
    }
  };

  useEffect(() => {
    initializeSigner();
  }, []);

  const loginWithGoogle = async () => {
    if (!signer) {
      console.log("Signer is not initialized");
      return;
    }

    try {
      await signer.authenticate({
        type: "oauth",
        authProviderId: "google",
        mode: "redirect",
        redirectUrl: "/Eth-Email",
      });
      console.log("Login with Google successful");
    } catch (error: any) {
      console.error("Failed to log in with Google:", error.message);
    }
  };

  return { signer, loginWithGoogle };
};

export default CreateSigner;
