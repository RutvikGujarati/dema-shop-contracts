import {
	AlchemyAccountsUIConfig,
	cookieStorage,
	createConfig,
  } from "@account-kit/react";
  import {
	alchemy,
	base,
	baseSepolia,
	polygonAmoy,
	optimismSepolia,
	sepolia,
  } from "@account-kit/infra";
  import { QueryClient } from "@tanstack/react-query";
  import { polygon,blastSepolia } from "viem/chains";
  
  const uiConfig: AlchemyAccountsUIConfig = {
	illustrationStyle: "outline",
	auth: {
	  sections: [
		//   [
		//     {
		//       type: "social",
		//       authProviderId: "auth0",
		//       auth0Connection: "google-oauth2",
		//       logoUrl: "./apple.png",
		//       mode: "popup",
		//     },
		//   ],
		[{ type: "email" }],
		[
		  { type: "passkey" },
		  { type: "social", authProviderId: "google", mode: "popup" },
		  { type: "social", authProviderId: "facebook", mode: "popup" },
		  { type: "social", authProviderId: "apple", mode: "popup" },
		],
		[
		  {
			type: "external_wallets",
			walletConnect: { projectId: "your-project-id" },
		  },
		],
	  ],
	  addPasskeyOnSignup: true,
	},
  };
  
  export const config = createConfig(
	{
	  transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_API_KEY ?? "" }),
	  chain: baseSepolia,
	  chains: [
		{
		  chain: polygon,
		  transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_API_KEY ?? "" }),
		  policyId: "MAINNET_GAS_MANAGER_POLICY_ID",
		},
		{
		  chain: sepolia,
		  transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_API_KEY ?? "" }),
		  policyId: process.env.NEXT_PUBLIC_SEPOLIA_POLICY_ID,
		},
		{
		  chain: baseSepolia,
		  transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_API_KEY ?? "" }),
		  policyId: process.env.NEXT_PUBLIC_POLICY_ID,
		},
		{
		  chain: baseSepolia,
		  transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_API_KEY ?? "" }),
		  policyId: "SEPOLIA_GAS_MANAGER_POLICY_ID",
		},
	  ],
	  ssr: true, // more about ssr: https://accountkit.alchemy.com/react/ssr
	  storage: cookieStorage, // more about persisting state with cookies: https://accountkit.alchemy.com/react/ssr#persisting-the-account-state
	  enablePopupOauth: true, // must be set to "true" if you plan on using popup rather than redirect in the social login flow
	},
	uiConfig
  );
  
  export const queryClient = new QueryClient();
  