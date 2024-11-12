"use client";
import React, { useEffect, useState } from "react";
import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, sepolia } from "@account-kit/infra";
import {
  createMultiOwnerLightAccount,
  createMultiOwnerLightAccountAlchemyClient,
} from "@account-kit/smart-contracts";
import { generatePrivateKey } from "viem/accounts";
import { http } from "viem";
import { getAccount } from "@wagmi/core";
import { config } from "@/config";

const Home = () => {
  const [Account, setAccount] = useState<string | null>(null);
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

  // Function to create the multi-owner light account client
  const createClient = () => {
    return createMultiOwnerLightAccountAlchemyClient({
      signer: LocalAccountSigner.privateKeyToAccountSigner(
        generatePrivateKey()
      ),
      chain: sepolia,
      transport: alchemy({
        apiKey: API_KEY ?? "",
      }),
    });
  };


  const fetchAccount = async () => {
    try {
      const lightAccountClient = await createMultiOwnerLightAccount({
        chain: sepolia,
        transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC),
        signer: LocalAccountSigner.privateKeyToAccountSigner(
          generatePrivateKey()
        ),
      });
      setAccount(lightAccountClient.address);
      console.log("Account:", lightAccountClient.address);
    } catch (error) {
      console.error("Error creating account client:", error);
    }
  };

  return (
    <div>
      <button onClick={fetchAccount}>Fetch Owners</button>
      <div className="container">
        <div>
          <h3>Owner Addresses:</h3>
          {Account}
        </div>
      </div>
    </div>
  );
};

export default Home;
