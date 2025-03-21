import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../Cart/CartContext.js";
import { Modal, Button } from "antd";
import "./Layout.css";
import Cart from "../Cart/Cart.js";

const Header = () => {
  const { cart, getTotalItems } = useContext(CartContext);
  const totalItems = getTotalItems();
  const navigate = useNavigate();

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("SEPuser"));
    if (user) {
      setUserName(user.userName);
    }
  }, []);

  const openCartModal = () => {
    setIsCartModalOpen(true);
  };

  const closeCartModal = () => {
    setIsCartModalOpen(false);
  };

  const handleReservationWithCart = () => {
    closeCartModal();
    navigate("/reservation", { state: { cart, showCart: true } });
  };

  return (
    <>
      
      <nav
  className="navbar navbar-expand-lg navbar-light bg-white ftco-navbar-light"
  id="ftco-navbar"
>
  <div className="container">
    <Link to="/" className="navbar-brand">
      <img
        src="images/blacklogo.png"
        alt="Logo"
        style={{
          height: "auto",
          width: "100px",
        }}
      />
    </Link>

    {/* Nút Menu - Đã sửa */}
    <button
  className="navbar-toggler"
  type="button"
  data-bs-toggle="collapse"  /* Thay data-toggle thành data-bs-toggle */
  data-bs-target="#ftco-nav"
  aria-controls="ftco-nav"
  aria-expanded="false"
  aria-label="Toggle navigation"
>
  <i className="fa-solid fa-bars"></i> {/* Icon 3 gạch */}
</button>

    <div className="collapse navbar-collapse" id="ftco-nav">
      <ul className="navbar-nav ml-auto">
        <li className="nav-item active">
          <Link to="/" className="nav-link">
            <i className="fa-solid fa-house fa-2x"></i>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/" className="nav-link">
            GIỚI THIỆU
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/" className="nav-link">
            KHÓA HỌC
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/" className="nav-link">
            TIN TỨC
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/" className="nav-link">
            LIÊN HỆ
          </Link>
        </li>
        <li className="nav-item">
          {userName ? (
            <Link to="/customer/profile" className="nav-link">
              Xin chào, {userName}
            </Link>
          ) : (
            <Link to="/authentication" className="nav-link">
              GIÁO ÁN
            </Link>
          )}
        </li>
      </ul>
    </div>
  </div>
</nav>
      <Modal
        title="GIỎ HÀNG"
        visible={isCartModalOpen}
        onCancel={closeCartModal}
        footer={[
          <Button
            key="reservation"
            type="primary"
            onClick={handleReservationWithCart}
          >
            Đặt bàn với thực đơn này
          </Button>,
        ]}
        width={700}
      >
        <Cart />
      </Modal>
    </>
  );
};

export default Header;