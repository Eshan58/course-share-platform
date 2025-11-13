import { useEffect } from "react";
import { auth } from "../firebase/config";

const DebugFirebase = () => {
  useEffect(() => {
    console.log("=== FIREBASE DEBUG INFO ===");
    console.log("Firebase Auth object:", auth);
    console.log("Auth app:", auth.app);
    console.log("Current user:", auth.currentUser);
    console.log("=== END DEBUG INFO ===");
  }, []);

  return null;
};

export default DebugFirebase;
