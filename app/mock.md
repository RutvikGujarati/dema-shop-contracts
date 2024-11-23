````javascript
 const createClient = createMultiOwnerLightAccountAlchemyClient({
    signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
    chain: sepolia,
    transport: alchemy({
      apiKey: API_KEY ?? "",
    }),
  });
````
