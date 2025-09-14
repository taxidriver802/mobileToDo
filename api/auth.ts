import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from 'expo-local-authentication';


export const API_URL = "http://10.0.0.181:3001/api";

export async function register(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    // Handle specific error cases
    if (res.status === 409) {
      throw new Error("Username already exists. Please choose a different one.");
    } else if (res.status === 400) {
      throw new Error(data.error || "Invalid username or password format.");
    } else {
      throw new Error(data.error || "Failed to register. Please try again.");
    }
  }
  
  // Optional: Auto-login after registration by storing token
  // Remove this if you prefer users to login manually after registration
  if (data.token) {
    await AsyncStorage.setItem("token", data.token);
  }
  
  return data;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    // Handle specific error cases
    if (res.status === 401) {
      throw new Error("Invalid username or password.");
    } else if (res.status === 404) {
      throw new Error("User not found. Please check your username.");
    } else {
      throw new Error(data.error || "Failed to login. Please try again.");
    }
  }

  await AsyncStorage.setItem("token", data.token); // Save token
  return data;
}

// Helper function to check if user is logged in
export async function isLoggedIn(): Promise<boolean> {
  try {
    const token = await AsyncStorage.getItem("token");
    return token !== null;
  } catch (error) {
    return false;
  }
}

// Helper function to logout
export async function logout(): Promise<void> {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.error("Error during logout:", error);
  }
}

// Helper function to get stored token
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    return null;
  }
}

// Biometrics authentication
export async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in with biometrics',
      fallbackLabel: 'Use password',
    });
    return result.success;
  }
  return false;
}
