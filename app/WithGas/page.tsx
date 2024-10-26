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
import { useEffect, useState } from "react";
import { useChain } from "@account-kit/react";
import {
  baseSepolia,
  sepolia,
  optimismSepolia,
  polygonAmoy,
} from "@account-kit/infra";
import Gas from "@/components/Gas";

export default function Home() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  const { chain, setChain, isSettingChain } = useChain();

  const [estimatedGas, setEstimatedGas] = useState("");
  const [tHash, setHash] = useState("");
  type ChainType = "polygonAmoy" | "sepolia" | "baseSepolia";

  const [selectedChain, setSelectedChain] = useState<ChainType>("baseSepolia");

  const { client, address } = useSmartAccountClient({ type: "LightAccount" });

  const [inputAddress, setInputAddress] = useState("");
  const [value, setValue] = useState("0");
  const [balance, setBalance] = useState("");
  const [isTransactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "sending" | "completed" | "failed"
  >("idle");

  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onSuccess: ({ hash }) => {
      console.log("Transaction hash:", hash);
      setHash(hash);
      setTransactionStatus("completed");
    },
    onError: (error) => {
      console.error("Transaction failed:", error);
      setTransactionStatus("failed");
    },
  });

  function getRpcUrl() {
    switch (selectedChain) {
      case "polygonAmoy":
        return process.env.NEXT_PUBLIC_POLYGON_RPC;
      case "sepolia":
        return process.env.NEXT_PUBLIC_SEPOLIA_RPC;
      case "baseSepolia":
      default:
        return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC;
    }
  }
  const handleClick = () => {
    window.location.href = "/";
  };
  function isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
  useEffect(() => {
    console.log("Selected Chain:", selectedChain);
    console.log("RPC URL:", getRpcUrl());
  }, [selectedChain]);

  useEffect(() => {
    if (!address) return;
    console.log("Fetching balance for address:", address);
    fetchBalance();
  }, [address, selectedChain]);

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

  function handleChainChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value as typeof selectedChain;
    if (selected !== selectedChain) {
      setSelectedChain(selected);
      setChain(
        selected === "baseSepolia"
          ? { chain: baseSepolia }
          : selected === "polygonAmoy"
          ? { chain: polygonAmoy }
          : { chain: sepolia }
      );
    }
  }

  async function sendTokens() {
    if (!isValidAddress(inputAddress)) {
      alert("Invalid Ethereum address");
      return;
    }

    console.log("Estimating gas...");
    const rpcUrl = getRpcUrl();
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    try {
      const gasEstimate = await provider.estimateGas({
        to: inputAddress,
        value: ethers.parseEther(value),
        data: "0x", // Additional data if needed
      });

      setEstimatedGas(ethers.formatUnits(gasEstimate, "gwei"));
      console.log(
        `Estimated Gas: ${ethers.formatUnits(gasEstimate, "gwei")} Gwei`
      );

      // Start the transaction process
      setTransactionInProgress(true);

      // Send tokens
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
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-indigo-800 text-white">
      {signerStatus.isInitializing ? (
        <p className="text-2xl font-semibold animate-pulse">Loading...</p>
      ) : user ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg text-gray-800 w-full max-w-lg">
          <p className="text-lg font-medium">
            Logged in as:{" "}
            <span className="font-semibold">{address ?? "anon"}</span>.
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
            {isTransactionInProgress ? "Processing..." : "Send Tokens"}
          </button>
          <Gas />
          {transactionStatus === "sending" && (
            <p className="text-yellow-500 font-medium mt-2 animate-pulse">
              Transaction is being processed...
            </p>
          )}

          {transactionStatus === "completed" && (
            <p className="text-green-500 font-semibold mt-2">
              🎉 Transaction Successful! Hash: {tHash}
            </p>
          )}

          {transactionStatus === "failed" && (
            <p className="text-red-500 font-semibold mt-2">
              ⚠️ Transaction failed. Please try again.
            </p>
          )}

          {isTransactionInProgress && (
            <p className="mt-2 text-gray-600 font-medium">
              Estimated Gas: {estimatedGas} Gwei
            </p>
          )}

          {tHash && (
            <p className="mt-2 text-gray-100">
              Transaction Hash:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${tHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline hover:text-blue-500 transition-colors"
              >
                {tHash}
              </a>
            </p>
          )}
          <button
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
            onClick={handleClick}
          >
            Go back
          </button>
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
          disabled={isSendingUserOperation}
        >
          Login
        </button>
      )}
    </main>
  );
}
