import { useState } from "react";
import axios from "axios";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [status, setStatus] = useState("");

  const handleSignup = async () => {
    if (email) {
      try {
        await axios.post("/api/auth/signup", { email });
        setEmailSent(true);
        setStatus("Verification code sent to your email.");
      } catch (error) {
        setStatus("Failed to send verification email.");
      }
    } else {
      setStatus("Please enter a valid email.");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await axios.post("/api/auth/verifyEmail", { email, code });
      setStatus("Email verified successfully. Passkey setup next!");
      // Proceed to passkey setup (handlePasskeyCreation function)
    } catch (error) {
      setStatus("Verification failed.");
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email (for backup)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSignup}>Send Verification Code</button>

      {emailSent && (
        <>
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={handleVerifyEmail}>Verify Email</button>
        </>
      )}
      <p>{status}</p>
    </div>
  );
};

export default Signup;
