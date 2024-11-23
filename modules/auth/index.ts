import { getSigner } from "@account-kit/core";

class AuthManager {
  constructor(public config: any) {}

  async CreateSigner(config: any): Promise<any> {
    if (typeof window === "undefined") return;

    await new Promise((resolve) => setTimeout(resolve, 50));
    const signerInstance = getSigner(config);

    if (signerInstance) {
      console.log("Signer initialized successfully", signerInstance);
      return signerInstance;
    } else {
      console.error("Failed to initialize signer");
      return null;
    }
  }
}

class CreateAccount {
  private user: any = null;

  setUser(user: any) {
    this.user = user;
  }

  async Account() {
    if (!this.user) {
      console.error("User is not initialized");
      return null;
    }
    console.log("User Address:", this.user.address);
    return this.user.address;
  }
}

class CreateClient {
  private client: any = null;
  private address: string | null = null;

  setClient(client: any, address: string) {
    this.client = client;
    this.address = address;
  }

  async performAction() {
    if (!this.client) {
      console.error("Client is not initialized");
      return null;
    }
    console.log("Client Address:", this.address);
    // Perform actions with the client
  }
}

class OAuthLogin {
  constructor(public signerInstance: any) {}

  async authenticate(
    authProviderId: "google" | "facebook",
    redirectUrl: string
  ) {
    if (!this.signerInstance) {
      console.error("Signer is not initialized");
      return;
    }

    try {
      await this.signerInstance.authenticate({
        type: "oauth",
        authProviderId,
        mode: "popup",
        redirectUrl,
      });
      console.log(`Login with ${authProviderId} successful`);
    } catch (error: any) {
      console.error(`Failed to log in with ${authProviderId}:`, error.message);
    }
  }
}

class EmailLogin {
  constructor(public signerInstance: any) {}

  async EmailAuthenticate(email: any) {
    if (!this.signerInstance) {
      console.error("Signer is not initialized");
      return;
    }
    try {
      await this.signerInstance.authenticate({
        type: email,
        email: email,
      });

      console.log(`Login with ${email} successful`);
    } catch (error: any) {
      console.error(`Failed to log in with ${email}:`, error.message);
    }
  }
}

const authModule = { AuthManager, OAuthLogin, CreateAccount, CreateClient,EmailLogin };
export default authModule;
