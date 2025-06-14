import React, { useState, useEffect } from "react";
import "./LoginSignUp.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "../../../components/Pages/Config/firebaseConfig.js";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { jwtDecode } from "jwt-decode";

const LoginSignup = () => {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [signupData, setSignupData] = useState({
    userName: "",
    fullName: "",
    passWord: "",
    email: "",
    phoneNumber: "",
    dob: "",
    status:"pending"
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("https://berendersepuser.onrender.com/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const user = res.data.user;
          if (!user) {
            localStorage.removeItem("token");
            localStorage.removeItem("SEPuser");
          } else {
            localStorage.setItem("SEPuser", JSON.stringify(user));
            if (user.level === 6) {
              navigate("/Dashboardmember");
            } else if (user.status !== "approved") {
              navigate("/");
            }
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("SEPuser");
        });
    }
  }, [navigate]);

  const resetRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (clearError) {
        console.error("Lỗi khi xóa reCAPTCHA cũ:", clearError);
      }
    }
    
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA mới đã được giải:", response);
        },
      }
    );
  };
  
  const ensureRecaptchaExists = () => {
    if (!document.querySelector("#recaptcha-container div")) {
      resetRecaptcha();
    }
  };

  const handleSignupBtnClick = () => {
    setIsLoginActive(false);
  };

  const handleLoginBtnClick = () => {
    setIsLoginActive(true);
  };

  const handleSignupLinkClick = (event) => {
    event.preventDefault();
    setIsLoginActive(false);
  };

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  const formatPhoneNumber = (phoneNumber) => {
    if (phoneNumber.startsWith("0")) {
      return "+84" + phoneNumber.slice(1);
    }
    return phoneNumber;
  };

  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      password
    );

