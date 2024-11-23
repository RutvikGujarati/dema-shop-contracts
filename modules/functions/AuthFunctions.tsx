// Function.ts
import { getSigner } from "@account-kit/core";
import { useState, useEffect } from "react";
import { AlchemyWebSigner } from "@account-kit/signer";

const Functions = (config: any, user: any) => {
  const [signer, setSigner] = useState<AlchemyWebSigner | null>(null);
  const [storedBundle, setStoredBundle] = useState<string | null>(null);

  // Initialize signer
  useEffect(() => {
    const initializeSigner = async () => {
      if (typeof window === "undefined") return;

      await new Promise((resolve) => setTimeout(resolve, 50));
      const signerInstance = getSigner(config);

      if (signerInstance) {
        setSigner(signerInstance);
        console.log("Signer initialized successfully");
      } else {
        console.error("Failed to initialize signer");
      }
    };

    initializeSigner();
  }, [config]);

  // Unified method for verifying email
  const VerifyEmail = async () => {
    const completeAuthentication = async (bundle: string) => {
      if (!signer) {
        console.log("Signer not ready, delaying authentication...");
        return;
      }

      console.log("Current URL:", window.location.href);
      const params = new URLSearchParams(window.location.search);
      console.log("Search parameters:", params);

      console.log("Bundle from URL (using URLSearchParams):", bundle);

      if (bundle) {
        try {
          await signer.authenticate({ type: "email", bundle });
          console.log("Authentication successful");

          const url = new URL(window.location.href);
          url.searchParams.delete("bundle");
          window.history.replaceState({}, document.title, url.toString());

          // Clear the stored bundle after authentication
          setStoredBundle(null);
          alert("smart account created!");
        } catch (error) {
          console.error("Error completing email authentication:", error);
        }
      } else {
        console.error("No bundle found in URL");
      }
    };

    const waitForSigner = async () => {
      console.log("Waiting for signer to be initialized...");

      const params = new URLSearchParams(window.location.search);
      const bundle = params.get("bundle");
      if (bundle) {
        console.log("Bundle stored:", bundle);
        setStoredBundle(bundle); // Store the bundle temporarily
      }

      while (!signer) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms before checking again
      }
      console.log("Signer is ready!");

      if (storedBundle) {
        completeAuthentication(storedBundle);
      }
    };
    waitForSigner();

    return () => {
      // Cleanup code can go here if needed in the future
    };
  };

  const passkeyAuthentication = async (
    type: "CreatePasskey" | "LoginWithPasskey" | "AttachEmail",
    userNameOrEmail?: string
  ) => {
    if (!signer) {
      console.error("Signer is not initialized");
      return;
    }

    const authOptions: any = { type: "passkey" };

    if (type === "CreatePasskey") {
      authOptions.createNew = true;
      authOptions.username = userNameOrEmail;
    } else if (type === "LoginWithPasskey") {
      authOptions.createNew = false;
    } else if (type === "AttachEmail") {
      authOptions.email = userNameOrEmail;
    }

    try {
      await signer.authenticate(authOptions);
      console.log(`${type} successful`);
    } catch (error: any) {
      console.error(`Failed to complete ${type}:`, error.message);
    }
  };

  // Usage
  const CreatePasskey = async (userName: string) =>
    passkeyAuthentication("CreatePasskey", userName);

  const LoginWithPasskey = async () =>
    passkeyAuthentication("LoginWithPasskey");

  const AttachEmail = async (email: string) =>
    passkeyAuthentication("AttachEmail", email);

  // Common OAuth authentication method
  const authenticateOAuth = async (
    provider: "google" | "facebook" | "apple",
    redirectUrl?: string
  ) => {
    if (!signer) {
      console.error("Signer not initialized");
      return;
    }

    const authOptions: any = {
      type: "oauth",
      authProviderId: provider,
      mode: "popup",
    };

    if (provider === "apple") {
      authOptions.auth0Connection = "apple";
    }

    if (redirectUrl) {
      authOptions.mode = "redirect";
      authOptions.redirectUrl = redirectUrl;
    }

    try {
      await signer.authenticate(authOptions);
      console.log(`Login with ${provider} successful`);
    } catch (error) {
      console.error(`Failed to log in with ${provider}:`, error);
    }
  };

  useEffect(() => {
    VerifyEmail();
  });

  return {
    signer,
    VerifyEmail,
    loginWithGoogle: () => authenticateOAuth("google", "/SignUp"),
    loginWithFacebook: () => authenticateOAuth("facebook", "/SignUp"),
    loginWithApple: () => authenticateOAuth("apple"),
    CreatePasskey,
    LoginWithPasskey,
    AttachEmail,
  };
};

export default Functions;
