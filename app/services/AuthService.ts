import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Linking, Platform } from "react-native";

// For web environments
WebBrowser.maybeCompleteAuthSession();

// NOTE: You need to create these in Google Cloud Console
// https://console.cloud.google.com/
const GOOGLE_CLIENT_ID_ANDROID = "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com";
const GOOGLE_CLIENT_ID_IOS = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";
const GOOGLE_CLIENT_ID_WEB = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";

// The redirect URI for your app
const REDIRECT_URI = makeRedirectUri({
  scheme: "wally",
});

/**
 * Custom hook for Google authentication (simplified)
 */
export const useGoogleAuth = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the appropriate client ID based on platform
  const getClientId = () => {
    if (Platform.OS === "ios") return GOOGLE_CLIENT_ID_IOS;
    if (Platform.OS === "android") return GOOGLE_CLIENT_ID_ANDROID;
    return GOOGLE_CLIENT_ID_WEB;
  };

  // Handle deep links for auth response
  useEffect(() => {
    // Setup URL listener
    const handleRedirect = async (event: { url: string }) => {
      if (event.url.includes("auth/google")) {
        try {
          setLoading(true);
          // Extract token from URL
          const token = event.url.split("token=")[1];
          if (!token) {
            throw new Error("No token found in redirect");
          }

          // Fetch user profile with token
          const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user profile");
          }

          const userData = await response.json();
          setUserInfo(userData);
        } catch (err: any) {
          setError(err.message || "Authentication error");
          console.error("Google auth error:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    // Add event listener for URLs
    Linking.addEventListener("url", handleRedirect);

    // Initial check for pending auth response
    Linking.getInitialURL().then((url) => {
      if (url) handleRedirect({ url });
    });

    return () => {
      // No need to remove listener in newer versions of React Native
      // Linking.removeEventListener("url", handleRedirect);
    };
  }, []);

  // Mock Google sign-in for demonstration
  // In a real app, you would build a proper Google auth flow
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      // For demonstration only - this simulates a successful Google login
      // In a real app, you would implement actual Google authentication
      setTimeout(() => {
        const mockUserData = {
          sub: "123456789",
          name: "John Doe",
          given_name: "John",
          family_name: "Doe",
          picture: "https://ui-avatars.com/api/?name=John+Doe",
          email: "john.doe@example.com",
          email_verified: true,
        };
        setUserInfo(mockUserData);
        setLoading(false);
      }, 1500);

      // Actual implementation would look like this:
      // const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      //   `client_id=${getClientId()}` +
      //   `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      //   `&response_type=token` +
      //   `&scope=${encodeURIComponent('profile email')}`;
      //
      // await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);
    } catch (err: any) {
      setError(err.message || "Failed to start authentication");
      setLoading(false);
    }
  };

  // Sign out user
  const signOut = () => {
    setUserInfo(null);
  };

  return {
    userInfo,
    loading,
    error,
    signInWithGoogle,
    signOut,
    isSignedIn: !!userInfo,
  };
};

// Helper function to extract user profile from Google response
export const extractGoogleUserProfile = (userInfo: any) => {
  if (!userInfo) return null;

  return {
    id: userInfo.sub,
    email: userInfo.email,
    fullName: userInfo.name,
    firstName: userInfo.given_name,
    lastName: userInfo.family_name,
    avatar: userInfo.picture,
    emailVerified: userInfo.email_verified,
  };
};
