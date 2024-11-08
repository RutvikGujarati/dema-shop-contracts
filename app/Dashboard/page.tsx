// app/login/page.tsx

"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Home = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAddress = localStorage.getItem("address");
    const verified = localStorage.getItem("verified"); 

    if (storedAddress && verified === "true") {
      setIsAuthenticated(true);
    } else {
      router.push("/Eth-Email"); 
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-green-500 to-blue-800 text-white">
      <div className="flex flex-col items-center gap-8 w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-gray-800">
        <h2 className="text-2xl font-bold">Welcome to the Dashboard!</h2>
        <p className="text-lg">You are successfully logged in.</p>
      </div>
    </main>
  );
};

export default Home;
