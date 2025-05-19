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

const Header = () => {
  const { cart, getTotalItems } = useContext(CartContext);
  const totalItems = getTotalItems();
  const navigate = useNavigate();

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("SEPuser"));
    if (user) {
      setUserName(user.userName);
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
      <nav className="navbar navbar-expand-lg navbar-light bg-white ftco-navbar-light" id="ftco-navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{ height: "auto", width: "100px", borderRadius: "50%" }}
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

          <div className="collapse navbar-collapse" id="ftco-nav">
            <ul className="navbar-nav ml-auto align-items-center">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  <FontAwesomeIcon icon={faHouse} className="mr-1" /> Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/menu" className="nav-link">Bet</Link>
              </li>
              <li className="nav-item">
                <Link to="/guide" className="nav-link">Support</Link>
              </li>
              <li className="nav-item">
                <Link to="/authentication" className="nav-link">Sign in</Link>
              </li>
              <li className="nav-item">
                <Badge count={totalItems} size="small" offset={[4, 0]}>
                  <Button onClick={openCartModal} type="text">
                    <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: "20px", color: "#ff6600" }} />
                  </Button>
                </Badge>
              </li>
              <li className="nav-item ml-2 d-flex align-items-center">
                {walletAddress ? (
                  <>
                    <span className="nav-link d-flex align-items-center">
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
                  <Button type="primary" onClick={handleConnectWallet}>Connect Wallet</Button>
                )}
              </li>
            </ul>
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
