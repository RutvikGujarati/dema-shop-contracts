"use client";

import React from "react";
import { AcrossClient } from "@across-protocol/app-sdk";
import { arbitrum, arbitrumSepolia, mainnet, optimism, optimismSepolia, polygon, sepolia } from "viem/chains";

const sdk = AcrossClient.create({
  chains: [sepolia, optimismSepolia, arbitrumSepolia,mainnet,arbitrum,optimism,polygon],
  useTestnet: false,
  logLevel: "DEBUG",
});

// assuming we want to update the sdk (??), we should pass it around via context.
const AcrossContext = React.createContext<AcrossClient>(sdk);

export function AcrossProvider({ children }: { children: React.ReactNode }) {
  return (
    <AcrossContext.Provider value={sdk}>{children}</AcrossContext.Provider>
  );
}

export function useAcross() {
	console.log("using across context")
  return React.useContext(AcrossContext);
}
