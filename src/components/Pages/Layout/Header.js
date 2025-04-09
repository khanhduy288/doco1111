import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../Cart/CartContext.js";
import { Modal, Button } from "antd";
import "./Layout.css";
import Cart from "../Cart/Cart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faHome, faBars } from "@fortawesome/free-solid-svg-icons";

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

  // Hàm xử lý khi click vào liên kết trong menu
  const handleNavLinkClick = () => {
    // Lấy phần tử nav collapse
    const navCollapse = document.getElementById("ftco-nav");
    // Nếu đang mở (class "show" được thêm vào) thì thu lại menu
    if (navCollapse && navCollapse.classList.contains("show")) {
      navCollapse.classList.remove("show");
    }
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
            data-bs-toggle="collapse"
            data-bs-target="#ftco-nav"
            aria-controls="ftco-nav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <FontAwesomeIcon icon={faBars} style={{ color: "orange", fontSize: "24px" }} />
          </button>

          <div className="collapse navbar-collapse" id="ftco-nav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item active">
                <Link to="/" className="nav-link" onClick={handleNavLinkClick}>
                  <FontAwesomeIcon icon={faHouse} size="2x" />
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={handleNavLinkClick}>
                  GIỚI THIỆU
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Menu" className="nav-link" onClick={handleNavLinkClick}>
                  KHÓA HỌC
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Blog" className="nav-link" onClick={handleNavLinkClick}>
                  TIN TỨC
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={handleNavLinkClick}>
                  LIÊN HỆ
                </Link>
              </li>
              <li className="nav-item">
                {userName ? (
                  <Link to="/customer/profile" className="nav-link" onClick={handleNavLinkClick}>
                    Xin chào, {userName}
                  </Link>
                ) : (
                  <Link to="https://lms.viengiaoducantoan.edu.vn/login/canvas" className="nav-link" onClick={handleNavLinkClick}>
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
