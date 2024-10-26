"use client";
import {
  useAuthModal,
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

export default function Home() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  const { client, address } = useSmartAccountClient({
    type: "LightAccount",
    policyId: process.env.NEXT_PUBLIC_POLICY_ID,
  });

  const handleClick = () => {
    window.location.href = "/";
  };
  const contractAddress = "0xf8FDa9e18ffe618Da320e316e75351FEdBE569c9";
  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onSuccess: ({ hash }) => {
      console.log(hash);
      console.log("success");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const [amount, setAmount] = useState("");
  const [requestId, setRequestId] = useState("");
  const [orderDesc, setOrderDesc] = useState("");
  const [userId, setUserId] = useState("");
  const [value, setValue] = useState("");

  function CallContract() {
    console.log(`sending transaction to ...${contractAddress}`);
    sendUserOperation({
      uo: {
        target: contractAddress,
        data: encodeFunctionData({
          abi: ABI,
          functionName: "place_Order",
          args: [amount, requestId, orderDesc, userId],
        }),
        value: ethers.parseEther(value),
      },
    });
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

          <h3 className="text-lg font-semibold">Place Order</h3>

          <input
            type="text"
            placeholder="Amount (e.g., 2)"
            className="input-field"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            type="text"
            placeholder="Request ID (e.g., 1)"
            className="input-field "
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
          />

          <input
            type="text"
            placeholder="Order Description"
            className="input-field "
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
          <input
            type="text"
            placeholder="Eth amount(e.g., 0.001)"
            className="input-field "
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <button
            className="flex flex-col btn btn-primary items-center"
            disabled={isSendingUserOperation}
            onClick={CallContract}
          >
            Place Order
          </button>
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
