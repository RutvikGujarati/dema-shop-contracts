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

# Code Review Files:

### [Page.tsx](https://github.com/RutvikGujarati/dema-shop-contracts/blob/main/app/page.tsx)

- on this page user can send transaction to desire wallet Address or SCA.

> [!NOTE]
> user can also send ETH values with using gas policy or without Gas policy but it has currently issue with config of alchemy.

```javascript
const { client, address } = useSmartAccountClient({
   type: "LightAccount",
  - policyId: policyIdMapping[selectedChain as keyof typeof policyIdMapping]
 });
```

- need to remove this policy to send transaction without using gas policy
- user can also select chains that they want to send ETH amount.
- **Review** :- Passkey adding to the current signed account to login next time using passkey to access that account.

---

### [SignUp](https://github.com/RutvikGujarati/dema-shop-contracts/blob/main/app/SignUp/page.tsx)

- SignUp and login using Google, faceBook and apple on this page.

> why created separate signup page?
>
> - cause of custom signup/login socials pages.

1. if you are on localhost : `http://localhost:3000/SignUp`
2. if you are on vercel page : `https://dema-shop-contracts.vercel.app/SignUp`

---

### [Email-Auth](https://github.com/RutvikGujarati/dema-shop-contracts/blob/main/app/Email-Auth/page.tsx)

- use custom sign in/ sign Up method using email magic link verification.
- user can access their account using magic link sign in process.
  Access that page using :

1. if you are on localhost : `http://localhost:3000/Email-Auth`
2. if you are on vercel page : `https://dema-shop-contracts.vercel.app/Email-Auth`

---

### [ContractCall](https://github.com/RutvikGujarati/dema-shop-contracts/blob/main/app/ContractCall/page.tsx)

- Send transaction to Contract with using User-Operation(SCA)
> [!NOTE:]
> Currently working with gas policy

1. if you are on localhost : `http://localhost:3000/ContractCall`
2. if you are on vercel page : `https://dema-shop-contracts.vercel.app/ContractCall`

---

### [Passkey](https://github.com/RutvikGujarati/dema-shop-contracts/blob/main/app/Passkey/page.tsx)

- Custom page to use Passkey Authentication for sign the user to use SCA(smart contract Account)
- if the User has Created Account and added Passkey authentication then user can sign in with this page.

1. if you are on localhost : `http://localhost:3000/Passkey`
2. if you are on vercel page : `https://dema-shop-contracts.vercel.app/Passkey`

---

### [WithGas](https://github.com/RutvikGujarati/dema-shop-contracts/blob/main/app/WithGas/page.tsx)

- As per alchemy docs we can able to send transaction using not initialize client with `gas policy`

```javascript
const { client, address } = useSmartAccountClient({
  type: "LightAccount",
});
```
- so, I have not initialize but, it is still using gas policy id from config.

---

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
