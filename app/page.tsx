"use client";
import {
  useAddPasskey,
  useAuthenticate,
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
import { AlchemyWebSigner } from "@account-kit/signer";
import {
  createBundlerClient,
  createSmartAccountClientFromExisting,
} from "@aa-sdk/core";

import { baseSepolia, sepolia, polygonAmoy, alchemy } from "@account-kit/infra";
import ABI from "./ContractCall/ABI.json";
import { createLightAccountAlchemyClient, getSigner } from "@account-kit/core";
import { config } from "@/config";
import CreateSigner from "./signer";

export default function Home() {
  //   const { addPasskey, isAddingPasskey } = useAddPasskey();

  const { authenticate, isPending } = useAuthenticate();

  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  const { chain, setChain, isSettingChain } = useChain();
  const [estimatedGas, setEstimatedGas] = useState("");
  const [isTransactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionTime, setTransactionTime] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null); // State to track start time

  type ChainType = "polygonAmoy" | "sepolia" | "baseSepolia";

  const [selectedChain, setSelectedChain] = useState<ChainType>("baseSepolia");

  const policyIdMapping = {
    polygonAmoy: process.env.NEXT_PUBLIC_POLYGON_POLICY_ID,
    sepolia: process.env.NEXT_PUBLIC_SEPOLIA_POLICY_ID,
    baseSepolia: process.env.NEXT_PUBLIC_POLICY_ID,
  };

  const { addPasskey, isAddingPasskey, error } = useAddPasskey({
    onSuccess: () => {
    },
    onError: (error) => console.error(error),
  });
  const { client, address } = useSmartAccountClient({
    type: "LightAccount",
    policyId: policyIdMapping[selectedChain as keyof typeof policyIdMapping], // Type assertion
  });

  const [inputAddress, setInputAddress] = useState("");
  const [value, setValue] = useState("0");
  const [balance, setBalance] = useState("");

  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onSuccess: ({ hash }) => {
      console.log("Transaction Hash:", hash);
      setTransactionHash(hash);
      const endTime = new Date().getTime();
      if (startTime) {
        const duration = (endTime - startTime) / 1000;
        setTransactionTime(`${duration.toFixed(2)} seconds`);
      }
      setTransactionInProgress(false);
    },
    onError: (error) => {
      console.error("Error:", error);
      setTransactionInProgress(false);
    },
  });

  function getRpcUrl() {
    switch (selectedChain) {
      case "polygonAmoy":
        return process.env.NEXT_PUBLIC_POLYGON_RPC;
      case "sepolia":
        return process.env.NEXT_PUBLIC_SEPOLIA_RPC;
      case "baseSepolia":
        return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC;
      default:
        return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC;
    }
  }

  const { signer, loginWithGoogle, loginWithPassKey } = CreateSigner(
    config,
    user
  );

  useEffect(() => {
    if (signer) {
      console.log("Signer initialized:", signer);
    }
  }, [signer]);

  function isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  async function fetchBalance() {
    if (!address) return;

    const rpcUrl = getRpcUrl();
    if (!rpcUrl) {
      console.error("RPC URL not found");
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    try {
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      setBalance(
        formattedBalance === "0.0" ? "0 ETH" : `${formattedBalance} ETH`
      );
      console.log(`Balance on ${selectedChain}: ${formattedBalance} ETH`);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  useEffect(() => {
    if (!address) return;
    fetchBalance();
  }, [address, selectedChain]);

  const [showAlert, setShowAlert] = useState(false);

  const LoginWithPasskey = async () => {
    if (!signer) {
      console.log("Signer is not initialized");
      return;
    }

    if (!user || !user.email) {
      console.error("User or user email is not initialized in time");
      return;
    }

    try {
      await signer.authenticate({
        type: "passkey",
        email: user.email,
        // createNew: true,
        // username: user.email,
      });

      console.log("Login with passkey successful",user.userId);

      setShowAlert(true);

      // Automatically hide the alert after 3 seconds (optional)
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error: any) {
      console.error("Failed to log in with Google:", error.message);
    }
  };

  function handleChainChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value as ChainType;

    if (selected !== selectedChain) {
      setSelectedChain(selected);

      if (selected === "baseSepolia") {
        setChain({ chain: baseSepolia });
      } else if (selected === "polygonAmoy") {
        setChain({ chain: polygonAmoy });
      } else if (selected === "sepolia") {
        setChain({ chain: sepolia });
      }
    }
  }

  async function sendTokens() {
    if (!isValidAddress(inputAddress)) {
      alert("Invalid Ethereum address");
      return;
    }
    setStartTime(new Date().getTime()); // Set the start time

    console.log("Estimating gas...");
    const rpcUrl = getRpcUrl();
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    try {
      const gasEstimate = await provider.estimateGas({
        to: inputAddress,
        value: ethers.parseEther(value),
        data: "0x",
      });

      setEstimatedGas(ethers.formatUnits(gasEstimate, "gwei"));
      console.log(
        `Estimated Gas: ${ethers.formatUnits(gasEstimate, "gwei")} Gwei`
      );
      setTransactionInProgress(true);

      sendUserOperation({
        uo: {
          target: inputAddress as `0x${string}`,
          data: "0x",
          value: ethers.parseEther(value),
        },
      });
    } catch (error) {
      console.error("Error estimating gas:", error);
      setEstimatedGas("");
      setTransactionInProgress(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-black-500 text-white">
      {signerStatus.isInitializing ? (
        <p className="text-2xl font-semibold animate-pulse">Loading...</p>
      ) : user ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg text-gray-800 w-full max-w-lg">
          <p className="text-lg font-medium">
            Logged in as:{" "}
            <div>
              <span className="flex font-semibold">{address ?? "Gujarati"}</span>
              <span className="mt-4 font-semibold">{user.email ?? "Gujarati"}</span>
            </div>
          </p>
          <p className="mt-2">Balance: {balance || "Fetching..."}</p>
          <div>
            <p>Current Chain ID: {chain?.id}</p>
            <p>Current Chain Name: {chain?.name}</p>

            <select
              value={selectedChain}
              onChange={handleChainChange}
              className="w-full p-2 rounded border border-gray-300"
              disabled={isSettingChain}
            >
              <option value="polygonAmoy">polygonAmoy</option>
              <option value="sepolia">Sepolia</option>
              <option value="baseSepolia">baseSepolia</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Enter address"
            className="input-field"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter value"
            className="input-field"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
            onClick={sendTokens}
          >
            {isSendingUserOperation ? "Sending..." : "Send Tokens"}
          </button>
          <h1>if you not have passkey then generate to store SCA</h1>
          <button
            className="btn btn-primary bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded transition w-full"
            onClick={() => {
              addPasskey();
            }}
          >
            Add Passkey
          </button>
          {/* <button
            className="btn btn-primary bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded transition w-full"
            onClick={LoginWithPasskey}
          >
            Passkey
          </button> */}
          {isTransactionInProgress && (
            <p className="mt-2 text-gray-600 font-medium">
              Estimated Gas: {estimatedGas} Gwei
            </p>
          )}
          {showAlert && (
            <div className="alert alert-success">
              Email has been successfully added as a backup!
            </div>
          )}
          {transactionTime && (
            <p className="mt-2 text-green-600 font-medium">
              Transaction completed in {transactionTime}
            </p>
          )}
          {transactionHash && (
            <div
              className="mt-2 p-2 bg-gray-200 rounded overflow-x-auto w-full"
              style={{ wordBreak: "break-word" }}
            >
              <p className="text-blue-600 font-medium">
                Transaction Hash: {transactionHash}
              </p>
            </div>
          )}
          {/* <button 	
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
            onClick={handleClick}
          >
            Contract Interaction
          </button> */}
          {/* <button
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
            onClick={handleClickGas}
          >
            sign in with EOA
          </button>
           */}
          {/* <h1>OR Add Sign in methods for your SCA</h1> */}

          {/* <button
            onClick={loginWithGoogle}
            className="btn btn-primary bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded transition disabled:bg-gray-400"
          >
            Google Login (Popup)
          </button> */}
          <button
            className="btn btn-primary mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
            onClick={() => logout()}
          >
            Log out
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded transition disabled:bg-gray-400"
          onClick={openAuthModal}
          disabled={isSettingChain}
        >
          Sign Up
        </button>
      )}
    </main>
  );
}
