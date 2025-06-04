import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../Cart/CartContext.js";
import { Modal, Button, Badge, notification } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import "./Layout.css";
import Cart from "../Cart/Cart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faBars, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FaUser } from "react-icons/fa";
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />


const Header = () => {
  const { cart, getTotalItems } = useContext(CartContext);
  const totalItems = getTotalItems();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("SEPuser"));
    if (user) {
      setUserName(user.userName);
    }
  }, []);

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("SEPuser"));
  if (user) {
    setUserName(user.userName); // vẫn giữ nếu bạn cần
    const userId = user.id; // hoặc đúng trường userId trong SEPuser

    // Giả sử API url như sau (bạn thay URL thật)
    fetch(`https://65682fed9927836bd9743814.mockapi.io/api/singup/signup/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserInfo({
          level:data.level,
          name: data.fullName,
          balance: data.balance,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch user info:", error);
      });
  }
}, []);


  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);

  const handleReservationWithCart = () => {
    closeCartModal();
    navigate("/checkout", { state: { cart, showCart: true } });
  };

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        notification.success({
          message: "Wallet Connected",
          description: `Connected to ${truncateAddress(accounts[0])}`,
        });
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      window.open("https://metamask.io/download.html", "_blank");
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    notification.info({
      message: "Wallet Disconnected",
      description: "You have disconnected your wallet.",
    });
  };

  const truncateAddress = (address) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  return (
    <>
<nav
  className="navbar navbar-expand-lg navbar-light"
  id="ftco-navbar"
  style={{
    backgroundColor: "#1e1e1e",
    width: "100%",
    padding: "10px 20px",
    fontSize: "19px"
  }}
>
  <style>{`
    /* Container mặc định desktop */
    #ftco-navbar > div {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      width: 100%;
      flex-wrap: wrap;
      position: relative;

    }

    /* Logo căn trái */
    #ftco-navbar .navbar-brand {
      margin-right: 20px;
    }

    /* Nút toggle ở góc phải */
    #ftco-navbar .navbar-toggler {
      position: absolute !important;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
    }

    /* Menu nav mặc định căn phải */
    #ftco-navbar .navbar-collapse {
      display: flex !important;
      align-items: center !important;
      flex-grow: 1;
      flex-wrap: wrap;
      margin-left: auto;
    }

    #ftco-navbar .navbar-nav {
      display: flex !important;
      align-items: center !important;
      list-style: none;
      padding-left: 0;
      margin-bottom: 0;
      gap: 20px;
    }

    /* ===== Mobile (dưới 768px) ===== */
    @media (max-width: 768px) {
      #ftco-navbar > div {
        justify-content: center !important; /* căn giữa container (logo + nút) */
        position: relative;
      }

      #ftco-navbar .navbar-brand {
        margin: 0;
      }

      #ftco-navbar .navbar-toggler {
        position: absolute !important;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1050; /* trên menu */
      }

      /* Khi menu đóng thì ẩn menu nav */
      #ftco-navbar .navbar-collapse {
        display: none !important;
        position: static;
        width: 100%;
        background: none;
      }

      /* Khi menu mở (bootstrap thêm class show) thì hiện menu full width dọc */
      #ftco-navbar .navbar-collapse.show {
        display: block !important;
        position: absolute;
        top: 56px;
        right: 0;
        left: 0;
        background-color: #1e1e1e;
        border-radius: 0 0 8px 8px;
        padding: 10px 20px;
        z-index: 1040;
      }

      /* Menu nav dọc căn trái */
      #ftco-navbar .navbar-nav {
        flex-direction: column !important;
        gap: 10px !important;
        margin: 0;
      }

      #ftco-navbar .nav-item {
        width: 100%;
      }

      #ftco-navbar .nav-link {
        text-align: left !important;
        font-size: 16px !important;
        color: #ccc !important;
      }
    }
  `}</style>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%",
      flexWrap: "wrap",
      position: "relative",
      
    }}
  >
    <Link to="/" className="navbar-brand" style={{ marginRight: "20px" }}>
      <img
        src="/images/boatfun.png"
        alt="Logo"
        style={{ height: "auto", width: "110px", borderRadius: "20%" }}
      />
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

    <div
      className="collapse navbar-collapse"
      id="ftco-nav"
      style={{
        display: "flex",
        alignItems: "center",
        flexGrow: 1,
        flexWrap: "wrap",
        marginLeft: "auto"
      }}
    >
      <ul
        className="navbar-nav"
        style={{
          display: "flex",
          alignItems: "center",
          listStyle: "none",
          paddingLeft: 0,
          marginBottom: 0,
          gap: "20px"
        }}
      >
        <li className="nav-item">
          <Link
            to="/"
            className="nav-link"
            style={{ fontFamily: "'Montserrat', sans-serif !important", color: "#ccc !important", fontSize: "19px !important" }}
          >
            <FontAwesomeIcon icon={faHouse} className="me-1" /> Home
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/loguser" className="nav-link" style={{ color: "#ccc", fontSize: "19px" }}>
            Log
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/guide" className="nav-link" style={{ color: "#ccc", fontSize: "19px" }}>
            Support
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/authentication" className="nav-link" style={{ color: "#ccc", fontSize: "19px" }}>
            Sign in
          </Link>
        </li>
      </ul>

<div
  style={{
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "bold" 

  }}
>
{userInfo && (
  <div style={{ color: "#ccc", marginRight: "10px", fontSize: "20px", lineHeight: 1.2, fontWeight: 500 }}>
    <div>
      {userInfo.name}{" "}
      <span style={{ color: "orange", fontSize: "16px" }}>
        {Array(userInfo.level).fill("⭐").join(" ")}
      </span>
    </div>
    {userInfo.balance !== undefined && (
      <div style={{ fontSize: "16px", color: "#aaa", marginTop: "2px" }}>
        Balance: {userInfo.balance} USDT
      </div>
    )}
  </div>
)}


  {walletAddress ? (
    <>
      <span
        className="nav-link"
        style={{
          display: "flex",
          alignItems: "center",
          color: "#ccc",
          fontSize: "16px"
        }}
      >
        <FaUser size={20} style={{ marginRight: "6px", color: "orange" }} />
        {truncateAddress(walletAddress)}
      </span>
      <LogoutOutlined
        onClick={handleDisconnectWallet}
        style={{
          color: "red",
          fontSize: "20px",
          marginLeft: "10px",
          cursor: "pointer"
        }}
        title="Disconnect Wallet"
      />
    </>
  ) : (
    <Button
      type="primary"
      onClick={handleConnectWallet}
      style={{
        backgroundColor: "#ff6600",
        border: "none",
        fontSize: "16px"
      }}
    >
      Connect Wallet
    </Button>
  )}
</div>


    </div>
  </div>
</nav>





      <Modal
        title="Your Shopping Cart"
        open={isCartModalOpen}
        onCancel={closeCartModal}
        footer={[
          <Button key="checkout" type="primary" onClick={handleReservationWithCart}>
            Proceed to Checkout
          </Button>
        ]}
        width={700}
      >
        <Cart />
      </Modal>
    </>
  );
};

export default Header;
