"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying token...");

  useEffect(() => {
    if (token) {
      fetch(`/api/verify-email-token?token=${token}`)
        .then((res) => res.json())
        .then((data : any) => {
          if (data.success) {
            setMessage("Your email has been successfully verified!");
            const email = data.email; 
            console.log("email address", email);

            localStorage.setItem("verified", "true");

            fetch("/api/login-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  console.log("Email stored successfully in emails.json");
                } else {
                  console.error("Error storing email:", data.message);
                }
              })
              .catch((error) => console.error("Error storing email:", error));

            setTimeout(() => {
              router.push("/Dashboard");
            }, 2000);
          } else {
            setMessage(`Verification failed: ${data.message}`);
          }
        })
        .catch((error) => {
          console.error("Verification error:", error);
          setMessage("An error occurred during verification.");
        });
    } else {
      setMessage("Token not found in the URL.");
    }
  }, [token, router]);

  return <div>{message}</div>;
};

export default VerifyEmail;
