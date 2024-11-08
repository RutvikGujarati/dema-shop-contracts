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
import { encodeFunctionData } from "viem";
const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-indigo-800 text-white">
      <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg text-gray-800 w-full max-w-lg">
        hii
      </div>
    </main>
  );
};

export default Home;