if (password.length < minLength) {
  return "Password must be at least 6 characters long.";
}
if (!hasUpperCase) {
  return "Password must contain at least one uppercase letter.";
}
if (!hasLowerCase) {
  return "Password must contain at least one lowercase letter.";
}
if (!hasNumber) {
  return "Password must contain at least one number.";
}
if (!hasSpecialChar) {
  return "Password must contain at least one special character.";
}
return null;
  };

  const handleLogin = async (event) => {
    event.preventDefault();


    try {
      const loginResponse = await axios.post(
        "https://berendersepuser.onrender.com/login", 
        { username, password },
          {
    headers: {
      "Content-Type": "application/json"
    }
  }

      );

      const { user, token } = loginResponse.data;

      if (!user || !token) {
        toast.error("Invalid response from server.");
        return;
      }

      localStorage.setItem("token", token);

      const meRes = await axios.get("https://berendersepuser.onrender.com/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const meUser = meRes.data.user;

      if (!meUser) {
        toast.error("User info not found.");
        localStorage.removeItem("token");
        return;
      }

      localStorage.setItem("SEPuser", JSON.stringify(meUser));

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

if (meUser.level === 6) {
  toast.success("Login successful (Admin)!");
  navigate("/Dashboard");
} else {
  toast.success("Login successful!");
  navigate("/");
}
    } catch (error) {
      console.error("Login failed:", error);
      console.log("Error response:", error.response); 

      toast.error(
        error.response?.data?.message || "Login failed. Please try again later."
      );
    }
  };




  

const handleSignup = async (event) => {
  event.preventDefault();

  if (signupData.phoneNumber.length !== 10) {
    toast.error("Phone number must be 10 characters.");
    return;
  }

  if (!signupData.walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(signupData.walletAddress)) {
    toast.error("Invalid wallet address format.");
    return;
  }

  const passwordError = validatePassword(signupData.passWord);
  if (passwordError) {
    toast.error(passwordError);
    return;
  }

  if (signupData.passWord !== confirmPassword) {
    toast.error("Password and confirm password do not match.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(signupData.email)) {
    toast.error("Invalid email format.");
    return;
  }

  const currentDate = new Date().toISOString();

  const dataToSend = {
    ...signupData,
    dob: currentDate,
    balance: "0",
    level: "1",
  };

  try {
    const checkResponse = await axios.get(
      `https://berendersepuser.onrender.com/users`,
                {
    headers: {
      'x-api-key': 'adminsepuser' 
    }
          }
    );

    const existingUser = checkResponse.data.find(
      (user) => user.userName === signupData.userName
    );

    if (existingUser) {
      toast.error("Username is already taken.");
      return;
    }

    const registerResponse = await axios.post(
      'https://berendersepuser.onrender.com/users',
      dataToSend,
                {
    headers: {
      'x-api-key': 'adminsepuser'
    }
          }
    );

    if (registerResponse.status === 200 || registerResponse.status === 201) {
      toast.success("Registration successful! Please wait for approval.");
    } else {
      toast.error("Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    toast.error(
      error.response?.data?.message || "An error occurred. Please try again later."
    );
  }
};



  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      toast.error("Mã OTP cần ít nhất 6 ký tự.");
      return;
    }

    try {
      await confirmationResult.confirm(otp);

      const currentDateTime = new Date().toISOString();
      const signupDataWithDob = {
        ...signupData,
        dob: currentDateTime,
      };

      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/User/register",
        signupDataWithDob
      );

      if (response.data) {
        setSignupData({
          userName: "",
          fullName: "",
          passWord: "",
          email: "",
          phoneNumber: "",
          dob: "",
        });
        setConfirmPassword("");
        setOtp("");
        setShowOtpInput(false);
        toast.success("Registration successful!");
        setIsLoginActive(true);
      } else {
        toast.error("Registration failed. Please check your information.");
      }
    } catch (error) {
      console.error("Verification and registration failed:", error);
      toast.error(
        "Invalid OTP. Please double-check."
      );
    }
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const numericValue = value.replace(/[^\d]/g, "");
      const truncatedValue = numericValue.slice(0, 10);
      setSignupData((prevData) => ({
        ...prevData,
        [name]: truncatedValue,
      }));
    } else {
      setSignupData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    
    ensureRecaptchaExists();
    const formattedPhoneNumber = formatPhoneNumber(signupData.phoneNumber);
    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier)
      .then((confirmationResult) => {
        setConfirmationResult(confirmationResult);
        toast.success("OTP Send success!");
        setResendTimer(60); 
        const timer = setInterval(() => {
          setResendTimer((prevTimer) => {
            if (prevTimer <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      })
      .catch((error) => {
        console.log( error);
        toast.error("Error");
      });
  };

 return (
  <div className="login-signUp">
    <ToastContainer />
    <div className="wrapper">
      <Link to="/" className="">
        Back home
      </Link>
      <div className="form-container">
        <div className="slide-controls">
          <input
            type="radio"
            name="slide"
            id="login"
            checked={isLoginActive}
            readOnly
          />
          <input
            type="radio"
            name="slide"
            id="signup"
            checked={!isLoginActive}
            readOnly
          />
          <label
            htmlFor="login"
            className="slide login"
            onClick={handleLoginBtnClick}
          >
            Login
          </label>
          <label
            htmlFor="signup"
            className="slide signup"
            onClick={handleSignupBtnClick}
          >
            Sign Up
          </label>
          <div className="slider-tab"></div>
        </div>
        <div
          className="form-inner"
          style={{ marginLeft: isLoginActive ? "0%" : "-100%" }}
        >
          <form
            onSubmit={handleLogin}
            className={`login ${isLoginActive ? "active" : ""}`}
          >
            <div className="field">
              <label htmlFor="username" className="text-dark">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="field">
              <label htmlFor="password" className="text-dark">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" className="text-dark">
                Remember me
              </label>
            </div>
            <div className="pass-link">
              <Link to="/forgetPassword" className="">
                Forgot password?
              </Link>
            </div>
            <div className="field btn">
              <div className="btn-layer"></div>
              <input type="submit" value="Login" />
            </div>
            <div className="signup-link">
              Don't have an account?{" "}
              <a href="" onClick={handleSignupLinkClick}>
                Sign Up
              </a>
            </div>
          </form>

          <form
            onSubmit={handleSignup}
            className={`signup ${!isLoginActive ? "active" : ""}`}
          >
            <div className="row">
              <div className="col-lg-12">
                <div className="field">
                  <label htmlFor="username" className="text-dark">
                    Username
                  </label>
                  <input
                    type="text"
                    name="userName"
                    autoComplete="username"
                    required
                    value={signupData.userName}
                    onChange={handleSignupInputChange}
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="col-lg-12">
                <div className="field">
                  <label htmlFor="fullName" className="text-dark">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    required
                    value={signupData.fullName}
                    onChange={handleSignupInputChange}
                    readOnly={showOtpInput}
                    maxLength={40}
                  />
                </div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="phoneNumber" className="text-dark">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                autoComplete="tel"
                required
                value={signupData.phoneNumber}
                onChange={handleSignupInputChange}
                readOnly={showOtpInput}
                maxLength={10}
              />
            </div>
            <div className="field">
              <label htmlFor="email" className="text-dark">
                Email
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={signupData.email}
                onChange={handleSignupInputChange}
                maxLength={40}
              />
            </div>

            <div className="field">
              <label htmlFor="walletAddress" className="text-dark">
                Wallet Address (Metamask)
              </label>
              <input
                type="text"
                name="walletAddress"
                required
                value={signupData.walletAddress || ""}
                onChange={handleSignupInputChange}
                maxLength={42} 
                placeholder="0x..."
              />
            </div>

            <div className="row">
              <div className="col-lg-5">
                <div className="field">
                  <label htmlFor="password" className="text-dark">
                    Password
                  </label>
                  <input
                    type="password"
                    name="passWord"
                    autoComplete="new-password"
                    required
                    value={signupData.passWord}
                    onChange={handleSignupInputChange}
                    readOnly={showOtpInput}
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="col-lg-7">
                <div className="field">
                  <label htmlFor="password" className="text-dark">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    readOnly={showOtpInput}
                    maxLength={20}
                  />
                </div>
              </div>
            </div>

            {showOtpInput ? (
              <div className="field">
                <label htmlFor="otp" className="text-dark">
                  Enter OTP
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
            ) : null}
            <div className="field btn">
              <div className="btn-layer"></div>
              <input
                type="submit"
                value={showOtpInput ? "Verify OTP" : "Sign Up"}
              />
            </div>
            {showOtpInput ? (
              <p className="resend-otp">
                Didn't receive the code?{" "}
                <span
                  onClick={handleResendOtp}
                  style={{
                    cursor: resendTimer > 0 ? "default" : "pointer",
                    color: resendTimer > 0 ? "gray" : "blue",
                  }}
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend"}
                </span>
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
    <div id="recaptcha-container"></div>
  </div>
);

};

export default LoginSignup;