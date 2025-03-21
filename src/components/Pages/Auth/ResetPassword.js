import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import queryString from "query-string";
import "./LoginSignUp.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { token, email, userId } = queryString.parse(location.search);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const decodedToken = decodeURIComponent(token);

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    console.log("Token:", decodedToken);

    try {
      const response = await fetch(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/User/renew-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json-patch+json",
          },
          body: JSON.stringify({
            passWord: newPassword,
            tokenRenew: decodedToken,
          }),
        }
      );
      console.log("New Password:", newPassword);
      console.log("Token Renew:", decodedToken);

      if (response.ok) {
        const result = await response.text();
        if (result.trim().toLowerCase() === "true") {
          toast.success("Đổi mật khẩu thành công");
          setTimeout(() => {
            nav("/authentication");
          }, 2000);
        } else {
          toast.error("Có lỗi xảy ra, vui lòng thử lại");
        }
      } else {
        const errorText = await response.text();
        toast.error(errorText || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <>
      <div className="forget-password">
        <div className="wrapper">
          <ToastContainer
            style={{
              top: "80px",
              right: "20px",
            }}
            position="top-right"
            autoClose={1500}
          />
          <Link to="/authentication" className="">
            Quay lại đăng nhập
          </Link>
          <div className="title-text"></div>
          <div className="form-container">
            <h4 style={{ textAlign: "center" }}>Đổi mật khẩu</h4>
            <div className="form-inner">
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="password" className="text-dark">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="confirm-password" className="text-dark">
                    Nhập lại mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="field btn">
                  <div className="btn-layer"></div>
                  <input type="submit" value="Gửi" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
