import React, { useEffect, useState, useContext } from "react"; 
import "./Home.css";
import { Button, Row, Col } from "antd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartContext } from "../Cart/CartContext";
import { Link } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const BET_API = "https://68271b3b397e48c913189c7d.mockapi.io/football";
  const [user, setUser] = useState(null);
  const [showCreateBetForm, setShowCreateBetForm] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    name: "",
    team1: "",
    team2: "",
    option1: "",
    option2: "",
    rate1: "1.85",
    rate2: "1.85",
    status1: "pending",
    status2: "pending",
    claim: "",
    time: "",
    iframe: "",
    countdown: "",
  });

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetch(
          "https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop"
        );
        if (!response.ok) {
          throw new Error("Failed to load product data");
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    getProducts();

    const storedUser = localStorage.getItem("SEPuser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = async (product) => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const sender = accounts[0];

      const tx = {
        from: sender,
        to: "0x65D7d2381b18AB6FbAA980f1EB550672Af50710b",
        value: `0x${(product.price * 1e18).toString(16)}`,
        gas: "0x5208",
      };

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });

      toast.success(`TX ok: ${txHash}`);
    } catch (error) {
      console.error(error);
      toast.error("Error!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "rate1" || name === "rate2") && parseFloat(value) > 1.9) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const requiredFields = ["name", "team1", "team2", "option1", "option2", "rate1", "rate2", "status1", "status2"];
    for (const field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === "") {
        toast.error(`Vui lòng nhập đầy đủ trường: ${field}`);
        return;
      }
    }

    const now = new Date().toISOString();

    const payload = {
      ...form,
      time: now,
    };

    try {
      const res = await fetch(BET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Create failed");

      toast.success("Tạo kèo thành công!");
      setForm({
        name: "",
        team1: "",
        team2: "",
        option1: "",
        option2: "",
        rate1: "1.85",
        rate2: "1.85",
        status1: "pending",
        status2: "pending",
        claim: "",
        time: "",
        iframe: "",
        countdown: "",
      });
      setShowCreateBetForm(false);
    } catch (error) {
      toast.error("Tạo kèo thất bại, vui lòng thử lại.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <>
      {user && (
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Đóng menu" : "Mở menu"}
          title={sidebarOpen ? "Đóng menu" : "Mở menu"}
        >
          {sidebarOpen ? "×" : "☰"}
        </button>
      )}

      {user && sidebarOpen && (
        <nav className="sidebar-menu">
          <h3>Menu</h3>
          <ul>
            <li>
              <Button
                type="primary"
                block
                onClick={() => setShowCreateBetForm((v) => !v)}
              >
                {showCreateBetForm ? "Đóng form tạo kèo" : "Tạo Kèo"}
              </Button>
            </li>
            <li>
              <Link to="/">
                <Button block>Trang Chủ</Button>
              </Link>
            </li>
          </ul>
        </nav>
      )}

      <div
        className="home container"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          paddingLeft: user && sidebarOpen ? "220px" : "20px",
          transition: "padding-left 0.3s ease",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 0,
        }}
      >
        <h1 className="page-title">Antique Treasures</h1>

        {showCreateBetForm && (
          <form className="form" onSubmit={handleCreate} noValidate>
            <input name="name" placeholder="Match Name" value={form.name} onChange={handleChange} />
            <input name="team1" placeholder="Team 1" value={form.team1} onChange={handleChange} />
            <input name="team2" placeholder="Team 2" value={form.team2} onChange={handleChange} />
            <input name="option1" placeholder="Option 1" value={form.option1} onChange={handleChange} />
            <input name="option2" placeholder="Option 2" value={form.option2} onChange={handleChange} />
            <input
              name="rate1"
              placeholder="Rate 1"
              type="number"
              step="0.01"
              max="1.90"
              value={form.rate1}
              onChange={handleChange}
            />
            <input
              name="rate2"
              placeholder="Rate 2"
              type="number"
              step="0.01"
              max="1.90"
              value={form.rate2}
              onChange={handleChange}
            />
            <input name="countdown" placeholder="Countdown" type="datetime-local" value={form.countdown} onChange={handleChange} />
            <select name="status1" value={form.status1} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
            <select name="status2" value={form.status2} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
            <input name="claim" placeholder="Claim" value={form.claim} onChange={handleChange} />
            <input name="iframe" placeholder="Iframe" value={form.iframe} onChange={handleChange} />
            <button type="submit" className="btn btn-primary">
              Create Bet
            </button>
          </form>
        )}

        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <div className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />
                <h3>{product.name}</h3>
                <p>Price: {product.price} ETH</p>
                <Button type="primary" onClick={() => handleAddToCart(product)} block>
                  Add to Cart
                </Button>
                <Button
                  type="default"
                  onClick={() => handleBuyNow(product)}
                  block
                  style={{ marginTop: "8px" }}
                >
                  Buy Now
                </Button>
              </div>
            </Col>
          ))}
        </Row>

      </div>
    </>
  );
};

export default Home;
