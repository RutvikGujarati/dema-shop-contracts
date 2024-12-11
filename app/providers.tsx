"use client";
import { config, queryClient } from "@/config";
import { AcrossProvider } from "@/context/AcrossProvider";
import { WagmiProvider } from "@/context/WagmiProvider";
import { AlchemyClientState } from "@account-kit/core";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";

export const Providers = (
  props: PropsWithChildren<{ initialState?: AlchemyClientState }>
) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider
        config={config}
        queryClient={queryClient}
        initialState={props.initialState}
      >
        <AcrossProvider>{props.children}</AcrossProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
};
