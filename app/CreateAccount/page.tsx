"use client";

import React, { useState } from "react";
import {
  createLightAccountAlchemyClient,
  LightAccount,
} from "@account-kit/smart-contracts";
import { sepolia, alchemy } from "@account-kit/infra";
import { LocalAccountSigner } from "@aa-sdk/core";
import { PrivateKeyAccount } from "viem/accounts";
import { generatePrivateKey } from "viem/accounts";

const Home = () => {
  const [account, setAccount] = useState<LightAccount<
    LocalAccountSigner<PrivateKeyAccount>
  > | null>(null);

  const createAccount = async () => {
    try {
      const accountResponse = await createLightAccountAlchemyClient({
        transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_API_KEY ?? "" }),
        chain: sepolia,
        signer: LocalAccountSigner.privateKeyToAccountSigner(
          generatePrivateKey()
        ),
      });

      console.log("Account created successfully!", accountResponse.account);
      // Set only the `account` part of the response in state
      setAccount(accountResponse.account);
      console.log("account from useState", account);
    } catch (error) {
      console.error("Failed to create account:", error);
    }
  };

  return (
    <>
      <button
        className="btn btn-primary bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded transition disabled:bg-gray-400"
        onClick={createAccount}
      >
        Create Account
      </button>
    </>
  );
};

export default Home;
