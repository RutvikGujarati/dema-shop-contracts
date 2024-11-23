"use client";
import React, { useEffect, useState } from "react";
import { LocalAccountSigner } from "@aa-sdk/core";
import {
  alchemy,
  createAlchemySmartAccountClient,
  sepolia,
} from "@account-kit/infra";
import {
  createMultiOwnerLightAccount,
  createMultiOwnerLightAccountAlchemyClient,
  multiOwnerLightAccountClientActions,
} from "@account-kit/smart-contracts";
import { generatePrivateKey } from "viem/accounts";
import { http } from "viem";
import { getAccount } from "@wagmi/core";
import { config } from "@/config";
import { useSendUserOperation } from "@account-kit/react";
import { CLIENT_REFERENCE_MANIFEST } from "next/dist/shared/lib/constants";

const Page = () => {
  const [Account, setAccount] = useState<string | null>(null);
  const [Client, setClient] = useState<ReturnType<
    typeof createMultiOwnerLightAccountAlchemyClient
  > | null>(null);
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

  const [processing, setProcessing] = useState(false);
  // Function to create the multi-owner light account client

  const account = createMultiOwnerLightAccount({
    signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
    chain: sepolia,
    transport: alchemy({
      apiKey: API_KEY ?? "",
    }),
  });

  async function createMultiPulgin() {
    setProcessing(true);
    try {
      const client = createAlchemySmartAccountClient({
        account: await account,
        chain: sepolia,
        transport: alchemy({
          apiKey: API_KEY ?? "",
        }),
      }).extend(multiOwnerLightAccountClientActions);
      setAccount(client.account.address);
      //   setClient(client);

      console.log("Account", client);

      setProcessing(false);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchAccount = async () => {
    try {
      const lightAccountClient =
        await createMultiOwnerLightAccountAlchemyClient({
          signer: LocalAccountSigner.privateKeyToAccountSigner(
            generatePrivateKey()
          ),
          chain: sepolia,
          transport: alchemy({
            apiKey: API_KEY ?? "",
          }),
        });
      setAccount(lightAccountClient.account.address);
      //   setClient(lightAccountClient);
      console.log("Account:", lightAccountClient);
      return lightAccountClient;
    } catch (error) {
      console.error("Error creating account client:", error);
    }
  };

  const setOwners = async () => {
    try {
      const ownersToAdd: any = ["0x14093F94E3D9E59D1519A9ca6aA207f88005918c"];
      const ownersToRemove: any = [];

      const AccountClient = await fetchAccount();
      if (!Client || !AccountClient) {
        console.log("client not initialized");
      }

      console.log("Client", Client);

      const opHash = await AccountClient.updateOwners({
        ownersToAdd,
        ownersToRemove,
      });

      const txHash = await AccountClient.waitForUserOperationTransaction({
        hash: opHash,
      });

      console.log("Transaction Hash:", txHash);
    } catch (error) {
      console.error("Error setting owners:", error);
    }
  };

  return (
    <main>
      <div className="container my-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <button onClick={setOwners} className="btn btn-primary">
            Fetch Owners
          </button>
        </div>
        <div className="d-flex justify-content-center align-items-center mb-3">
          <button onClick={createMultiPulgin} className="btn btn-primary">
            {processing ? "processing..." : "update owner"}
          </button>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-center mb-3">Owner Addresses</h3>
            <div className="card-text">{Account}</div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
