import { ethers } from "ethers";

/**
 * Get a provider instance for interacting with the blockchain.
 * @param rpcUrl - RPC URL of the blockchain
 */
export const getProvider = (rpcUrl: string) =>
  new ethers.JsonRpcProvider(rpcUrl);

/**
 * Estimate Gas for a function call.
 * @param rpcUrl - RPC URL of the blockchain
 * @param contractAddress - Contract address
 * @param abi - ABI of the contract
 * @param functionName - Contract function to estimate gas for
 * @param args - Arguments for the function
 * @param value - Optional ETH value to send with the transaction
 */
export async function estimateGas({
  rpcUrl,
  contractAddress,
  abi,
  functionName,
  args = [],
  value = "0",
}: {
  rpcUrl: string;
  contractAddress: string;
  abi: any[];
  functionName: string;
  args?: any[];
  value?: string;
}) {
  const provider = getProvider(rpcUrl);

  const functionData = encodeFunctionData({
    abi,
    functionName,
    args,
  });

  try {
    const gasEstimate = await provider.estimateGas({
      to: contractAddress,
      data: functionData,
      value: ethers.parseEther(value),
    });

    console.log(
      `Gas Estimate: ${ethers.formatUnits(gasEstimate, "gwei")} Gwei`
    );
    return ethers.formatUnits(gasEstimate, "gwei");
  } catch (error) {
    console.error("Error estimating gas:", error);
    throw error;
  }
}
/**
 * Estimate Gas for a function call.
 * @param rpcUrl - RPC URL of the blockchain
 * @param contractAddress - Contract address
 * @param abi - ABI of the contract
 * @param functionName - Contract function to estimate gas for
 * @param args - Arguments for the function
 * @param value - Optional ETH value to send with the transaction
 */
export async function sendTransactionToContract({
  rpcUrl,
  contractAddress,
  abi,
  functionName,
  args = [],
  value = "0",
}: {
  rpcUrl: string;
  contractAddress: string;
  abi: any[];
  functionName: string;
  args?: any[];
  value?: string;
}) {
  const provider = getProvider(rpcUrl);

  const functionData = encodeFunctionData({
    abi,
    functionName,
    args,
  });

  try {
    const gasEstimate = await provider.estimateGas({
      to: contractAddress,
      data: functionData,
      value: ethers.parseEther(value),
    });

    console.log(
      `Gas Estimate: ${ethers.formatUnits(gasEstimate, "gwei")} Gwei`
    );
    return ethers.formatUnits(gasEstimate, "gwei");
  } catch (error) {
    console.error("Error estimating gas:", error);
    throw error;
  }
}

/**
 * Encode function data for a smart contract call.
 * @param abi - ABI of the contract
 * @param functionName - Name of the function to call
 * @param args - Arguments for the function
 */
export function encodeFunctionData({
  abi,
  functionName,
  args,
}: {
  abi: any[];
  functionName: string;
  args: any[];
}): string {
  const contractInterface = new ethers.Interface(abi);
  return contractInterface.encodeFunctionData(functionName, args);
}

/**
 * Call a dynamic contract function.
 * @param rpcUrl - RPC URL of the blockchain
 * @param contractAddress - Contract address
 * @param abi - ABI of the contract
 * @param functionName - Function to call
 * @param args - Arguments for the function
 * @param value - Optional ETH value to send
 */
export async function callContractFunction({
  rpcUrl,
  contractAddress,
  abi,
  functionName,
  args = [],
  value = "0",
}: {
  rpcUrl: string;
  contractAddress: string;
  abi: any[];
  functionName: string;
  args?: any[];
  value?: string;
}) {
  const provider = getProvider(rpcUrl);
  const functionData = encodeFunctionData({
    abi,
    functionName,
    args,
  });

  try {
    console.log(
      `Calling function ${functionName} on contract ${contractAddress}`
    );

    const response = await provider.call({
      to: contractAddress,
      data: functionData,
      value: ethers.parseEther(value),
    });

    console.log(`Function ${functionName} Response:`, response);
    return response;
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);
    throw error;
  }
}

/**
 * Fetch the balance of a given wallet address.
 * @param rpcUrl - RPC URL of the blockchain
 * @param address - Wallet address
 */
export async function fetchBalance(rpcUrl: string, address: string) {
  const provider = getProvider(rpcUrl);

  try {
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.formatEther(balance);

    console.log(`Wallet Balance: ${formattedBalance} ETH`);
    return formattedBalance === "0.0" ? "0 ETH" : `${formattedBalance} ETH`;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw error;
  }
}

/**
 * Fetch ERC20 token balance for a user.
 * @param rpcUrl - RPC URL of the blockchain
 * @param userAddress - User's wallet address
 * @param tokenAddress - ERC20 token contract address
 * @param abi - Optional ERC20 ABI
 */
export async function fetchERC20Balance({
  rpcUrl,
  userAddress,
  tokenAddress,
  abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ],
}: {
  rpcUrl: string;
  userAddress: string;
  tokenAddress: string;
  abi?: any[];
}) {
  const provider = getProvider(rpcUrl);

  try {
    const tokenContract = new ethers.Contract(tokenAddress, abi, provider);

    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    const formattedBalance = ethers.formatUnits(balance, decimals);

    console.log(`ERC20 Token Balance: ${formattedBalance}`);
    return formattedBalance === "0.0"
      ? "0 tokens"
      : `${formattedBalance} tokens`;
  } catch (error) {
    console.error("Error fetching ERC20 token balance:", error);
    throw error;
  }
}
