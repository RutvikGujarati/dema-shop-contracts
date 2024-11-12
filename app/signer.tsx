// signer.ts
import { getSigner } from "@account-kit/core";
import { useState, useEffect } from "react";
import { AlchemyWebSigner } from "@account-kit/signer";

const CreateSigner = (config: any, user: any) => {
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
        redirectUrl: "/SignUp",
      });
      console.log("Login with Google successful");
    } catch (error: any) {
      console.error("Failed to log in with Google:", error.message);
    }
  };
  const loginWithFacebook = async () => {
    if (!signer) {
      console.log("Signer is not initialized");
      return;
    }

    try {
      await signer.authenticate({
        type: "oauth",
        authProviderId: "facebook",
        mode: "redirect",
        redirectUrl: "/SignUp",
      });
      console.log("signUp/Login with facebook successful");
    } catch (error: any) {
      console.error("Failed to log in with facebook:", error.message);
    }
  };
  const loginWithApple = async () => {
    if (!signer) {
      console.log("Signer is not initialized");
      return;
    }

    try {
      await signer.authenticate({
        type: "oauth",
        authProviderId: "auth0",
        auth0Connection: "apple",
        mode: "popup",
      });
      console.log("SignUp/Login with apple successful");
    } catch (error: any) {
      console.error("Failed to log in with apple:", error.message);
    }
  };
  const loginWithPassKey = async () => {
    if (!signer) {
      console.log("Signer is not initialized");
      return;
    }

    try {
      await signer.authenticate({
        type: "passkey",
        // email: user.email,
        createNew: true,
        username: user.email,
      });
      console.log("Login with Google successful");
    } catch (error: any) {
      console.error("Failed to log in with Google:", error.message);
    }
  };

  return {
    signer,
    loginWithGoogle,
    loginWithPassKey,
    loginWithFacebook,
    loginWithApple,
  };
};

export default CreateSigner;
