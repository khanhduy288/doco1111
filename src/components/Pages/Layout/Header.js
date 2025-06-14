import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { CartContext } from "../Cart/CartContext.js";
import { Modal, Button, Badge, notification } from "antd";
import "./Layout.css";
import Cart from "../Cart/Cart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faBars, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FaUser } from "react-icons/fa";
import { LogoutOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";





<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />


const Header = ({ onExtra }) => {
  const { cart, getTotalItems } = useContext(CartContext);
  const totalItems = getTotalItems();
  const [currentAccount, setCurrentAccount] = useState(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);


  const [loadingUserInfo, setLoadingUserInfo] = useState(false);

const fetchUserInfo = async () => {
  const localUser = JSON.parse(localStorage.getItem("SEPuser"));
  const userId = localUser?.id;
  if (!userId) return;

  try {
    setLoadingUserInfo(true);

    const res = await fetch(`https://berendersepuser.onrender.com/users/${userId}`, {
      headers: {
        "x-api-key": "adminsepuser", 
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user info by ID");
    }

    const data = await res.json();

    setUserInfo(data);

    // Đồng thời cập nhật lại localStorage nếu muốn
    localStorage.setItem("SEPuser", JSON.stringify(data));
  } catch (err) {
    console.error("Failed to fetch user info", err);
  } finally {
    setLoadingUserInfo(false);
  }
};



  useEffect(() => {
    fetchUserInfo();
  }, []);




  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);

  const handleReservationWithCart = () => {
    closeCartModal();
    navigate("/checkout", { state: { cart, showCart: true } });
  };

    const connectWallet = async () => {
      if (!window.ethereum) {
        toast.error("Vui lòng cài đặt MetaMask để đặt cược!");
        return;
      }
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setCurrentAccount(accounts[0]);
        toast.success("Kết nối ví thành công!");
      } catch (err) {
        toast.error("Kết nối ví thất bại");
      }
    };
  
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("SEPuser");
  localStorage.removeItem("userInfo"); 
  localStorage.removeItem("walletUser"); 
  localStorage.removeItem("walletAddress"); 

  if (axios.defaults.headers.common["Authorization"]) {
    delete axios.defaults.headers.common["Authorization"];
  }

  setUserInfo(null);
  setUserName(null);

  toast.success("Logged out successfully!");


  navigate("/authentication");
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
    #ftco-navbar > div {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      width: 100%;
      flex-wrap: wrap;
      position: relative;

    }

    #ftco-navbar .navbar-brand {
      margin-right: 20px;
    }

    #ftco-navbar .navbar-toggler {
      position: absolute !important;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
    }

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

    @media (max-width: 768px) {
      #ftco-navbar > div {
        justify-content: center !important; 
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

      #ftco-navbar .navbar-collapse {
        display: none !important;
        position: static;
        width: 100%;
        background: none;
      }

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
  <div style={{ color: "#ccc", display: "flex", alignItems: "center", gap: "12px" }}>
    <div style={{ fontSize: "20px", lineHeight: 1.2, fontWeight: 500 }}>
      <div>
        {userInfo.fullName}{" "}
        <span style={{ color: "orange", fontSize: "16px" }}>
          {Array(userInfo.level).fill("⭐").join(" ")}
        </span>
      </div>
      {userInfo.balance !== undefined && (
        <div style={{ fontSize: "16px", color: "#aaa", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
          Balance: {userInfo.balance} USDT
          <ReloadOutlined
            onClick={fetchUserInfo} 
            className={loadingUserInfo ? "refresh-button loading" : "refresh-button"}
          />
        </div>
      )}
    </div>

    <button
      onClick={handleLogout}
      style={{
        background: "transparent",
        border: "none",
        color: "#ccc",
        cursor: "pointer",
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}
    >
      <LogoutOutlined style={{ fontSize: "18px", color: "orange" }} />
      Logout
    </button>
  </div>
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
