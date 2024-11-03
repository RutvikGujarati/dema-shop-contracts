"use client";
import {
	useAddPasskey,
  useAuthModal,
  useLogout,
  useSendUserOperation,
  useSignerStatus,
  useSmartAccountClient,
  useUser,
} from "@account-kit/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useChain } from "@account-kit/react";
import { config } from "@/config";
import { getSigner } from "@account-kit/core";
import { AlchemyWebSigner } from "@account-kit/signer";

export default function Home() {
	const { addPasskey, isAddingPasskey } = useAddPasskey();

  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const [processing, setProcessing] = useState(false);
  const { logout } = useLogout();
  const { chain, setChain, isSettingChain } = useChain();
  const [signer, setSigner] = useState<AlchemyWebSigner | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [storedBundle, setStoredBundle] = useState<string | null>(null);
  useEffect(() => {
    const initializeSigner = async () => {
      if (typeof window === "undefined") return;

      // Wait a short time for the client to be fully ready
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
  }, []);

  useEffect(() => {
    if (signer) {
      console.log("Signer initialized:", signer);
    }
  }, [signer]);

  useEffect(() => {
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
          setAuthenticated(true);
          console.log("Authentication successful");

          const url = new URL(window.location.href);
          url.searchParams.delete("bundle");
          window.history.replaceState({}, document.title, url.toString());

          // Clear the stored bundle after authentication
          setStoredBundle(null);
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
  }, [signer, storedBundle]);

  const handleLoginWithEmail = async () => {
    if (!signer) {
      console.error("Signer not available");
      return;
    }
    setProcessing(true);
    try {
      await signer.authenticate({
        type: "email",
        email: "gujaratirutvik007@gmail.com",
      });
      console.log("Email link sent for authentication");
      setProcessing(false);
    } catch (error: unknown) {
      setProcessing(false);
      if (error instanceof Error) {
        console.error("Error authenticating with email:", error.message);
        console.error("Stack trace:", error.stack);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-indigo-800 text-white">
      {signerStatus.isInitializing ? (
        <p className="text-2xl font-semibold animate-pulse">Loading...</p>
      ) : authenticated ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg text-gray-800 w-full max-w-lg">
          <p className="text-lg font-medium">
            Logged in as:{" "}
            <span className="font-semibold">{user?.address ?? "anon"}</span>.
          </p>
          <button
            className="btn btn-primary mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
            onClick={() => logout()}
          >
            Log out
          </button>
		  <button
            disabled={isAddingPasskey}
            onClick={() => {
              addPasskey();
            }}
          >
            Add Passkey
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded transition"
          onClick={handleLoginWithEmail}
          disabled={isSettingChain}
        >
          {processing ? "Processing..." : "Login With Email"}
        </button>
      )}
    </main>
  );
}
