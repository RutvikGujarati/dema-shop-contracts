import { AlchemyWebSigner } from "@account-kit/signer";
 
export const signer = new AlchemyWebSigner({
  client: {
    connection: {
      apiKey: process.env.NEXT_PUBLIC_API_KEY ?? "",
    },
    iframeConfig: {
      iframeContainerId: "alchemy-signer-iframe-container",
    },
  },
});