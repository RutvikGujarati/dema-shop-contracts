"use client";

import {
  useAddPasskey,
  useAuthenticate,
  useAuthModal,
  useLogout,
  useSendUserOperation,
  useSmartAccountClient,
  useUser,
  useChain,
} from "@account-kit/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { baseSepolia, sepolia, polygonAmoy } from "@account-kit/infra";


// Type Definitions
type ChainType = "polygonAmoy" | "sepolia" | "baseSepolia";

// Main Hook to Export Functionalities
export default function useDemaAccountKit() {
  // User and chain hooks
  const user = useUser();
  const { openAuthModal } = useAuthModal();

  const { chain, setChain, isSettingChain } = useChain();
  const { logout } = useLogout();

  // Passkey hooks
  const { addPasskey, isAddingPasskey, error } = useAddPasskey();

  // Smart Account hooks
  const [selectedChain, setSelectedChain] = useState<ChainType>("baseSepolia");
  const [balance, setBalance] = useState("");
  const [TokenBalance, SetTokenBalance] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const { client, address } = useSmartAccountClient({
    type: "LightAccount",
    policyId: getPolicyId(selectedChain),
  });
  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
  });

  // Transaction state
  const [estimatedGas, setEstimatedGas] = useState("");
  const [isTransactionInProgress, setTransactionInProgress] = useState(false);


  // Utility Functions
  function getPolicyId(chain: ChainType): string | undefined {
    const policyIdMapping = {
      polygonAmoy: process.env.NEXT_PUBLIC_POLYGON_POLICY_ID,
      sepolia: process.env.NEXT_PUBLIC_SEPOLIA_POLICY_ID,
      baseSepolia: process.env.NEXT_PUBLIC_POLICY_ID,
    };
    return policyIdMapping[chain];
  }

  function getRpcUrl(): string {
    switch (selectedChain) {
      case "polygonAmoy":
        return process.env.NEXT_PUBLIC_POLYGON_RPC || "";
      case "sepolia":
        return process.env.NEXT_PUBLIC_SEPOLIA_RPC || "";
      case "baseSepolia":
        return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "";
      default:
        return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "";
    }
  }

  async function fetchBalance() {
    if (!address) return;
    const rpcUrl = getRpcUrl();
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  }
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  async function fetchTokenBalance(tokenAddress: string) {
    if (!address) return;

    const rpcUrl = getRpcUrl();
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
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  }

  async function sendTokens(inputAddress: string, value: string) {
    if (!ethers.isAddress(inputAddress)) {
      throw new Error("Invalid Ethereum address");
    }

    const provider = new ethers.JsonRpcProvider(getRpcUrl());

    try {
      const gasEstimate = await provider.estimateGas({
        to: inputAddress,
        value: ethers.parseEther(value),
        data: "0x",
      });
      setEstimatedGas(ethers.formatUnits(gasEstimate, "gwei"));

      setTransactionInProgress(true);

      sendUserOperation({
        uo: {
          target: inputAddress as `0x${string}`,
          data: "0x",
          value: ethers.parseEther(value),
        },
      });
    } catch (err) {
      setTransactionInProgress(false);
      throw err;
    }
  }
  function encodeFunctionData({
    abi,
    functionName,
    args,
  }: {
    abi: any[];
    functionName: string;
    args: any[];
  }): string {
    const contractInterface = new ethers.Interface(abi);
    return contractInterface.encodeFunctionData(functionName, args);
  }
  async function CallContract(
    contractAddress: `0x${string}`, // Ensures a valid Ethereum address format
    ABI: any[],
    functionName: string,
    amount: string,
    args: any[]
  ) {
    setStartTime(new Date().getTime());
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC!;
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Generate function data using the ABI
    const functionData = encodeFunctionData({
      abi: ABI, // Expecting an ABI array
      functionName: functionName,
      args: [ethers.parseEther(amount), args],
    });

    try {
      // Estimate gas for the transaction
      const gasEstimate = await provider.estimateGas({
        to: contractAddress,
        value: ethers.parseEther(amount),
        data: functionData,
      });

      setEstimatedGas(ethers.formatUnits(gasEstimate, "gwei"));
      setTransactionInProgress(true);

      // Send the transaction as a UserOperation
      sendUserOperation({
        uo: {
          target: contractAddress,
          data: functionData,
          value: ethers.parseEther(amount),
        },
      });
    } catch (error) {
      console.error("Gas estimation or transaction error:", error);
    }
  }

  function handleChainChange(selected: ChainType) {
    if (selected === selectedChain) return;

    setSelectedChain(selected);
    const chainMap = {
      baseSepolia,
      polygonAmoy,
      sepolia,
    };

    setChain({ chain: chainMap[selected] });
  }

  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address, selectedChain]);

  return {
    // User Authentication
    user,
    authenticate: useAuthenticate(),

    // Passkey Management
    addPasskey,
    isAddingPasskey,
    passkeyError: error,

    // Transaction Utilities
    fetchBalance,
    sendTokens,
    balance,
    estimatedGas,
    isTransactionInProgress,
    isSendingUserOperation,

    // Chain Management
    selectedChain,
    handleChainChange,
    isSettingChain,
    chain,

    //contract Function
    CallContract,
    fetchTokenBalance,
	TokenBalance,
	
    // Policy ID and RPC URL
    getPolicyId,
    getRpcUrl,

    openAuthModal,
  };
}
