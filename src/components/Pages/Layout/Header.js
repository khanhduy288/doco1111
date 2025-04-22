import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../Cart/CartContext.js";
import { Modal, Button } from "antd";
import "./Layout.css";
import Cart from "../Cart/Cart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faBars } from "@fortawesome/free-solid-svg-icons";

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

  const handleNavLinkClick = () => {
    const navCollapse = document.getElementById("ftco-nav");
    if (navCollapse && navCollapse.classList.contains("show")) {
      navCollapse.classList.remove("show");
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white ftco-navbar-light" id="ftco-navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img src="images/blacklogo.png" alt="Logo" style={{ height: "auto", width: "100px" }} />
          </Link>

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

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="aboutDropdown" role="button" data-bs-toggle="dropdown">VỀ CHÚNG TÔI</a>
                <ul className="dropdown-menu">
                  <li><Link to="/History" className="dropdown-item">Lịch sử hình thành</Link></li>
                  <li><Link to="/Phaply" className="dropdown-item">Cơ sở pháp lý</Link></li>
                  <li><Link to="/#" className="dropdown-item">Tầm nhìn - Sứ mệnh</Link></li>
                  <li><Link to="/#" className="dropdown-item">Đội ngũ giảng viên</Link></li>
                  <li><Link to="/#" className="dropdown-item">Văn hóa doanh nghiệp</Link></li>
                  <li><Link to="/#" className="dropdown-item">Nguyên tắc hoạt động</Link></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="courseDropdown" role="button" data-bs-toggle="dropdown">KHÓA HỌC</a>
                <ul className="dropdown-menu">
                  <li><Link to="/Menu" className="dropdown-item">An toàn học đường</Link></li>
                  <li><Link to="/courses/labor-safety" className="dropdown-item">An toàn lao động</Link></li>
                  <li><Link to="/courses/family-safety" className="dropdown-item">An toàn gia đình</Link></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="lessonDropdown" role="button" data-bs-toggle="dropdown">GIÁO ÁN</a>
                <ul className="dropdown-menu">
                  <li><Link to="/" className="dropdown-item">Giáo án Mầm Non</Link></li>
                  <li><Link to="/lessons/tieuhoc" className="dropdown-item">Giáo án Tiểu Học</Link></li>
                  <li><Link to="/lessons/thcs" className="dropdown-item">Giáo án THCS</Link></li>
                  <li><Link to="/lessons/thpt" className="dropdown-item">Giáo án THPT</Link></li>
                  <li><Link to="/authentication" className="dropdown-item">Admin</Link></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="partnerDropdown" role="button" data-bs-toggle="dropdown">ĐỐI TÁC</a>
                <ul className="dropdown-menu">
                  <li><Link to="/partners/bac" className="dropdown-item">Miền Bắc</Link></li>
                  <li><Link to="/partners/trung" className="dropdown-item">Miền Trung</Link></li>
                  <li><Link to="/partners/nam" className="dropdown-item">Miền Nam</Link></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="libraryDropdown" role="button" data-bs-toggle="dropdown">THƯ VIỆN</a>
                <ul className="dropdown-menu">
                  <li><Link to="/gallery/images" className="dropdown-item">Thư viện ảnh</Link></li>
                  <li><Link to="/gallery/videos" className="dropdown-item">Thư viện video</Link></li>
                </ul>
              </li>

              <li className="nav-item">
                <Link to="/Blog" className="nav-link">TIN TỨC</Link>
              </li>

              <li className="nav-item">
                <Link to="/contact" className="nav-link">LIÊN HỆ</Link>
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
          <Button key="reservation" type="primary" onClick={handleReservationWithCart}>
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
