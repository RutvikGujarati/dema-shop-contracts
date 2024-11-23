import { getSigner } from "@account-kit/core";
import { config } from "@/config";
import { AlchemyWebSigner } from "@account-kit/signer";

let signer: AlchemyWebSigner | null = null;
let storedBundle: string | null = null;

// Initialize signer (to be called before using any function)
export async function initializeSigner() {
	if (typeof window === "undefined") return;

  if (signer) return;

  await new Promise((resolve) => setTimeout(resolve, 50));

  const signerInstance = getSigner(config);

  if (signerInstance) {
    signer = signerInstance;
    console.log("Signer initialized successfully",signerInstance);
  } else {
    throw new Error("Failed to initialize signer");
  }
}

// Authenticate with Passkey (SignUp)
export async function authenticateWithPasskey(username: string) {
  if (!signer) throw new Error("Signer not initialized");

  try {
    await signer.authenticate({
      type: "passkey",
      createNew: true,
      username:username,
    });
    console.log("Authentication successful");
    return true;
  } catch (error) {
    console.error("Error authenticating with passkey:", error);
    throw error;
  }
}

// Login with Passkey
export async function loginWithPasskey() {
  if (!signer) throw new Error("Signer not initialized");

  try {
    await signer.authenticate({
      type: "passkey",
      createNew: false,
    });
    console.log("Login successful");
    return true;
  } catch (error) {
    console.error("Error logging in with passkey:", error);
    throw error;
  }
}

// Attach Email
export async function attachEmail(email: string) {
  if (!signer) throw new Error("Signer not initialized");

  try {
    await signer.authenticate({
      type: "passkey",
      email:email,
    });
    console.log("Email attached successfully");
    return true;
  } catch (error) {
    console.error("Error attaching email:", error);
    throw error;
  }
}

export async function loginWithApple() {
  if (!signer) {
    console.log("Signer is not initialized");
    return;
  }

  try {
    await signer.authenticate({
      type: "oauth",
      authProviderId: "auth0",
      auth0Connection: "apple",
      mode: "popup",
    });
    console.log("SignUp/Login with apple successful");
  } catch (error: any) {
    console.error("Failed to log in with apple:", error.message);
  }
}

export async function loginWithFacebook() {
  if (!signer) {
    console.log("Signer is not initialized");
    return;
  }

  try {
    await signer.authenticate({
      type: "oauth",
      authProviderId: "facebook",
      mode: "redirect",
      redirectUrl: "/SignUp",
    });
    console.log("signUp/Login with facebook successful");
  } catch (error: any) {
    console.error("Failed to log in with facebook:", error.message);
  }
}

export async function loginWithGoogle() {
  if (!signer) {
    console.log("Signer is not initialized");
    return;
  }

  try {
    await signer.authenticate({
      type: "oauth",
      authProviderId: "google",
      mode: "redirect",
      redirectUrl: "/SignUp",
    });
    console.log("Login with Google successful");
  } catch (error: any) {
    console.error("Failed to log in with Google:", error.message);
  }
}

/**
 * Authenticate with a bundle (e.g., from an email link)
 */
export async function completeAuthenticationWithBundle(bundle: string) {
	if (!signer) throw new Error("Signer not initialized");
  
	if (bundle) {
	  try {
		console.log("Authenticating with bundle:", bundle);
		await signer.authenticate({ type: "email", bundle });
		console.log("Authentication successful");
  
		// Clear the bundle from the URL after successful authentication
		const url = new URL(window.location.href);
		url.searchParams.delete("bundle");
		window.history.replaceState({}, document.title, url.toString());
  
		// Clear the stored bundle
		storedBundle = null;
		alert("Smart account created!");
		return true;
	  } catch (error) {
		console.error("Error authenticating with email bundle:", error);
		throw error;
	  }
	} else {
	  throw new Error("No bundle found for authentication");
	}
  }
  
  /**
   * Store a bundle temporarily (e.g., from a URL query parameter)
   */
  export function storeBundleFromURL() {
	const params = new URLSearchParams(window.location.search);
	const bundle = params.get("bundle");
	if (bundle) {
	  console.log("Storing bundle from URL:", bundle);
	  storedBundle = bundle;
	}
	return bundle;
  }
  
  /**
   * Wait for signer initialization and complete authentication with a stored bundle
   */
  export async function waitForSignerAndAuthenticate() {
	console.log("Waiting for signer to be initialized...");
  
	// Wait for signer to initialize
	while (!signer) {
	  await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms before checking again
	}
	console.log("Signer is ready!");
  
	if (storedBundle) {
	  return completeAuthenticationWithBundle(storedBundle);
	} else {
	  console.error("No stored bundle for authentication");
	}
  }
  
  /**
   * Authenticate user with email (send email link)
   */
  export async function authenticateWithEmail(email: string) {
	if (!signer) throw new Error("Signer not initialized");
  
	try {
	  console.log(`Sending authentication email to: ${email}`);
	  await signer.authenticate({
		type: "email",
		email,
	  });
	  alert(`Email link sent for authentication to: ${email}`);
	  return true;
	} catch (error: unknown) {
	  if (error instanceof Error) {
		console.error("Error authenticating with email:", error.message);
		console.error("Stack trace:", error.stack);
	  } else {
		console.error("Unexpected error:", error);
	  }
	  throw error;
	}
  }