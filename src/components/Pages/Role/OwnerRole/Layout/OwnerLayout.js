import React, { useState } from "react";
import "./OwnerLayout.css";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquarePollVertical,
  faRightFromBracket,
  faUser,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

const OwnerLayout = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

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
    setIsNavOpen(!isNavOpen);
  };
  return (
    <>
      <header>
        <div className="logosec">
          <div className="logo">Owner</div>
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
        <div className={`navcontainer ${isNavOpen ? "" : "navclose"}`}>
          <nav className="nav">
            <div className="nav-upper-options">
              <Link to="/owner" className="menu-link">
                <div className="nav-option ">
                  <FontAwesomeIcon icon={faSquarePollVertical} size="2xl" />
                  <h6> Thống kê nhà hàng</h6>
                </div>
              </Link>
              <Link to="/owner/tableReservation" className="menu-link">
                <div className="nav-option option4">
                  <FontAwesomeIcon icon={faClipboardList} size="2xl" />
                  <h6>Danh sách đơn đặt bàn</h6>
                </div>
              </Link>
              <Link to="/owner/profile" className="menu-link">
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

export default OwnerLayout;
