"use client";

import React, { useState, useEffect } from "react";
import {
  createAcrossClient,
  AcrossClient,
  ExecutionProgress,
} from "@across-protocol/app-sdk";
import { useAcross } from "@/context/AcrossProvider";
import {
  mainnet,
  optimism,
  arbitrum,
  arbitrumSepolia,
  optimismSepolia,
  sepolia,
  polygon,
} from "viem/chains";
import { Address, createWalletClient, custom, parseEther } from "viem";
import { toAccount } from "viem/accounts";

const chainOptions = [
  { id: arbitrum.id, name: "arbitrum" },
  { id: optimism.id, name: "optimism" },
  { id: polygon.id, name: "polygon" },
  { id: mainnet.id, name: "ETH" },
  { id: sepolia.id, name: "Ethereum sepolia" },
  { id: arbitrumSepolia.id, name: "Arbitrum sepolia" },
  { id: optimismSepolia.id, name: "Optimism sepolia" },
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [Amount, setAmount] = useState<string>("");
  const [walletClient, setWalletClient] = useState<any>(null);
  const [originChain, setOriginChain] = useState<number>(arbitrum.id);
  const [destinationChain, setDestinationChain] = useState<number>(polygon.id);
  const [quote, setQuote] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false); // To control the visibility of the popup
  const [amountToSend, setAmountToSend] = useState(""); // Amount to send to the smart wallet
  const [smartWalletAddress, setSmartWalletAddress] = useState("");

  const [progress, setProgress] = useState<ExecutionProgress>({
    status: "idle",
    step: "approve",
  });
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const client = AcrossClient.create({
    useTestnet: true,
    chains: [sepolia, optimismSepolia, arbitrumSepolia],
  });

  const sdk = useAcross();

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account = accounts[0];
      setWalletAddress(account);
      setIsConnected(true);

      const wallet = createWalletClient({
        account: toAccount(account as Address),
        transport: custom(window.ethereum!),
      });

      setWalletClient(wallet);
      console.log("Wallet connected:", account);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      setError("Failed to connect wallet");
    }
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) {
      setError("Ethereum wallet is not available");
      return;
    }

    const currentChainId = await walletClient.getChainId();
    if (currentChainId === chainId) {
      console.log("Already on the correct chain:", chainId);
      return; // Avoid unnecessary network switch
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      console.log(`Switched to chain ${chainId}`);
    } catch (err: any) {
      if (err.code === 4902) {
        setError("Chain is not added to the wallet. Add it manually.");
      } else {
        console.error("Failed to switch chain:", err);
        setError("Failed to switch network.");
      }
    }
  };
  const tokenOptions: Record<number, { address: string; name: string }[]> = {
    [arbitrum.id]: [
      { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", name: "WETH" },
      { address: "0xFF970A61A04b1CA14834A43f5de4533ebD53d14E", name: "USDC" },
    ],
    [optimism.id]: [
      { address: "0x4200000000000000000000000000000000000006", name: "WETH" },
      { address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", name: "USDC" },
    ],
    [polygon.id]: [
      { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", name: "WETH" },
      { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", name: "USDC" },
    ],
  };

  const [originToken, setOriginToken] = useState<string>(
    tokenOptions[arbitrum.id][0].address // Default token for origin chain
  );
  const [destinationToken, setDestinationToken] = useState<string>(
    tokenOptions[polygon.id][0].address // Default token for destination chain
  );

  const fetchQuote = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    // Ensure both tokens are selected
    if (!originToken || !destinationToken) {
      setError("Please select both the origin and destination tokens");
      return;
    }

    const route = {
      originChainId: originChain,
      destinationChainId: destinationChain,
      inputToken: originToken, // Use selected origin token
      outputToken: destinationToken, // Use selected destination token
    };

    try {
      setError(null);
      const fetchedQuote = await client.getQuote({
        route,
        inputAmount: parseEther(Amount), // Adjust the amount if needed
      });
      setQuote(fetchedQuote);
      console.log("Fetched Quote:", fetchedQuote);
    } catch (err) {
      console.error("Failed to fetch quote:", err);
      setError("Failed to fetch quote");
    }
  };

  const executeQuote = async () => {
    if (!walletClient) {
      setError("Wallet not connected");
      console.log("connected address", walletAddress);

      return;
    }

    if (!quote) {
      setError("No quote available to execute");
      return;
    }

    setError(null);
    console.log("new updated");

    try {
      // Ensure the wallet is on the correct origin chain
      await switchNetwork(originChain);

      // Explicitly pass the chain to the WalletClient and Across Client
      const result = await sdk.executeQuote({
        walletClient: createWalletClient({
          account: walletClient.account,
          chain: { id: originChain, ...walletClient.chain },
          transport: custom(window.ethereum!),
        }),
        infiniteApproval: true,
        deposit: quote.deposit,
        skipAllowanceCheck: true,
        onProgress: (progress) => {
          console.log(progress);

          if (progress.step === "approve" && progress.status === "txSuccess") {
            const { txReceipt } = progress;
          }

          if (progress.status === "txSuccess" && progress.step === "deposit") {
            console.log(progress.txReceipt);
            const { txReceipt } = progress;
          }
          if (progress.status === "txSuccess" && progress.step === "fill") {
            console.log(progress.txReceipt);
            const { fillTxTimestamp, txReceipt, actionSuccess } = progress;
          }
          setProgress(progress);
        },
      });

      console.log("Transaction Result:", result);
      setShowPopup(true);
    } catch (err) {
      console.error("Transaction failed:", err);
      setError("Transaction failed");
    }
  };

  const sendToSmartAccount = async () => {
    if (!amountToSend || parseFloat(amountToSend) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      const tx = await walletClient.sendTransaction({
        to: smartWalletAddress,
        value: parseEther(amountToSend),
      });

      console.log("Transaction sent to smart wallet:", tx);
      setShowPopup(false);
      setAmountToSend("");
    } catch (err) {
      console.error("Failed to send transaction:", err);
      setError("Failed to send tokens to smart wallet");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dema Swap</h1>

      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        ) : (
          <p className="text-sm text-gray-700 mb-4">
            Connected Wallet: {walletAddress}
          </p>
        )}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h2 className="text-lg font-semibold mb-4">
                Send to Smart Wallet
              </h2>
              <input
                type="text"
                placeholder="Amount to send"
                value={amountToSend}
                onChange={(e) => setAmountToSend(e.target.value)}
                className="w-full p-2 border border-gray-300 text-gray-700 rounded-md mb-4"
              />
              <input
                type="text"
                placeholder="Smart Account Address"
                value={smartWalletAddress}
                onChange={(e) => setSmartWalletAddress(e.target.value)}
                className="w-full p-2 border border-gray-300 text-gray-700 rounded-md mb-4"
              />
              <button
                onClick={sendToSmartAccount}
                className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md mt-2 hover:bg-blue-600"
              >
                Send Tokens
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full mt-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col mt-4 space-y-4">
          {/* First Row: From and To Chains */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                From Chain
              </label>
              <select
                value={originChain}
                onChange={(e) => {
                  setOriginChain(Number(e.target.value));
                  setOriginToken(""); // Reset token when chain changes
                }}
                className="mt-1 block w-full border text-gray-800 border-gray-300 rounded-md"
              >
                {chainOptions.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                To Chain
              </label>
              <select
                value={destinationChain}
                onChange={(e) => {
                  setDestinationChain(Number(e.target.value));
                  setDestinationToken("");
                }}
                className="mt-1 block w-full border text-gray-800 border-gray-300 rounded-md"
              >
                {chainOptions.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Second Row: From and To Tokens */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                From Token
              </label>
              <select
                value={originToken}
                onChange={(e) => setOriginToken(e.target.value)}
                className="mt-1 block w-full border text-gray-800 border-gray-300 rounded-md"
              >
                {tokenOptions[originChain]?.length > 0 ? (
                  tokenOptions[originChain].map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.name}
                    </option>
                  ))
                ) : (
                  <option value="">No tokens available for this chain</option>
                )}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                To Token
              </label>
              <select
                value={destinationToken}
                onChange={(e) => setDestinationToken(e.target.value)}
                className="mt-1 block w-full border text-gray-800 border-gray-300 rounded-md"
              >
                {tokenOptions[destinationChain]?.length > 0 ? (
                  tokenOptions[destinationChain].map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.name}
                    </option>
                  ))
                ) : (
                  <option value="">No tokens available for this chain</option>
                )}
              </select>
            </div>
          </div>
        </div>
        <input
          type="text"
          placeholder="Amount (e.g., 0.002)"
          className="input-field py-2 mt-3 text-gray-700"
          value={Amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          onClick={fetchQuote}
          className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md mt-4 hover:bg-blue-600"
        >
          Get Quote
        </button>

        {quote && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Quote Details:
            </h2>
            <p className="text-gray-600 mt-2">
              Deposit Token: {quote.deposit.inputToken} <br />
              Deposit Amount: {Amount} <br />
              Output Token: {quote.deposit.outputToken}
            </p>
          </div>
        )}

        <button
          onClick={executeQuote}
          disabled={!quote}
          className={`w-full font-semibold py-2 px-4 rounded-md mt-4 
    ${
      quote
        ? "bg-green-500 hover:bg-green-600 text-white"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
        >
          Execute Quote
        </button>

        {progress && <p className="text-blue-600 mt-4">{progress.status}</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}
