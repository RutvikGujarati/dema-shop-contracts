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
import { baseSepolia, polygon, sepolia } from "@account-kit/infra";

export default function Home() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  const { chain, setChain, isSettingChain } = useChain();
  const [estimatedGas, setEstimatedGas] = useState("");

  type ChainType = "polygon" | "sepolia" | "baseSepolia";

  const [selectedChain, setSelectedChain] = useState<ChainType>("baseSepolia");

  const policyIdMapping = {
    polygon: process.env.NEXT_PUBLIC_POLYGON_POLICY_ID,
    sepolia: process.env.NEXT_PUBLIC_SEPOLIA_POLICY_ID,
    baseSepolia: process.env.NEXT_PUBLIC_BASE_SEPOLIA_POLICY_ID,
  };

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
    onSuccess: ({ hash }) => console.log("Transaction Hash:", hash),
    onError: (error) => console.error("Error:", error),
  });

  function getRpcUrl() {
    switch (selectedChain) {
      case "polygon":
        return process.env.NEXT_PUBLIC_POLYGON_RPC;
      case "sepolia":
        return process.env.NEXT_PUBLIC_SEPOLIA_RPC;
      case "baseSepolia":
        return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC;

      default:
        return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC;
    }
  }

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
	if (!address) return; // Prevent unnecessary fetches if the address is undefined
	fetchBalance();
  }, [address, selectedChain]); // Dependencies are correctly listed

  function handleChainChange(e: React.ChangeEvent<HTMLSelectElement>) {
	const selected = e.target.value as ChainType;
  
	if (selected !== selectedChain) { // Prevent duplicate state updates
	  setSelectedChain(selected);
  
	  if (selected === "baseSepolia") {
		setChain({ chain: baseSepolia });
	  } else if (selected === "polygon") {
		setChain({ chain: polygon });
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

    console.log("Estimating gas...");
    const rpcUrl = getRpcUrl();
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    try {
      const gasEstimate = await provider.estimateGas({
        to: inputAddress,
        value: ethers.parseEther(value),
        data: "0x", // Additional data if needed
      });

      setEstimatedGas(ethers.formatUnits(gasEstimate, "gwei")); // Store estimated gas in gwei
      console.log(
        `Estimated Gas: ${ethers.formatUnits(gasEstimate, "gwei")} Gwei`
      );

      // Proceed to send tokens
      sendUserOperation({
        uo: {
          target: inputAddress as `0x${string}`,
          data: "0x",
          value: ethers.parseEther(value.toString()),
        },
      });
    } catch (error) {
      console.error("Error estimating gas:", error);
      setEstimatedGas(""); // Reset if there's an error
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
              <option value="polygon">Polygon</option>
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
          <p className="mt-2">
            Estimated Gas: {estimatedGas ? `${estimatedGas} Gwei` : "N/A"}
          </p>

          <button
            className="btn btn-primary mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
            onClick={() => logout}
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
