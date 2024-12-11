"use client";
import {
  useAuthModal,
  useChain,
  useLogout,
  useSignerStatus,
  useSmartAccountClient,
  useUser,
} from "@account-kit/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useSendUserOperation } from "@account-kit/react";
import ABI from "./ABI.json";
import { encodeFunctionData } from "viem";
import useDemaAccountKit from "@/modules/functions/AccountInteraction";

export default function Home() {
  const [transactionHash, setTransactionHash] = useState("");
  const [transactionTime, setTransactionTime] = useState("");
  //   const [estimatedGas, setEstimatedGas] = useState("");

  const { CallContract, estimatedGas ,isTransactionInProgress} = useDemaAccountKit();
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();

  const { chain, setChain } = useChain();

  const policyIdMapping = {
    polygonAmoy: process.env.NEXT_PUBLIC_POLYGON_POLICY_ID,
    sepolia: process.env.NEXT_PUBLIC_SEPOLIA_POLICY_ID,
    baseSepolia: process.env.NEXT_PUBLIC_POLICY_ID,
  };

  type ChainType = "polygonAmoy" | "sepolia" | "baseSepolia";

  const [selectedChain, setSelectedChain] = useState<ChainType>("baseSepolia");

  const handleClick = () => {
    window.location.href = "/";
  };

  const getPolicyId = (chain: ChainType) => {
    switch (chain) {
      case "polygonAmoy":
        return process.env.NEXT_PUBLIC_POLYGON_POLICY_ID;
      case "sepolia":
        return process.env.NEXT_PUBLIC_SEPOLIA_POLICY_ID;
      case "baseSepolia":
        return process.env.NEXT_PUBLIC_BASE_SEPOLIA_POLICY_ID;
      default:
        throw new Error("Unsupported chain type");
    }
  };

  const { client, address } = useSmartAccountClient({
    type: "LightAccount",
    policyId: policyIdMapping[selectedChain as keyof typeof policyIdMapping],
  });

  const contractAddress = "0xf8FDa9e18ffe618Da320e316e75351FEdBE569c9";
  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onSuccess: ({ hash }) => {
      const endTime = new Date().getTime();
      if (startTime) {
        const duration = (endTime - startTime) / 1000;
        setTransactionTime(`${duration.toFixed(2)} seconds`);
      }
      setTransactionHash(hash);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const [amount, setAmount] = useState("");
  const [requestId, setRequestId] = useState("");
  const [orderDesc, setOrderDesc] = useState("");
  const [userId, setUserId] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);

  async function CallContractFun() {
    try {
      console.log(`Sending transaction to ${contractAddress}`);

      // Set the start time for tracking
      setStartTime(new Date().getTime());

      // Define the arguments for the contract function
      const args = [
        ethers.parseEther(amount), // Ether amount in wei
        requestId, // Unique request ID
        orderDesc, // Description of the order
        userId, // User ID
      ];

      // Indicate that the transaction is in progress

      console.log("Inputs:", { amount, requestId, orderDesc, userId });

      // Call the reusable `CallContract` function
      const result = await CallContract(
        contractAddress,
        ABI,
        "place_Order",
        amount,
        args
      );
      console.log("Transaction Result:",await result);

	  console.log(estimatedGas)

      console.log("Transaction initiated successfully!");
    } catch (error) {
      console.error("Error in CallContractFun:", error);
    }
  }

  const [balance, setBalance] = useState("");

  async function fetchBalance() {
    if (!address) return;

    const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC;
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    try {
      const balance = await provider.getBalance(contractAddress);
      const formattedBalance = ethers.formatEther(balance);
      setBalance(
        formattedBalance === "0.0" ? "0 ETH" : `${formattedBalance} ETH`
      );
      console.log(`Balance on ${selectedChain}: ${formattedBalance} ETH`);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",

    "function decimals() view returns (uint8)",
  ];
  const [TokenBalance, SetTokenBalance] = useState("");

  async function fetchTokenBalance() {
    const tokenAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    if (!address) return;

    const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC;
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        provider
      );

      const balance = await tokenContract.balanceOf(address);

      const decimals = await tokenContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);

      SetTokenBalance(
        formattedBalance === "0.0"
          ? "0 tokens"
          : `${formattedBalance} USDC tokens`
      );

      console.log(
        `Token Balance on ${selectedChain}: ${formattedBalance} tokens`
      );
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  }

  useEffect(() => {
    if (address) fetchBalance();
    fetchTokenBalance();
  }, [address, selectedChain]);

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
          <div>
            <p className="mt-2">Contract Balance: {balance || "Fetching..."}</p>
            <p className="mt-2">
              Token Balance: {TokenBalance || "Fetching..."}
            </p>
            <p>Current Chain ID: {chain?.id}</p>
            <p>Current Chain Name: {chain?.name}</p>
          </div>

          <h3 className="text-lg font-semibold">Place Order</h3>

          <input
            type="text"
            placeholder="Amount (e.g., 0.002)"
            className="input-field"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Request ID (e.g., 1)"
            className="input-field"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Order Description"
            className="input-field"
            value={orderDesc}
            onChange={(e) => setOrderDesc(e.target.value)}
          />
          <input
            type="text"
            placeholder="User ID (e.g., 001)"
            className="input-field"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <button
            className="btn btn-primary"
            disabled={isSendingUserOperation}
            onClick={CallContractFun}
          >
        {isTransactionInProgress ? "processing..." : "place order"}
          </button>

          {isTransactionInProgress && (
            <p className="mt-2 text-gray-600 font-medium">
              Estimated Gas: {estimatedGas} Gwei
            </p>
          )}
          {transactionTime && (
            <p className="mt-2 text-green-600 font-medium">
              Transaction completed in {transactionTime}
            </p>
          )}
          {transactionHash && (
            <div className="mt-2 p-2 bg-gray-200 rounded overflow-x-auto w-full">
              <p className="text-blue-600 font-medium">
                Transaction Hash: {transactionHash}
              </p>
            </div>
          )}
          <button
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
            onClick={handleClick}
          >
            Go Back
          </button>

          <button className="btn btn-primary" onClick={() => logout()}>
            Log out
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={openAuthModal}>
          Login
        </button>
      )}
    </main>
  );
}
