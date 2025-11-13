import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { registerSchema } from "../../schemas/authSchema";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName, data.photoURL);
      toast.success("Account created successfully! Welcome! 🎉");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);

      // Better error messages
      if (error.code === "auth/email-already-in-use") {
        toast.error(
          "This email is already registered. Please use a different email or sign in."
        );
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please choose a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address. Please check your email format.");
      } else {
        toast.error(
          error.message || "Failed to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Account created with Google successfully! 🎉");
      navigate("/");
    } catch (error) {
      console.error("Google registration error:", error);

      // Better Google error handling
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        toast.error(
          "Popup was blocked by your browser. Please allow popups for this site."
        );
      } else if (error.code === "auth/unauthorized-domain") {
        toast.error("This domain is not authorized for Google sign-in.");
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        toast.error(
          "An account already exists with the same email but different sign-in method."
        );
      } else {
        toast.error(error.message || "Failed to sign up with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-base-content">
                Create Account
              </h2>
              <p className="text-base-content/70 mt-2">
                Join us and start learning today
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Display Name Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Full Name</span>
                </label>
                <input
                  {...register("displayName")}
                  type="text"
                  placeholder="Enter your full name"
                  className={`input input-bordered w-full ${
                    errors.displayName ? "input-error" : ""
                  }`}
                  disabled={loading}
                />
                {errors.displayName && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.displayName.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Email Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Email Address
                  </span>
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter your email"
                  className={`input input-bordered w-full ${
                    errors.email ? "input-error" : ""
                  }`}
                  disabled={loading}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.email.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Profile Photo URL (Optional) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Profile Photo URL (Optional)
                  </span>
                </label>
                <input
                  {...register("photoURL")}
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/70">
                    Leave empty to use default avatar
                  </span>
                </label>
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Password</span>
                </label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Create a password"
                  className={`input input-bordered w-full ${
                    errors.password ? "input-error" : ""
                  }`}
                  disabled={loading}
                />
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.password.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Confirm Password
                  </span>
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Confirm your password"
                  className={`input input-bordered w-full ${
                    errors.confirmPassword ? "input-error" : ""
                  }`}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.confirmPassword.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="bg-base-300 p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-2 text-base-content">
                    Password Strength:
                  </p>
                  <div className="flex space-x-1 mb-2">
                    <div
                      className={`h-2 flex-1 rounded ${
                        password.length >= 6 ? "bg-success" : "bg-base-300"
                      }`}
                    ></div>
                    <div
                      className={`h-2 flex-1 rounded ${
                        /[A-Z]/.test(password) && /[a-z]/.test(password)
                          ? "bg-success"
                          : "bg-base-300"
                      }`}
                    ></div>
                    <div
                      className={`h-2 flex-1 rounded ${
                        /\d/.test(password) ? "bg-success" : "bg-base-300"
                      }`}
                    ></div>
                  </div>
                  <ul className="text-xs space-y-1">
                    <li
                      className={
                        password.length >= 6
                          ? "text-success"
                          : "text-base-content/70"
                      }
                    >
                      {password.length >= 6 ? "✓" : "○"} At least 6 characters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(password) && /[a-z]/.test(password)
                          ? "text-success"
                          : "text-base-content/70"
                      }
                    >
                      {/[A-Z]/.test(password) && /[a-z]/.test(password)
                        ? "✓"
                        : "○"}{" "}
                      Upper & lowercase letters
                    </li>
                    <li
                      className={
                        /\d/.test(password)
                          ? "text-success"
                          : "text-base-content/70"
                      }
                    >
                      {/\d/.test(password) ? "✓" : "○"} At least one number
                    </li>
                  </ul>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-6 gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider my-6">OR</div>

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="btn btn-outline btn-primary w-full gap-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {loading ? "Signing up..." : "Sign up with Google"}
            </button>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-base-content/70">
                Already have an account?{" "}
                <Link to="/login" className="link link-primary font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
