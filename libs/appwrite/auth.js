import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Query,
  Permission,
  Role,
} from "react-native-appwrite";
import { conf } from "../../constants/config";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

class Authentication {
  client;
  account;
  avatar;
  databases;
  constructor() {
    this.client = new Client()
      .setEndpoint(conf.endpoint)
      .setProject(conf.projectId)
      .setPlatform(conf.platform);
    this.account = new Account(this.client);
    this.avatar = new Avatars(this.client);
    this.databases = new Databases(this.client);
  }

  //   createAccount = async (username, email, password) => {
  //     try {
  //       const newAccount = await this.account.create(
  //         ID.unique(),
  //         email,
  //         password,
  //         username
  //       );
  //       console.log("New Account", newAccount);

  //       if (!newAccount)
  //         throw Error("Something went wrong while creating an account");
  //       const avatarUrl = this.avatar.getInitials(username);
  //       // Delete any existing session to avoid conflicts
  //       try {
  //         await this.account.deleteSession("current");
  //       } catch (e) {
  //         console.log("No existing session to delete:", e);
  //       }

  //       //   const session = await this.signIn(email, password);
  //       // Create session directly
  //       const session = await this.account.createEmailPasswordSession(
  //         email,
  //         password
  //       );
  //       if (!session?.$id) {
  //         throw new Error("Failed to create session");
  //       }

  //       const newUser = await this.databases.createDocument(
  //         conf.databaseId,
  //         conf.usersCollectionId,
  //         ID.unique(),
  //         {
  //           id: newAccount.$id,
  //           username,
  //           email,
  //           avatar: avatarUrl,
  //         },
  //         [
  //           Permission.read(Role.users()), // Authenticated users can read
  //           Permission.update(Role.user(newAccount.$id)), // Only the user can update
  //           Permission.delete(Role.user(newAccount.$id)),
  //         ]
  //       );
  //       console.log("User : ", newUser);

  //       // Store user data in AsyncStorage
  //       await AsyncStorage.setItem("user", JSON.stringify(newUser));
  //       await AsyncStorage.setItem("session", JSON.stringify(session));

  //       console.log("creating...");
  //       return {
  //         user: newUser,
  //         session,
  //       };
  //     } catch (error) {
  //       console.log(error);
  //       console.log("found it");
  //       // Clean up AsyncStorage on error
  //       await AsyncStorage.removeItem("user");
  //       await AsyncStorage.removeItem("session");
  //       throw new Error(error.message || "Failed to create account");
  //     }
  //   };

  createAccount = async (username, email, password) => {
    try {
      // Delete any existing session to ensure a clean state
      try {
        await this.account.deleteSession("current");
      } catch (e) {
        console.log("No existing session to delete:", e);
      }

      // Create new user
      const newAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        username
      );
      console.log("New Account:", newAccount);

      if (!newAccount)
        throw new Error("Something went wrong while creating an account");

      // Create a new session with retry logic
      let session = null;
      const maxRetries = 3;
      let retryCount = 0;

      while (!session && retryCount < maxRetries) {
        try {
          session = await this.account.createEmailPasswordSession(
            email,
            password
          );
          console.log("New session created:", session);
        } catch (e) {
          retryCount++;
          console.log(
            `Session creation attempt ${retryCount} failed:`,
            JSON.stringify(e, null, 2)
          );
          if (retryCount < maxRetries) {
            // Wait 1 second before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            throw new Error(
              e.message || "Failed to create session after retries"
            );
          }
        }
      }

      if (!session?.$id) {
        throw new Error("Invalid session response");
      }

