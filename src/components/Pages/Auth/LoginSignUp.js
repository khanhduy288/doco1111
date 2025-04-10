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
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved:", response);
          },
        }
      );
    }
  }, []);

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
  
  // Hàm đảm bảo reCAPTCHA tồn tại
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
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (!hasUpperCase) {
      return "Mật khẩu phải chứa ít nhất 1 chữ in hoa.";
    }
    if (!hasLowerCase) {
      return "Mật khẩu phải chứa ít nhất 1 chữ in thường.";
    }
    if (!hasNumber) {
      return "Mật khẩu phải chứa ít nhất 1 số.";
    }
    if (!hasSpecialChar) {
      return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.";
    }
    return null;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
  
    if (!username) {
      toast.error("Tên đăng nhập không được để trống.");
      return;
    }
  
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
  
    try {
      const response = await axios.get(
        "https://6437c88f0c58d3b14579192a.mockapi.io/api/tour/login"
      );
  
      const users = response.data;
  
      // Tìm người dùng phù hợp
      const user = users.find(
        (u) =>
          (u.userName === username || u.username === username) &&
          u.password === password
      );
  
      if (user) {
        // Giả lập lưu token và user (vì API không có token thật)
        localStorage.setItem("SEPuser", JSON.stringify(user));
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username);
        } else {
          localStorage.removeItem("rememberedUsername");
        }
  
        toast.success("Đăng nhập thành công!");
        navigate("/dashboard");
      } else {
        toast.error("Tên đăng nhập hoặc mật khẩu không đúng.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Lỗi khi đăng nhập. Vui lòng thử lại sau.");
    }
  };
  

  const handleSignup = async (event) => {
    event.preventDefault();

    if (signupData.phoneNumber.length !== 10) {
      toast.error("Số điện thoại phải có 10 ký tự.");
      return;
    }

    const passwordError = validatePassword(signupData.passWord);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (signupData.passWord !== confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      toast.error("Định dạng email không hợp lệ.");
      return;
    }

    try {
      // Kiểm tra sự tồn tại của username và email
      const checkResponse = await axios.get(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/User/check-user-exists?userName=${signupData.userName}&email=${signupData.email}`
      );

      if (checkResponse.data.success) {
        // Username và email khả dụng, tiếp tục với quá trình gửi OTP
        const formattedPhoneNumber = formatPhoneNumber(signupData.phoneNumber);

        ensureRecaptchaExists();

        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "invisible",
              callback: (response) => {
                console.log("reCAPTCHA solved:", response);
              },
            }
          );
        }

        const appVerifier = window.recaptchaVerifier;
        try {
          const confirmationResult = await signInWithPhoneNumber(
            auth,
            formattedPhoneNumber,
            appVerifier
          );
          setConfirmationResult(confirmationResult);
          setShowOtpInput(true);
          toast.success("Mã OTP đã được gửi thành công!");
        } catch (error) {
          console.error("Lỗi khi gửi mã OTP:", error);
          toast.error("Lỗi khi gửi mã OTP. Vui lòng thử lại.");
          resetRecaptcha();
        }
      } else {
        toast.error("Tên đăng nhập hoặc email đã được sử dụng.");
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra thông tin đăng ký:", error);
      if (error.response && error.response.data) {
        toast.error(
          error.response.data.message ||
            "Có lỗi xảy ra khi kiểm tra thông tin đăng ký."
        );
      } else {
        toast.error("Không thể kết nối đến server. Vui lòng thử lại sau.");
      }
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
        toast.success("Đăng ký thành công!");
        setIsLoginActive(true);
      } else {
        toast.error("Đăng ký thất bại. Hãy kiểm tra lại thông tin.");
      }
    } catch (error) {
      console.error("Xác thực và đăng ký thất bại:", error);
      toast.error(
        "Mã OTP không khả dụng. Hãy kiểm tra lại."
      );
    }
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      // Chỉ cho phép nhập số
      const numericValue = value.replace(/[^\d]/g, "");
      // Giới hạn độ dài là 10 số
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
        toast.success("Mã OTP mới đã được gửi thành công!");
        setResendTimer(60); // Đặt thời gian chờ 60 giây
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
        console.log("Lỗi khi gửi lại mã OTP:", error);
        toast.error("Lỗi khi gửi lại mã. Hãy thử lại sau.");
      });
  };

  return (
    <div className="login-signUp">
      <ToastContainer />
      <div className="wrapper">
        <Link to="/" className="">
          Trở về trang chủ
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
              Đăng Nhập
            </label>
            <label
              htmlFor="signup"
              className="slide signup"
              onClick={handleSignupBtnClick}
            >
              Đăng Ký
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
                  Tên đăng nhập
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
                  Mật khẩu
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
                  {" "}
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <div className="pass-link">
                <Link to="/forgetPassword" className="">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="field btn">
                <div className="btn-layer"></div>
                <input type="submit" value="Đăng Nhập" />
              </div>
              <div className="signup-link">
                Chưa có tài khoản?{" "}
                <a href="" onClick={handleSignupLinkClick}>
                  Đăng Ký
                </a>
              </div>
            </form>
            <form
              onSubmit={showOtpInput ? handleVerifyOtp : handleSignup}
              className={`signup ${!isLoginActive ? "active" : ""}`}
            >
              <div className="row">
                <div className="col-lg-12">
                  <div className="field">
                    <label htmlFor="username" className="text-dark">
                      Tên đăng nhập
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
                      Họ và tên
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
                  Số điện thoại
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
              <div className="row">
                <div className="col-lg-5">
                  <div className="field">
                    <label htmlFor="password" className="text-dark">
                      Mật khẩu
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
                      Nhập lại mật khẩu
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
                  <label htmlFor="username" className="text-dark">
                    Nhập mã OTP
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
                  value={showOtpInput ? "Xác thực OTP" : "Đăng ký"}
                />
              </div>
              {showOtpInput ? (
                <p className="resend-otp">
                  Không nhận được mã?{" "}
                  <span
                    onClick={handleResendOtp}
                    style={{
                      cursor: resendTimer > 0 ? "default" : "pointer",
                      color: resendTimer > 0 ? "gray" : "blue",
                    }}
                  >
                    {resendTimer > 0
                      ? `Gửi lại sau ${resendTimer}s`
                      : "Gửi lại"}
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
