"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { WalletClientSigner } from "@aa-sdk/core";


const Home = () => {
  const [email, setEmail] = useState("");
  const [Loginemail, setLoginEmail] = useState("");
  const [address, setAddress] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [LoginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  (async () => {
	const client = createWalletClient({
	  chain: mainnet,
	  transport: custom(window.ethereum!),
	});
  
	const signer = new WalletClientSigner(client, "wallet");
  
	console.log("signer here", signer);
  
	// Await the address properly
	const address = await signer.getAddress();
	console.log("signer's address", address);
  })();
  

  useEffect(() => {
    const storedAddress = localStorage.getItem("address");
    const storedSignature = localStorage.getItem("signature");
    const verified = localStorage.getItem("verified");

    if (storedAddress && storedSignature && verified === "true") {
      setAddress(storedAddress);
      setSignature(storedSignature);
      setAuthenticated(true);
    }
  }, []);

  const handleClickDashBoard = () => {
    window.location.href = "/Dashboard";
  };

  const signInWithEthereum = async () => {
    if (!window.ethereum) {
      alert("Please install Metamask to sign in.");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    try {
      const message = "Sign this message to authenticate your login.";
      const userAddress = await signer.getAddress();
      const userSignature = await signer.signMessage(message);

      setAddress(userAddress);
      setSignature(userSignature);

      // Persist address and signature in localStorage
      localStorage.setItem("address", userAddress);
      localStorage.setItem("signature", userSignature);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not defined.");
      }
      console.log(apiUrl);
      const res = await fetch(`${apiUrl}/api/verify-siwe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: userAddress,
          signature: userSignature,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
        alert("Successfully signed in with Ethereum!");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError("An error occurred during authentication.");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not defined.");
      }
      console.log(apiUrl);

      const res = await fetch(`${apiUrl}/api/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, email }),
      });

      // Log status and check for errors
      console.log("Response status:", res.status);
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        alert("Verification email sent!");
      } else {
        setError("Error sending verification email.");
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setError("Network error: Could not reach server.");
      } else {
        console.error("Error during email submission:", error);
        setError("An error occurred while sending email.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not defined.");
      }
      console.log("url for api",apiUrl);
      const res = await fetch(`${apiUrl}/api/login-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Loginemail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Login successful!");
        window.location.href = "/Dashboard";
      } else if (data.message) {
        setError(data.message);
      } else {
        setError("Email not verified. Please verify your email first.");
      }
    } catch (error) {
      console.error("Error during email login:", error);
      setError("An error occurred during email login.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-indigo-800 text-white">
      {!authenticated ? (
        <div className="flex flex-col items-center gap-8 w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-gray-800">
          <h2 className="text-2xl font-bold">Login with MetaMask</h2>
          <button
            className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded transition"
            onClick={signInWithEthereum}
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg text-gray-800 w-full max-w-m  max-w-lg">
          <h2 className="text-xl font-bold">Welcome, {address}</h2>

          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded transition"
            onClick={handleClickDashBoard}
          >
            Login
          </button>
          <p>OR</p>
          <p className="text-lg font-medium">
            Add Backup email for verification
          </p>

          <form
            onSubmit={handleEmailSubmit}
            className="w-full flex flex-col items-stretch"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="p-2 mb-4 border border-gray-300 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded transition"
            >
              {loading ? "Sending..." : "Link Email"}
            </button>
          </form>
          <p>OR</p>
          <form
            onSubmit={handleEmailLogin}
            className="w-full flex flex-col items-stretch"
          >
            <input
              type="email"
              value={Loginemail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="p-2 mb-4 border border-gray-300 rounded"
            />
            <button
              type="submit"
              disabled={LoginLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded transition"
            >
              {LoginLoading ? "Sign in...." : "Sign in using Backup Email"}
            </button>
          </form>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      )}
    </main>
  );
};

export default Home;
