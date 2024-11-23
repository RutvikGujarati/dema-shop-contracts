"use client";
import { useEffect, useState } from "react";
import { LocalAccountSigner } from "@aa-sdk/core";
import {
  alchemy,
  createAlchemySmartAccountClient,
  sepolia,
} from "@account-kit/infra";
import { getSignerType } from "@account-kit/smart-contracts";
import {
  createMultiOwnerLightAccount,
  multiOwnerLightAccountClientActions,
} from "@account-kit/core";
import { config } from "@/config";
import CreateSigner from "../signer";
import {
  useAuthenticate,
  useLogout,
  useSendUserOperation,
  useUser,
} from "@account-kit/react";
import { wagmiAbi } from "./wagmiAbi";
import { ethers } from "ethers";

const Home = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const { logout } = useLogout();

  const user = useUser();
  const [account, setAccount] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);
  const { signer } = CreateSigner(config, user);
  const [processing, setProcessing] = useState(false);
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onSuccess: ({ hash }) => {
      console.log("Transaction Hash:", hash);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  // Initialize a multi-owner light account
  const initMultiOwnerAccount = async () => {
    setProcessing(true);
    try {
      if (!signer) {
        throw new Error("Signer is not initialized.");
      }
      console.log("Signer:", signer);

      const lightAccountClient = createAlchemySmartAccountClient({
        account: await createMultiOwnerLightAccount({
          signer,
          chain: sepolia,
          transport: alchemy({
            apiKey: API_KEY || "",
          }),
        }),
        chain: sepolia,
        transport: alchemy({
          apiKey: API_KEY || "",
        }),
      }).extend(multiOwnerLightAccountClientActions);

      setClient(lightAccountClient);
      try {
        const ownerAddresses =
          await lightAccountClient.account.getOwnerAddresses();

        console.log("Owner addresses:", ownerAddresses);
      } catch (err) {
        console.error("Error fetching owner addresses:", err);
      }

      setAccount(lightAccountClient.account.address);

      console.log(
        "Multi-owner account created:",
        lightAccountClient.account.address
      );
    } catch (error) {
      console.error("Error initializing account:", error);
    } finally {
      setProcessing(false);
    }
  };

  const CheckSigner = async () => {
    if (!signer) {
      console.log("Signer initialized:", signer);
      return;
    }

    const signature: `0x${string}` = await signer.signMessage(
      "Gujarati Rutvik"
    );
    const signerType = await getSignerType({ client, signature, signer });
    console.log("Type of signer:", signerType);
  };

  useEffect(() => {
    if (signer) {
      console.log("Signer initialized:", signer);
    }
    if (!user) {
      console.log("user is not specified");
    }
    console.log("user address",user?.address);

    console.log("client", client);

  }, [signer, client]);

  const sendTransaction = async () => {
    console.log(client);
    sendUserOperation({
      uo: {
        target: "0x14093F94E3D9E59D1519A9ca6aA207f88005918c",
        data: "0x",
        value: ethers.parseEther("0.000001"),
      },
    });
  };

  const loginWithGoogle = async () => {
    if (!signer) {
      console.error("Multi-owner account is not initialized.");
      return;
    }
    try {
      await signer.authenticate({
        type: "oauth",
        authProviderId: "google",
        mode: "popup",
        // redirectUrl: "/MultiOwner",
      });
      initMultiOwnerAccount();

      console.log("Google login successful with account:", user?.email);
      setAuthenticated(true);

      console.log("Google login successful with account:", account);
    } catch (error) {
      console.error("Failed to log in with Google:", error);
    }
  };
  const owners: `0x${string}` = "0x903C81c52F2714a3cb41730981Ce739963b517c3";

  const addOwner = async () => {
    if (!client) {
      console.error("Multi-owner account client is not initialized.");
      return;
    }

    console.log(client);

    try {
      const ownersToAdd: any = ["0x14093F94E3D9E59D1519A9ca6aA207f88005918c"];
      const ownersToRemove: any = [
        
      ];

      const opHash = await client.updateOwners({
        ownersToAdd,
        ownersToRemove,
      });

      const txHash = await client.waitForUserOperationTransaction({
        hash: opHash,
      });
      console.log("Owner added:", opHash);
      console.log("Owner added:", txHash);
    } catch (error) {
      console.error("Error fetching owner addresses:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gray-100 min-h-screen">
      {/* <button
        onClick={initMultiOwnerAccount}
        disabled={processing}
        className={`px-6 py-3 font-semibold text-white rounded transition ${
          processing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {processing
          ? "Creating Multi-Owner Account..."
          : "Create Multi-Owner Account"}
      </button> */}

      {authenticated && (
        <h1 className="text-lg font-bold text-gray-700">
          User logged in: <span className="text-blue-500">{account}</span>
        </h1>
      )}

      <div className="w-full max-w-lg flex flex-col items-center gap-4 p-4 bg-white shadow-md rounded-lg">
        {account ? (
          <>
            <p className="text-gray-700 text-center">
              <strong>Account Address:</strong> {account}
            </p>
            <p className="text-gray-700 text-center">
              <strong>email Address:</strong> {user?.email}
            </p>
            <button
              onClick={sendTransaction}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded transition w-full"
            >
              {isSendingUserOperation ? "Sending..." : "send transaction"}
            </button>
            <button
              onClick={() => addOwner()}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded transition w-full"
            >
              Add New Owner
            </button>
            <button
              onClick={() => logout()}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded transition w-full"
            >
              Log Out
            </button>
          </>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded transition w-full"
          >
            Login with Google
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
