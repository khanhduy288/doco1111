import React, { useState } from "react";
import "../Layout/ManagerLayout.css";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquarePollVertical,
  faPeopleGroup,
  faRightFromBracket,
  faUser,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

const SideBar = ({ isNavOpen, toggleNav }) => {
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

  return (
    <div className={`navcontainer ${isNavOpen ? "" : "navclose"}`}>
      <nav className="nav">
        <div className="nav-upper-options">
          <Link to="/manager" className="menu-link">
            <div className="nav-option option 1">
              <FontAwesomeIcon icon={faSquarePollVertical} size="2xl" />
              <h6>Thống kê cơ sở</h6>
            </div>
          </Link>
          <Link to="/manager/staff" className="menu-link">
            <div className="option2 nav-option">
              <FontAwesomeIcon icon={faPeopleGroup} size="2xl" />
              <h6>Danh sách nhân viên</h6>
            </div>
          </Link>
          <Link to="/manager/tableReservation" className="menu-link">
            <div className="nav-option option4">
              <FontAwesomeIcon icon={faClipboardList} size="2xl" />
              <h6>Danh sách đơn đặt bàn</h6>
            </div>
          </Link>
          <Link to="/manager/profile" className="menu-link">
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
  );
};

export default SideBar;
