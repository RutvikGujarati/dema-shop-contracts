"use client";

import React, { useState } from "react";
import { createAcrossClient } from "@across-protocol/app-sdk";
import { mainnet, optimism, arbitrum, polygon } from "viem/chains";
import { parseEther, formatEther } from "viem";
import { useWalletClient } from "wagmi";

const client = createAcrossClient({
  integratorId: "0xdead", // Replace with your actual integrator ID
  chains: [mainnet, optimism, arbitrum, polygon],
});

export default function Home() {
  const { data: wallet } = useWalletClient(); // Wagmi's wallet client
  const [sourceChain, setSourceChain] = useState(arbitrum.id); // Default: Arbitrum
  const [destinationChain, setDestinationChain] = useState(optimism.id); // Default: Optimism
  const [inputToken, setInputToken] = useState("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"); // WETH on Arbitrum
  const [outputToken, setOutputToken] = useState("0x4200000000000000000000000000000000000006"); // WETH on Optimism
  const [amount, setAmount] = useState<string>("1"); // Default amount: 1 ETH
  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  // Fetch a quote
  const fetchQuote = async () => {
    if (!amount || !inputToken || !outputToken) {
      alert("Please provide valid input values.");
      return;
    }

    setIsLoading(true);
    setProgress(null);

    try {
      const route = {
        originChainId: sourceChain,
        destinationChainId: destinationChain,
        inputToken,
        outputToken,
      };

      const fetchedQuote = await client.getQuote({
        route,
        inputAmount: parseEther(amount),
      });

      setQuote(fetchedQuote);
      console.log("Quote fetched:", fetchedQuote);
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute the swap
  const executeSwap = async () => {
    if (!quote || !wallet) {
      alert("Missing quote or wallet client.");
      return;
    }

    setIsLoading(true);
    setProgress("Executing swap...");

    try {
      await client.executeQuote({
        walletClient: wallet,
        deposit: quote.deposit,
        onProgress: (progress) => {
          console.log("Progress update:", progress);

          if (progress.step === "approve" && progress.status === "txSuccess") {
            setProgress("Approval successful.");
          }
          if (progress.step === "deposit" && progress.status === "txSuccess") {
            setProgress(`Deposit successful. Deposit ID: ${progress.depositId}`);
          }
          if (progress.step === "fill" && progress.status === "txSuccess") {
            setProgress("Swap completed successfully!");
          }
        },
      });
    } catch (error) {
      console.error("Error executing swap:", error);
      setProgress("Swap failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Across Protocol Swap</h1>
      <div>
        <label>
          Source Chain:
          <select value={sourceChain} onChange={(e) => setSourceChain(Number(e.target.value))}>
            <option value={arbitrum.id}>Arbitrum</option>
            <option value={optimism.id}>Optimism</option>
            <option value={mainnet.id}>Ethereum Mainnet</option>
            <option value={polygon.id}>Polygon</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Destination Chain:
          <select
            value={destinationChain}
            onChange={(e) => setDestinationChain(Number(e.target.value))}
          >
            <option value={arbitrum.id}>Arbitrum</option>
            <option value={optimism.id}>Optimism</option>
            <option value={mainnet.id}>Ethereum Mainnet</option>
            <option value={polygon.id}>Polygon</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Input Token Address:
          <input
            type="text"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="e.g., 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
          />
        </label>
      </div>
      <div>
        <label>
          Output Token Address:
          <input
            type="text"
            value={outputToken}
            onChange={(e) => setOutputToken(e.target.value)}
            placeholder="e.g., 0x4200000000000000000000000000000000000006"
          />
        </label>
      </div>
      <div>
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
          />
        </label>
      </div>
      <div>
        <button onClick={fetchQuote} disabled={isLoading}>
          {isLoading ? "Fetching Quote..." : "Get Quote"}
        </button>
      </div>
      {quote && (
        <div>
          <h2>Quote Details</h2>
          <p>
            Input Amount: {formatEther(quote.inputAmount)} {quote.inputToken.symbol}
          </p>
          <p>
            Output Amount: {formatEther(quote.outputAmount)} {quote.outputToken.symbol}
          </p>
          <p>Estimated Fee: {formatEther(quote.fee)}</p>
          <p>Estimated Time: {quote.estimatedTime} minutes</p>
          <button onClick={executeSwap} disabled={isLoading}>
            {isLoading ? "Executing Swap..." : "Execute Swap"}
          </button>
        </div>
      )}
      {progress && <p>{progress}</p>}
    </div>
  );
}
