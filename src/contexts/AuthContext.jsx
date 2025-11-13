import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
import { userAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Sync Firebase user with backend
  const syncUserWithBackend = async (firebaseUser) => {
    if (!firebaseUser) {
      localStorage.removeItem("token");
      return null;
    }

    try {
      const token = await firebaseUser.getIdToken();
      localStorage.setItem("token", token);

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
      };

      try {
        await userAPI.syncUser(userData);
        // console.log("Synced user with backend");
      } catch (error) {
        // console.warn(" Backend sync failed (non-critical):", error.message);
      }

      return userData;
    } catch (error) {
      // console.error("Sync error:", error);
      return null;
    }
  };

  // 🔹 Register user
  const signUp = async (email, password, userData = {}) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update displayName/photo in Firebase
      if (userData.displayName || userData.photoURL) {
        await updateProfile(result.user, {
          displayName: userData.displayName || "",
          photoURL: userData.photoURL || "",
        });
      }

      await syncUserWithBackend(result.user);

      const newUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };
      setUser(newUser);

      toast.success("Account created successfully! 🎉");
      return result.user;
    } catch (error) {
      // console.error("Sign-up error:", error);
      toast.error(error.message || "Failed to create account.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Sign in with email/password
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await syncUserWithBackend(result.user);

      const loggedUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };
      setUser(loggedUser);

      toast.success("Welcome back! ");
      return result.user;
    } catch (error) {
      toast.error(error.message || "Failed to sign in.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google sign-in
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserWithBackend(result.user);

      const googleUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };
      setUser(googleUser);

      toast.success("Signed in with Google! 🎉");
      return result.user;
    } catch (error) {
      // console.error("Google sign-in error:", error);
      toast.error(error.message || "Failed to sign in with Google.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("token");
      toast.success("Logged out successfully! ");
    } catch (error) {
      // console.error("Logout error:", error);
      toast.error("Failed to log out.");
    }
  };

  // 🔹 Refresh token (useful for token expiration)
  const refreshToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        localStorage.setItem("token", token);
        return token;
      }
      return null;
    } catch (error) {
      // console.error("Token refresh error:", error);
      return null;
    }
  };

  // 🔹 Update user profile
  const updateUserProfile = async (updates) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, updates);

        // Update local state
        setUser((prev) => ({
          ...prev,
          ...updates,
        }));

        // Sync with backend
        await syncUserWithBackend(currentUser);
        toast.success("Profile updated successfully! ");
      }
    } catch (error) {
      // console.error
      toast.error("Failed to update profile.");
      throw error;
    }
  };

  // 🔹 Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await syncUserWithBackend(firebaseUser);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        // console.error
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Auto token refresh
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshToken();
      }, 45 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    user,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    refreshToken,
    updateUserProfile,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
