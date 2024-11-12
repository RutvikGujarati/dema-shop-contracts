import { createAcrossClient } from "@across-protocol/app-sdk";
import { mainnet, optimism, arbitrum } from "viem/chains";

const Home = () => {
  const client = createAcrossClient({
    integratorId: "0xdead", // 2-byte hex string
    chains: [mainnet, optimism, arbitrum],
  });
};

export default Home;
