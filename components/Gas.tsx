import {
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { ethers } from "ethers";

export default function Gas() {
  const { client } = useSmartAccountClient({
    type: "LightAccount",
  });
  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    onSuccess: ({ hash }) => {
      // [optional] Do something with the hash and request
	  console.log(hash)
    },
    onError: (error) => {
      // [optional] Do something with the error
	  console.log(error)
    },
    // [optional] ...additional mutationArgs
  });

  return (
    <div>
      <button
        onClick={() =>
          sendUserOperation({
            uo: {
              target: "0x2CEA04600ef19d8872F1e85aaf829E853D268139",
              data: "0x",
              value: ethers.parseEther("0.0002"),
            },
          })
        }
        disabled={isSendingUserOperation}
      >
        {isSendingUserOperation ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