      // Verify session is active and get user data
      try {
        const currentUser = await this.account.get();
        console.log("Session verified, current user:", currentUser);

        // Generate avatar URL
        const avatarUrl = this.avatar.getInitials(username);

        // Create user object to store
        const user = {
          id: currentUser.$id,
          username: currentUser.name,
          email: currentUser.email,
          avatar: avatarUrl,
        };

        // Store user data and session in AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("session", JSON.stringify(session));

        console.log("Account creation successful");
        return {
          user,
          session,
        };
      } catch (e) {
        console.log("Session verification failed:", JSON.stringify(e, null, 2));
        throw new Error(e.message || "Session is not properly authenticated");
      }
    } catch (error) {
      console.log("Error details:", JSON.stringify(error, null, 2));
      // Clean up AsyncStorage on error
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("session");
      if (error.code === 401) {
        throw new Error(
          "Unauthorized: Check credentials or project configuration"
        );
      } else if (error.code === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error(error.message || "Failed to create account");
    }
  };

  //   signIn = async (email, password) => {
  //     if (this.account) {
  //       console.log(this.account);
  //     }

  //     let session = null;
  //     let user = null;

  //     try {
  //       // Create email session
  //       console.log("1");
  //       try {
  //         await this.account.deleteSession("current");
  //       } catch (e) {
  //         console.log("No existing session : ", e);
  //       }
  //       session = await this.account.createEmailPasswordSession(email, password);
  //       console.log("2");
  //       if (!session?.$id) {
  //         throw new Error("Invalid session response");
  //       }

  //       // Store session immediately
  //       await AsyncStorage.setItem("session", JSON.stringify(session));

  //       // Get account info
  //       const currentAccount = await this.account.get();
  //       if (!currentAccount?.$id) {
  //         throw new Error("Failed to retrieve account information");
  //       }

  //       // Get user data
  //       const userData = await this.databases.listDocuments(
  //         conf.databaseId,
  //         conf.usersCollectionId,
  //         [Query.equal("id", currentAccount.$id)]
  //       );

  //       if (!userData?.documents?.length) {
  //         throw new Error("User data not found in database");
  //       }

  //       user = userData.documents[0];
  //       await AsyncStorage.setItem("user", JSON.stringify(user));
  //       return user;
  //     } catch (error) {
  //       // Clean up any stored data on error
  //       await AsyncStorage.removeItem("session");
  //       await AsyncStorage.removeItem("user");

  //       // Handle specific error cases
  //       if (error.message.includes("Invalid credentials")) {
  //         throw new Error("Invalid email or password");
  //       }

  //       console.error("Sign in error:", error);
  //       throw new Error(error.message || "Failed to sign in");
  //     }
  //   };
  signIn = async (email, password) => {
    try {
      // Attempt to delete existing session
      try {
        await this.account.deleteSession("current");
      } catch (e) {
        console.log("No existing session:", e);
      }

      // Create email session
      const session = await this.account.createEmailPasswordSession(
        email,
        password
      );
      if (!session?.$id) {
        throw new Error("Invalid session response");
      }

      // Store session
      await AsyncStorage.setItem("session", JSON.stringify(session));

      // Get account info
      const currentAccount = await this.account.get();
      if (!currentAccount?.$id) {
        throw new Error("Failed to retrieve account information");
      }

      // Generate avatar URL
      const avatarUrl = this.avatar.getInitials(currentAccount.name);

      // Create user object
      const user = {
        id: currentAccount.$id,
        username: currentAccount.name,
        email: currentAccount.email,
        avatar: avatarUrl,
      };

      // Store user data
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (error) {
      // Clean up AsyncStorage on error
      await AsyncStorage.removeItem("session");
      await AsyncStorage.removeItem("user");

      // Handle specific errors
      if (error.code === 401) {
        throw new Error("Invalid email or password");
      } else if (error.code === 429) {
        throw new Error("Too many requests. Please try again later.");
      }

      console.error("Sign in error:", JSON.stringify(error, null, 2));
      throw new Error(error.message || "Failed to sign in");
    }
  };

  logout = async () => {
    try {
      const result = await this.account.deleteSession("current");
      // Clear AsyncStorage
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("session");
      console.log("delete sessions: ", result);
      Alert.alert("Aora", "Successfully Logged out");
    } catch (error) {}
  };

  getCurrentUser = async () => {
    try {
      // First check AsyncStorage
      console.log("checking");

      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        console.log("1");
        return JSON.parse(storedUser);
      }

      // console.log('after checking stored user');

      // If no stored user, check Appwrite
      let currentAccount = null;
      try {
        currentAccount = await this.account.get();
        console.log("...");
        // console.log(currentAccount);
      } catch (err) {
        console.log("ERROR : ", err);
        await AsyncStorage.removeItem("session");
        return null;
      }
      console.log(currentAccount);
      // console.log("Checking current user");

      if (!currentAccount?.$id) throw new Error("Invalid account details");

      const logedInUser = await this.databases.listDocuments(
        conf.databaseId,
        conf.usersCollectionId,
        [Query.equal("id", currentAccount.$id)]
      );

      if (!logedInUser?.documents?.length)
        throw new Error("User not found in database");

      console.log(logedInUser);

      if (!logedInUser || !logedInUser.documents.length) throw Error;

      // Store user data in AsyncStorage
      console.log("1");
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(logedInUser.documents[0])
      );

      return logedInUser.documents[0];
    } catch (error) {
      // Clear AsyncStorage on error
      console.log("Error : ", error);

      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("session");
      return null;
    }
  };

  //   googleOauth2 = async () => {
  //     try {
  //       const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));

  //       if (!deepLink.hostname) {
  //         deepLink.hostname = "localhost";
  //       }

  //       const scheme = `${deepLink.protocol}//`;

  //       const loginUrl = await this.account.createOAuth2Token(
  //         "google",
  //         `${deepLink}`,
  //         `${deepLink}`
  //       );

  //       let result;
  //       try {
  //         result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme, {
  //           showInRecents: true,
  //           preferEphemeralSession: true,
  //         });
  //       } catch (browserError) {
  //         console.error("Browser session error:", browserError);
  //         throw new Error("Failed to open authentication window");
  //       } finally {
  //         await WebBrowser.coolDownAsync();
  //       }

  //       if (result.type === "success") {
  //         const url = new URL(result.url);
  //         const secret = url.searchParams.get("secret");
  //         const userId = url.searchParams.get("userId");

  //         if (!secret || !userId) {
  //           throw new Error("Failed to get authentication credentials");
  //         }

  //         await this.account.createSession(userId, secret);
  //         const userData = await this.getCurrentUser();

  //         // Store session data
  //         const session = await this.account.getSession(userId);
  //         await AsyncStorage.setItem("session", JSON.stringify(session));
  //         await AsyncStorage.setItem("user", JSON.stringify(userData));

  //         return userData;
  //       } else if (result.type === "cancel") {
  //         throw new Error("Authentication was cancelled by the user");
  //       } else {
  //         throw new Error("Authentication failed");
  //       }
  //     } catch (error) {
  //       console.error("Google OAuth Error:", error);
  //       Alert.alert(
  //         "Authentication Error",
  //         error.message || "Failed to authenticate with Google"
  //       );
  //       throw error;
  //     }
  //   };

  //   appleOauth2 = async () => {
  //     try {
  //       const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));

  //       if (!deepLink.hostname) {
  //         deepLink.hostname = "localhost";
  //       }

  //       const scheme = `${deepLink.protocol}//`;

  //       const loginUrl = await this.account.createOAuth2Token(
  //         "apple",
  //         `${deepLink}`,
  //         `${deepLink}`
  //       );

  //       const result = await WebBrowser.openAuthSessionAsync(
  //         `${loginUrl}`,
  //         scheme
  //       );

  //       if (result.type === "success") {
  //         const url = new URL(result.url);
  //         const secret = url.searchParams.get("secret");
  //         const userId = url.searchParams.get("userId");

  //         if (!secret || !userId) {
  //           throw new Error("Failed to get authentication credentials");
  //         }

  //         await this.account.createSession(userId, secret);
  //         const userData = await this.getCurrentUser();

  //         // Store session data
  //         const session = await this.account.getSession(userId);
  //         await AsyncStorage.setItem("session", JSON.stringify(session));
  //         await AsyncStorage.setItem("user", JSON.stringify(userData));

  //         return userData;
  //       } else {
  //         throw new Error("Authentication was cancelled or failed");
  //       }
  //     } catch (error) {
  //       console.error("Apple OAuth Error:", error);
  //       Alert.alert(
  //         "Authentication Error",
  //         error.message || "Failed to authenticate with Apple"
  //       );
  //       throw error;
  //     }
  //   };
  googleOauth2 = async () => {
    try {
      // Clear any existing session
      try {
        await this.account.deleteSession("current");
      } catch (e) {
        console.log("No existing session to delete:", JSON.stringify(e, null, 2));
      }

      // Reinitialize client to ensure clean state
      this.client = new Client()
        .setEndpoint(conf.endpoint)
        .setProject(conf.projectId)
        .setPlatform(conf.platform);
      this.account = new Account(this.client);
      this.avatar = new Avatars(this.client);

      // Generate redirect URI
      let deepLink;
      try {
        deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
        if (!deepLink.hostname) {
          deepLink.hostname = "localhost";
        }
      } catch (e) {
        console.log("Failed to generate deepLink:", JSON.stringify(e, null, 2));
        throw new Error("Invalid redirect URI configuration");
      }
      const scheme = `${deepLink.protocol}//`;
      console.log("OAuth DeepLink:", deepLink.toString());

      // Create OAuth token
      let loginUrl;
      try {
        loginUrl = await this.account.createOAuth2Token(
          "google",
          `${deepLink}`,
          `${deepLink}`
        );
        console.log("OAuth Login URL:", loginUrl);
      } catch (e) {
        console.log("Failed to create OAuth token:", JSON.stringify(e, null, 2));
        throw new Error("Failed to initiate OAuth flow: Check Appwrite configuration");
      }

      // Open browser for authentication
      let result;
      try {
        result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme, {
          showInRecents: true,
          preferEphemeralSession: true,
        });
        console.log("OAuth WebBrowser Result:", JSON.stringify(result, null, 2));
      } catch (browserError) {
        console.error("Browser session error:", JSON.stringify(browserError, null, 2));
        throw new Error("Failed to open authentication window");
      } finally {
        try {
          await WebBrowser.coolDownAsync();
        } catch (e) {
          console.log("WebBrowser cooldown failed:", JSON.stringify(e, null, 2));
        }
      }

      // Process OAuth callback
      if (result.type === "success") {
		console.log(result);
		
        let userId, secret, queryParams;
        try {
          const url = new URL(result.url);
          queryParams = Object.fromEntries(url.searchParams);
          userId = url.searchParams.get("userId");
          secret = url.searchParams.get("secret");
          console.log("OAuth Callback URL:", result.url);
          console.log("OAuth Callback Query Params:", JSON.stringify(queryParams, null, 2));
          console.log("OAuth Callback - User ID:", userId, "Secret:", secret);
        } catch (e) {
          console.log("Failed to parse callback URL:", JSON.stringify(e, null, 2));
          throw new Error("Invalid OAuth callback URL");
        }

        if (!userId || !secret) {
          console.log("Missing OAuth parameters:", { userId, secret, queryParams });
          throw new Error("OAuth callback missing userId or secret: Check redirect URI and OAuth configuration");
        }

        // Create session with retry logic
        let sessionCreated = false;
        const maxRetries = 3;
        let retryCount = 0;

        // Reinitialize client before session creation
        this.client = new Client()
          .setEndpoint(conf.endpoint)
          .setProject(conf.projectId)
          .setPlatform(conf.platform);
        this.account = new Account(this.client);

        while (!sessionCreated && retryCount < maxRetries) {
          try {
            await this.account.createSession(userId, secret);
            sessionCreated = true;
            console.log("OAuth session created for user:", userId);
          } catch (e) {
            retryCount++;
            console.log(`Session creation attempt ${retryCount} failed:`, JSON.stringify(e, null, 2));
            if (e.code === 401) {
              throw new Error("Unauthorized: Invalid OAuth credentials or configuration");
            }
            if (retryCount < maxRetries) {
              // Wait 1 second before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              throw new Error(e.message || "Failed to create OAuth session after retries");
            }
          }
        }

        // Verify session
        let currentUser = null;
        try {
          currentUser = await this.account.get();
          console.log("OAuth session verified, current user:", JSON.stringify(currentUser, null, 2));
        } catch (e) {
          console.log("Session verification failed:", JSON.stringify(e, null, 2));
          throw new Error(e.message || "Failed to verify OAuth session");
        }

        // Generate avatar URL
        let avatarUrl;
        try {
          avatarUrl = this.avatar.getInitials(currentUser.name || "User");
        } catch (e) {
          console.log("Failed to generate avatar:", JSON.stringify(e, null, 2));
          avatarUrl = "";
        }

        // Create user object
        const user = {
          id: currentUser.$id,
          username: currentUser.name || "User",
          email: currentUser.email || "",
          avatar: avatarUrl,
        };

        // Store session and user data
        try {
          await AsyncStorage.setItem("user", JSON.stringify(user));
          await AsyncStorage.setItem("session", JSON.stringify({ userId, secret }));
          console.log("Stored user:", JSON.stringify(user, null, 2));
        } catch (e) {
          console.log("Failed to store data in AsyncStorage:", JSON.stringify(e, null, 2));
          throw new Error("Failed to store user data");
        }

        return user;
      } else if (result.type === "cancel") {
        throw new Error("Authentication was cancelled by the user");
      } else {
        throw new Error(`Authentication failed: ${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      console.error("Google OAuth Error:", JSON.stringify(error, null, 2));
      // Clean up AsyncStorage on error
      try {
        await AsyncStorage.removeItem("session");
        await AsyncStorage.removeItem("user");
      } catch (e) {
        console.log("Failed to clear AsyncStorage:", JSON.stringify(e, null, 2));
      }
      if (error.code === 401 || error.message.includes("missing scope (account)")) {
        throw new Error("Unauthorized: Check OAuth redirect URI, Client ID, or Secret in Appwrite and Google Cloud Console");
      } else if (error.code === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
      Alert.alert(
        "Authentication Error",
        error.message || "Failed to authenticate with Google"
      );
      throw error;
    }
  };

  appleOauth2 = async () => {
    try {
      // Clear any existing session
      try {
        await this.account.deleteSession("current");
      } catch (e) {
        console.log("No existing session to delete:", JSON.stringify(e, null, 2));
      }

      // Reinitialize client to ensure clean state
      this.client = new Client()
        .setEndpoint(conf.endpoint)
        .setProject(conf.projectId)
        .setPlatform(conf.platform);
      this.account = new Account(this.client);
      this.avatar = new Avatars(this.client);

      // Generate redirect URI
      let deepLink;
      try {
        deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
        if (!deepLink.hostname) {
          deepLink.hostname = "localhost";
        }
      } catch (e) {
        console.log("Failed to generate deepLink:", JSON.stringify(e, null, 2));
        throw new Error("Invalid redirect URI configuration");
      }
      const scheme = `${deepLink.protocol}//`;
      console.log("OAuth DeepLink:", deepLink.toString());

      // Create OAuth token
      let loginUrl;
      try {
        loginUrl = await this.account.createOAuth2Token(
          "apple",
          `${deepLink}`,
          `${deepLink}`
        );
        console.log("OAuth Login URL:", loginUrl);
      } catch (e) {
        console.log("Failed to create OAuth token:", JSON.stringify(e, null, 2));
        throw new Error("Failed to initiate OAuth flow: Check Appwrite configuration");
      }

      // Open browser for authentication
      let result;
      try {
        result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme);
        console.log("OAuth WebBrowser Result:", JSON.stringify(result, null, 2));
      } catch (browserError) {
        console.error("Browser session error:", JSON.stringify(browserError, null, 2));
        throw new Error("Failed to open authentication window");
      } finally {
        try {
          await WebBrowser.coolDownAsync();
        } catch (e) {
          console.log("WebBrowser cooldown failed:", JSON.stringify(e, null, 2));
        }
      }

      // Process OAuth callback
      if (result.type === "success") {
        let userId, secret, queryParams;
		console.log(result);
		
        try {
          const url = new URL(result.url);
          queryParams = Object.fromEntries(url.searchParams);
          userId = url.searchParams.get("userId");
          secret = url.searchParams.get("secret");
          console.log("OAuth Callback URL:", result.url);
          console.log("OAuth Callback Query Params:", JSON.stringify(queryParams, null, 2));
          console.log("OAuth Callback - User ID:", userId, "Secret:", secret);
        } catch (e) {
          console.log("Failed to parse callback URL:", JSON.stringify(e, null, 2));
          throw new Error("Invalid OAuth callback URL");
        }

        if (!userId || !secret) {
          console.log("Missing OAuth parameters:", { userId, secret, queryParams });
          throw new Error("OAuth callback missing userId or secret: Check redirect URI and OAuth configuration");
        }

        // Create session with retry logic
        let sessionCreated = false;
        const maxRetries = 3;
        let retryCount = 0;

        // Reinitialize client before session creation
        this.client = new Client()
          .setEndpoint(conf.endpoint)
          .setProject(conf.projectId)
          .setPlatform(conf.platform);
        this.account = new Account(this.client);

        while (!sessionCreated && retryCount < maxRetries) {
          try {
            await this.account.createSession(userId, secret);
            sessionCreated = true;
            console.log("OAuth session created for user:", userId);
          } catch (e) {
            retryCount++;
            console.log(`Session creation attempt ${retryCount} failed:`, JSON.stringify(e, null, 2));
            if (e.code === 401) {
              throw new Error("Unauthorized: Invalid OAuth credentials or configuration");
            }
            if (retryCount < maxRetries) {
              // Wait 1 second before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              throw new Error(e.message || "Failed to create OAuth session after retries");
            }
          }
        }

        // Verify session
        let currentUser = null;
        try {
          currentUser = await this.account.get();
          console.log("OAuth session verified, current user:", JSON.stringify(currentUser, null, 2));
        } catch (e) {
          console.log("Session verification failed:", JSON.stringify(e, null, 2));
          throw new Error(e.message || "Failed to verify OAuth session");
        }

        // Generate avatar URL
        let avatarUrl;
        try {
          avatarUrl = this.avatar.getInitials(currentUser.name || "User");
        } catch (e) {
          console.log("Failed to generate avatar:", JSON.stringify(e, null, 2));
          avatarUrl = "";
        }

        // Create user object
        const user = {
          id: currentUser.$id,
          username: currentUser.name || "User",
          email: currentUser.email || "",
          avatar: avatarUrl,
        };

        // Store session and user data
        try {
          await AsyncStorage.setItem("user", JSON.stringify(user));
          await AsyncStorage.setItem("session", JSON.stringify({ userId, secret }));
          console.log("Stored user:", JSON.stringify(user, null, 2));
        } catch (e) {
          console.log("Failed to store data in AsyncStorage:", JSON.stringify(e, null, 2));
          throw new Error("Failed to store user data");
        }

        return user;
      } else {
        throw new Error(`Authentication failed: ${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      console.error("Apple OAuth Error:", JSON.stringify(error, null, 2));
      // Clean up AsyncStorage on error
      try {
        await AsyncStorage.removeItem("session");
        await AsyncStorage.removeItem("user");
      } catch (e) {
        console.log("Failed to clear AsyncStorage:", JSON.stringify(e, null, 2));
      }
      if (error.code === 401 || error.message.includes("missing scope (account)")) {
        throw new Error("Unauthorized: Check OAuth redirect URI, Client ID, or Secret in Appwrite and Apple Developer Console");
      } else if (error.code === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
      Alert.alert(
        "Authentication Error",
        error.message || "Failed to authenticate with Apple"
      );
      throw error;
    }
  };
}

const authService = new Authentication();
export default authService;
