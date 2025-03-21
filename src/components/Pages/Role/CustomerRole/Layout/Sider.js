import React, { useState } from "react";
import { Layout, Menu, Modal } from "antd";
import {
  UserOutlined,
  TableOutlined,
  LockOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import styled from 'styled-components';
const { Sider } = Layout;

const RoundedSider = styled(Sider)`
  border-radius: 16px !important;
  overflow: hidden;

  .ant-layout-sider-children {
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .ant-menu {
    border-radius: 16px;
  }

  .ant-menu-item:first-child {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }

  .ant-menu-item:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;

const SiderComponent = () => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

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
    navigate("/authentication");
  };

  return (
    <RoundedSider width={300} theme="light" className="d-flex justify-content-center align-items-center">
      <h5 style={{ padding: "10px", marginBottom: 0, fontWeight:"bold" }}>Tài khoản cá nhân</h5>
      <Menu mode="vertical">
        <Menu.Item key="profile" icon={<UserOutlined />}>
          <Link to="/customer/profile">Thông tin tài khoản</Link>
        </Menu.Item>
        <Menu.Item key="bookedtable" icon={<TableOutlined />}>
          <Link to="/customer/bookedtable">Danh sách đặt bàn</Link>
        </Menu.Item>
        <Menu.Item key="changepassword" icon={<LockOutlined />}>
          <Link to="/customer/changepassword">Đổi mật khẩu</Link>
        </Menu.Item>
        <Menu.Item
          key="logout"
          icon={<LogoutOutlined />}
          onClick={showModal}
          danger
        >
          Đăng xuất
        </Menu.Item>
      </Menu>
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
    </RoundedSider>
  );
};

export default SiderComponent;
