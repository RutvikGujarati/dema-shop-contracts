import React, { useState } from "react";
import emailjs from "emailjs-com";

const EmailVerificationComponent = () => {
  const [email, setEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Function to send the verification code
  const sendVerificationCode = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    setIsSending(true);

    try {
      // Generate a random 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      setGeneratedCode(verificationCode);
      console.log(verificationCode);

      // Prepare the parameters for EmailJS
      const templateParams = {
        to_email: email,
        to_name: "Gujarati", // Replace with recipient's name if you have it
        from_name: "Rutvik", // Replace with your service or sender name
        message: `Please use the code below to verify your email to update. ${verificationCode}`,
        verification_code: verificationCode, // Add the verification code here
      };

      // Send email using EmailJS
      await emailjs.send(
        "service_x11bc7n", // Replace with your EmailJS service ID
        "template_7z7le3n", // Replace with your EmailJS template ID
        templateParams,
        "1qxN3fB6NDJbjhNyw" // Replace with your EmailJS user ID
      );

      alert("Verification code sent to your email.");
    } catch (error) {
      console.error("Failed to send verification code:", error);
      alert("Failed to send verification code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Function to verify the code
  const verifyCode = () => {
    if (parseInt(enteredCode) === generatedCode) {
      setIsCodeVerified(true);
      alert("Verification successful!");
    } else {
      alert("Incorrect verification code. Please try again.");
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow p-4">
            <h5 className="card-title text-center">set Backup Email </h5>
            <div className="mb-3">
              <input
                type="email"
                className="form-control input-field"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="d-grid gap-2 mb-3">
              <button
                className="btn btn-primary"
                onClick={sendVerificationCode}
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send Verification Code"}
              </button>
            </div>

            {generatedCode && (
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter verification code"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                />
              </div>
            )}
            {generatedCode && (
              <div className="d-grid gap-2">
                <button className="btn btn-success" onClick={verifyCode}>
                  Verify Code
                </button>
              </div>
            )}

            {isCodeVerified && (
              <div className="alert alert-success mt-3 text-center">
                Verification successful!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationComponent;
