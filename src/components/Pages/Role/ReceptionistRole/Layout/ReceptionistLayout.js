import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./ReceptionistLayout.css";
import { Modal } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faUser,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

const ReceptionistLayout = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 770);
      if (window.innerWidth < 770) {
        setIsNavOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const showModal = () => {
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("SEPtoken");
    localStorage.removeItem("SEPuser");
    setModalOpen(false);
    window.location.reload();
    navigate("/authentication");
  };

  const toggleNav = () => {
    if (!isSmallScreen) {
      setIsNavOpen(!isNavOpen);
    }
  };
  return (
    <>
      <header>
        <div className="logosec">
          <div className="logo">Receptionist</div>
          <img
            src="https://media.geeksforgeeks.org/wp-content/uploads/20221210182541/Untitled-design-(30).png"
            className="icn menuicn"
            onClick={toggleNav}
            id="menuicn"
            alt="menu-icon"
          />
        </div>
        <div className="message">
          <div className="circle" />
          <img
            src="https://media.geeksforgeeks.org/wp-content/uploads/20221210183322/8.png"
            className="icn"
            alt=""
          />
          <div className="dp">
            <img
              src="https://media.geeksforgeeks.org/wp-content/uploads/20221210180014/profile-removebg-preview.png"
              className="dpicn"
              alt="dp"
            />
          </div>
        </div>
      </header>

      <div className="main-container">
        <div
          className={`navcontainer ${
            isNavOpen && !isSmallScreen ? "" : "navclose"
          }`}
        >
          <nav className="nav">
            <div className="nav-upper-options">
              <Link to="/receptionist" className="menu-link">
                <div className="option2 nav-option">
                  <FontAwesomeIcon icon={faClipboardList} size="2xl" />
                  <h6> Đơn đặt bàn</h6>
                </div>
              </Link>
              <Link to="/receptionist/profile" className="menu-link">
                <div className="nav-option option5">
                  <FontAwesomeIcon icon={faUser} size="2xl" />
                  <h6>Hồ sơ</h6>
                </div>
              </Link>
              <div
                className="nav-option logout"
                key="logout"
                icon={<LogoutOutlined />}
                onClick={showModal}
              >
                <FontAwesomeIcon icon={faRightFromBracket} size="2xl" />
                <h6>Đăng xuất</h6>
              </div>
              <Modal
                title="Xác nhận đăng xuất"
                open={isModalOpen}
                onOk={handleLogout}
                onCancel={handleCancel}
                okText="Đăng xuất"
                cancelText="Hủy"
              >
                <p>Bạn có chắc chắn muốn đăng xuất?</p>
              </Modal>
            </div>
          </nav>
        </div>
        <div className="main">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default ReceptionistLayout;
