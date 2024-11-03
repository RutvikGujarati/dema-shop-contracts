"use client";
import {
  useAuthModal,
  useLogout,
  useSendUserOperation,
  useSignerStatus,
  useSmartAccountClient,
  useUser,
} from "@account-kit/react";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useChain } from "@account-kit/react";
import { config } from "@/config";
import { getSigner } from "@account-kit/core";
import { AlchemyWebSigner } from "@account-kit/signer";
import {
  type UseAuthenticateResult,
  useAuthenticate,
} from "@account-kit/react";

const Home = () => {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const [processing, setProcessing] = useState(false);
  const { logout } = useLogout();
  const { chain, setChain, isSettingChain } = useChain();
  const [signer, setSigner] = useState<AlchemyWebSigner | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const { authenticate, isPending } = useAuthenticate();
  const [email, setEmail] = React.useState("");

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

  const completeAuthentication = async () => {
    if (!signer) {
      console.log("Signer not ready, delaying authentication...");
      return;
    }

    try {
      await signer.authenticate({
        type: "passkey",
        email: "gujaratirutvik007@gail.com",
      });
      setAuthenticated(true);
      console.log("Authentication successful");
    } catch (error) {
      console.error("Error completing email authentication:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-indigo-800 text-white">
      {signerStatus.isInitializing ? (
        <p className="text-2xl font-semibold animate-pulse">Loading...</p>
      ) : authenticated ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg text-gray-800 w-full max-w-md">
          <h2 className="text-xl font-bold">Welcome!</h2>
          <p className="text-lg font-medium">
            Logged in as:{" "}
            <span className="font-semibold">{user?.address ?? "anon"}</span>.
          </p>
          <button
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
            onClick={() => logout()}
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-gray-800">
          <h2 className="text-2xl font-bold">Login</h2>
          <button
            className="btn btn-primary bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded transition w-full"
            onClick={completeAuthentication}
            disabled={isSettingChain}
          >
            {processing ? "Processing..." : "Login With Passkey"}
          </button>
          <div className="flex flex-col items-stretch w-full">
            <input
              type="email"
              value={email}
              className="mt-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded transition"
              onClick={() => authenticate({ type: "passkey", email })}
            >
              Add Email Backup
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
