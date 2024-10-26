# Dema Smart Account

Dema Smart Account Authentication provides a streamlined approach for smart contract interactions, user authentication, and transactions using Alchemy's `account-kit`.

### Live site:

[Dema-shop-contracts](https://dema-shop-contracts.vercel.app/)

## Installation Guide

### Step 1: Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/RutvikGujarati/dema-shop-contracts

```

### Step 2: Install Dependencies

Navigate to the project directory and install the necessary dependencies:

```bash
cd dema-shop-contracts
yarn
```

### Step 3: Set Up Environment Variables

Configure your `.env.local` file according to the requirements specified in `.env`

### Step 4: Start the Development Server

Use one of the following commands to start the server:

```bash
yarn dev
# OR
npm run dev
```

### Authentication

- creating Auth sign up using alchemy **account-kit** @account-kit/react.

- use `useAuthModal` hook for login and `useLogout` hook for logout.

```javascript
import { useAuthModal, useLogout } from "@account-kit/react";

// Display login modal
const { showModal } = useAuthModal();
showModal();

// Logout function
const logout = useLogout();
logout();
```

### sending transaction to EOA Accounts

This project enables users to send tokens to EOA addresses through smart account abstraction.

1. Initialize Smart Account

Initialize the smart account using the `useSmartAccountClient` hook. This creates an address for the user, enabling interaction with the blockchain through an abstracted account.

```javascript
import { useSmartAccountClient } from "@account-kit/react";
const { client, address } = useSmartAccountClient({
  type: "LightAccount",
});
```

2. Send Tokens to EOA address using `useSendUserOperation` or uo.

To send tokens to an EOA address, use the `useSendUserOperation` hook, which initiates the user operation for transactions.

```javascript
const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
  client,
  waitForTxn: true,
  onSuccess: ({ hash }) => console.log("Transaction Hash:", hash),
  onError: (error) => console.error("Error:", error),
});
```

3. Sending Transactions

After initializing `sendUserOperation`, you can send a transaction by specifying the target address, data, and value.

```javascript
sendUserOperation({
  uo: {
    target: "address",
    data: "0x",
    value: ethers.parseEther("0.001"),
  },
});
```
