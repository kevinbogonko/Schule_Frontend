import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../hooks/api";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    // Minimum 8 characters, at least one letter, one number and one special character
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(password);
  };

  const sanitizeInput = (input) => {
    return input.replace(/[&<>"'`=\/]/g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setError("");

    // Validate inputs
    const emailValid = email && validateEmail(email);
    const passwordValid = password && validatePassword(password);

    if (!emailValid || !passwordValid) {
      setError("Please enter valid email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);

      // Use auth context login
      await login(sanitizedEmail, sanitizedPassword);
    } catch (err) {
      setIsLoading(false);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and try again.",
      );
      console.log("Login failed", err);
    }
  };

  const getEmailError = () => {
    if (!submitAttempted) return null;
    if (!email) return "Username is required";
    if (!validateEmail(email)) return "Please enter a valid username";
    return null;
  };

  const getPasswordError = () => {
    if (!submitAttempted) return null;
    if (!password) return "Password is required";
    if (!validatePassword(password))
      return "Password must be at least 8 alphanumeric characters and symbols";
    return null;
  };

  const emailError = getEmailError();
  const passwordError = getPasswordError();

  // Handle Enter key press on form
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full"> 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10" 
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> {/* Increased from text-3xl */}
            Welcome to Escuela
          </h1>
          <p className="mt-3 text-gray-600 text-lg"> 
            Sign in to your account to continue
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="flex flex-col md:flex-row">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-50 to-blue-50 items-center justify-center p-10"
            >
              <div className="text-center max-w-md"> 
                <div className="mb-10"> 
                  <svg
                    className="w-52 h-52 mx-auto" 
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 40L120 60H140V80L160 100L140 120V140H120L100 160L80 140H60V120L40 100L60 80V60H80L100 40Z"
                      fill="url(#gradient)"
                      stroke="#059669"
                      strokeWidth="2"
                    />
                    <path
                      d="M85 95H75V105H85V115H95V105H105V95H95V85H85V95Z"
                      fill="#059669"
                    />
                    <path
                      d="M120 95H110V105H120V115H130V105H140V95H130V85H120V95Z"
                      fill="#3B82F6"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="40"
                        y1="40"
                        x2="160"
                        y2="160"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#10B981" />
                        <stop offset="1" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4"> 
                  Transform Education Together
                </h3>
                <p className="text-gray-600 text-base mb-6"> 
                  Join thousands of educators in our digital learning and management ecosystem
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-base text-gray-700"> 
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-green-600" 
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Seamless school management</span>
                  </div>
                  <div className="flex items-center text-base text-gray-700">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-blue-600" 
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Real-time learning & communication tools</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full md:w-1/2 p-10" 
            >
              <form
                className="space-y-6" 
                onSubmit={handleSubmit}
                onKeyPress={handleKeyPress}
              >
                {/* Error Alert - Always show when there's an error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4" 
                  >
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" 
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-base font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-base font-medium text-gray-700 mb-2" 
                  >
                    Username
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full px-4 py-3 text-base border ${
                        emailError ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 transition duration-200 outline-none`}
                      placeholder="username@school.sch"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400" 
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center"> 
                      <svg
                        className="w-4 h-4 mr-1" 
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-base font-medium text-gray-700 mb-2" 
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`block w-full px-4 py-3 text-base border ${ 
                        passwordError ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 transition duration-200 outline-none pr-12`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" 
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" 
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center"> 
                      <svg
                        className="w-4 h-4 mr-1" 
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-5 w-5 text-green-600 focus:ring-1 focus:ring-green-500 border-gray-300 rounded transition duration-200" /* Increased size */
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-3 block text-base text-gray-900" 
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-base"> 
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="font-medium text-green-600 hover:text-green-500 transition duration-200 focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1 rounded px-1 py-0.5"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500 transition duration-200 ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </motion.button>
                </div>

                {/* Register Link */}
                <div className="text-center pt-6">
                  <p className="text-base text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-green-600 hover:text-green-500 transition duration-200 ml-1"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;