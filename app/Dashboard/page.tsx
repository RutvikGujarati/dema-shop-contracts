"use client";
import { useEffect, useState } from "react";
import authModule from "@/modules/auth"; // Importing the module
import { config } from "@/config";
import { getSigner } from "@account-kit/core";
import { AlchemyWebSigner } from "@account-kit/signer";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signer, setSigner] = useState<AlchemyWebSigner | null>(null);

  useEffect(() => {
    const initializeSigner = async () => {
      const signerInstance = new authModule.AuthManager(config);
      const signer = await signerInstance.CreateSigner(config);
      if (signer) {
        setSigner(signer);
        console.log("Signer initialized successfully", signer);
      } else {
        console.error("Failed to initialize signer");
      }
    };
    const createAccount = new authModule.CreateAccount();

    const userAddress =  createAccount.Account();
    console.log("Fetched user address:", userAddress);

    initializeSigner();
  }, []);

  const handleLogin = async () => {
    try {
      if (!signer) {
        setAuthError("Failed to initialize signer");
        return;
      }

      const loginWithGoogle = new authModule.OAuthLogin(signer); // Using LoginWithGoogle from authModule
      await loginWithGoogle.authenticate("google", "/SignUp");
      setIsAuthenticated(true);
    } catch (error: any) {
      setAuthError(`Error during login: ${error.message}`);
    }
  };

  const userAddress = async () => {
    try {
      const user = new authModule.CreateAccount();
      const userAddress = user.Account();

      console.log(userAddress);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <h1>Welcome to the Next.js App</h1>
      {isAuthenticated ? (
        <p>You are logged in with Google!</p>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
      {authError && <p style={{ color: "red" }}>{authError}</p>}
    </div>
  );
};

export default Home;
