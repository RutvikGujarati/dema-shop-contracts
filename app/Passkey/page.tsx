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
import React, { useEffect, useState } from "react";
import { useChain } from "@account-kit/react";
import { config } from "@/config";
import { getSigner, watchSignerStatus } from "@account-kit/core";
import { AlchemyWebSigner } from "@account-kit/signer";


const Home = () => {
  const user = useUser();
  const signerStatus = useSignerStatus();
  const [processing, setProcessing] = useState(false);
  const { logout } = useLogout();
  const { chain, setChain, isSettingChain } = useChain();
  const [signer, setSigner] = useState<AlchemyWebSigner | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = React.useState("");

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
		email:email,
        // createNew: true,
		username: email,
      });
      setAuthenticated(true);
      console.log("Authentication successful");
    } catch (error) {
      console.error("Error completing email authentication:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
      {signerStatus.isInitializing ? (
        <p className="text-2xl font-semibold animate-pulse">Loading...</p>
      ) : authenticated ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg text-gray-800 w-full max-w-lg advanced-card">
          <h2 className="text-2xl font-bold">Welcome!</h2>
          <p className="text-lg font-medium text-center">
            Logged in as:{" "}
            <span className="flex font-semibold break-all">
              {user?.address ?? "Gujarati"}
            </span>
          </p>
          <div className="flex flex-col items-stretch w-full">
          </div>
          <button
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
            onClick={() => logout()}
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 w-full max-w-lg p-8 bg-white rounded-lg shadow-lg text-gray-800 advanced-card">
          <h2 className="text-2xl font-bold">Login</h2>
          <input
            type="email"
			placeholder="enter Email"
            className="input-field w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="btn btn-primary bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded transition w-full"
            onClick={completeAuthentication}
            disabled={isSettingChain}
          >
            {processing ? "Processing..." : "Login With Passkey"}
          </button>
          
        </div>
      )}
    </main>
  );
};

export default Home;
