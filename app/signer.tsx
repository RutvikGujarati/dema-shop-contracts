import { AlchemyWebSigner } from "@account-kit/signer";
 
export const signer = new AlchemyWebSigner({
  client: {
    connection: {
      apiKey: "e6qALHPNj2o2ByWRixa7NIZg3l-MusjE",
    },
    iframeConfig: {
      iframeContainerId: "alchemy-signer-iframe-container",
    },
  },
});