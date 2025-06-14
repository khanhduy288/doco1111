import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginSignUp.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/User/forgot?email=${email}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      const data = await response.json();

      if (data.isSuccessed) {
        toast.success(
          "Suggest, check gmail!"
        );
      } else {
        toast.error(data.message || "Error");
      }
    } catch (error) {
      toast.error("Error");
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
            autoClose={2500}
          />
          <Link to="/authentication" className="">
            Login
          </Link>
          <div className="title-text"></div>
          <div className="form-container">
            <h4 style={{ textAlign: "center" }}>ForgetPassword</h4>
            <div className="form-inner">
              <form onSubmit={handleSubmit} className="">
                <div className="field">
                  <label htmlFor="email" className="text-dark">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={40}
                  />
                </div>
                <div className="field btn">
                  <div className="btn-layer"></div>
                  <input type="submit" value="Gửi" />
                </div>
              </form>
              {message && <p className="message">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
