// "use client";
// import { useState, useEffect } from "react";

// const Home = () => {
//   const [originChain, setOriginChain] = useState(1); // Default: Ethereum Mainnet
//   const [destinationChain, setDestinationChain] = useState(10); // Default: Optimism
//   const [inputToken, setInputToken] = useState("");
//   const [outputToken, setOutputToken] = useState("");
//   const [amount, setAmount] = useState("");
//   const [fees, setFees] = useState(null);
//   const [limits, setLimits] = useState(null);
//   const [routes, setRoutes] = useState([]);

//   useEffect(() => {
//     // Fetch available routes when the component loads
//     fetchAvailableRoutes();
//   }, []);

//   const fetchAvailableRoutes = async () => {
//     try {
//       const res = await fetch("https://app.across.to/api/available-routes");
//       const data = await res.json();
//       setRoutes(data);
//     } catch (err) {
//       console.error("Error fetching routes:", err);
//     }
//   };

//   const fetchFeesAndLimits = async () => {
//     if (!inputToken || !outputToken || !amount) return;

//     try {
//       // Fetch suggested fees
//       const feesRes = await fetch(
//         `https://app.across.to/api/suggested-fees?inputToken=${inputToken}
//&outputToken=${outputToken}&originChainId=${originChain}&destinationChainId=$
//{destinationChain}&amount=1000000000000000000`
//       );
//       const feesData = await feesRes.json();
//       setFees(feesData);

//       // Fetch limits
//       const limitsRes = await fetch(
//         `https://app.across.to/api/limits?inputToken=${inputToken}
// 		&outputToken=${outputToken}&originChainId=${originChain}&destinationChainId=${destinationChain}`
//       );
//       const limitsData = await limitsRes.json();
//       setLimits(limitsData);

//       const routes = await fetch(`https://app.across.to/api/available-routes`);
//       const routesData = await routes.json();
//       setRoutes(routesData);
//     } catch (err) {
//       console.error("Error fetching fees/limits:", err);
//     }
//   };
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
//       <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
//         <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">
//           Bridge Tokens with Across
//         </h1>

//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             fetchFeesAndLimits();
//           }}
//           className="space-y-4"
//         >
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               From
//             </label>
//             <select
//               value={originChain}
//               onChange={(e) => setOriginChain(Number(e.target.value))}
//               className="w-full border border-black-300 rounded-lg p-2 mt-1 "
//               style={{ color: "black" }}
//             >
//               <option value={1}>Ethereum</option>
//               <option value={10}>Optimism</option>
//               {/* Add other chains here */}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               To
//             </label>
//             <select
//               value={destinationChain}
//               onChange={(e) => setDestinationChain(Number(e.target.value))}
//               className="w-full border text-gray-700 border-gray-300 rounded-lg p-2 mt-1"
//             >
//               <option value={10}>Base</option>
//               <option value={1}>Ethereum</option>
//               {/* Add other chains here */}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Input Token
//             </label>
//             <input
//               type="text"
//               value={inputToken}
//               onChange={(e) => setInputToken(e.target.value)}
//               placeholder="Input token address"
//               className="w-full border text-gray-700 border-gray-300 rounded-lg p-2 mt-1"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Output Token
//             </label>
//             <input
//               type="text"
//               value={outputToken}
//               onChange={(e) => setOutputToken(e.target.value)}
//               placeholder="Output token address"
//               className="w-full border text-gray-700 border-gray-300 rounded-lg p-2 mt-1"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Amount
//             </label>
//             <input
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               placeholder="0.0"
//               className="w-full border text-gray-700 border-gray-300 rounded-lg p-2 mt-1"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600  text-white rounded-lg py-2 hover:bg-blue-700 transition"
//           >
//             Get Quote
//           </button>
//         </form>

//         <div className="mt-6">
//           {fees && (
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//               <h2 className="text-sm font-medium text-gray-700">
//                 Suggested Fees
//               </h2>
//               <pre className="text-sm text-gray-600">
//                 {JSON.stringify(fees, null, 2)}
//               </pre>
//             </div>
//           )}

//           {limits && (
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
//               <h2 className="text-sm font-medium text-gray-700">Limits</h2>
//               <pre className="text-sm text-gray-600">
//                 {JSON.stringify(limits, null, 2)}
//               </pre>
//             </div>
//           )}
//           {routes && (
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
//               <h2 className="text-sm font-medium text-gray-700">Routes</h2>
//               <pre className="text-sm text-gray-600">
//                 {JSON.stringify(routes, null, 2)}
//               </pre>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;
