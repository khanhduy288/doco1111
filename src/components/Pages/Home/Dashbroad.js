import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faChartLine, faFileInvoice, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import './Dashbroad.css';

const Dashboard = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [transactions, setTransactions] = useState([]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  useEffect(() => {
    if (activeTab === "transactions") {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchTransactions = async () => {
    const walletAddress = "0x65D7d2381b18AB6FbAA980f1EB550672Af50710b";
    const apiKey = "K2IPH3NSF9MB2FZ4CCP4FBK14ESWRTCVMM";
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
      );
      const data = await response.json();
      if (data.status === "1") {
        setTransactions(data.result || []);
      } else {
        setTransactions([]);
        console.error("Error from Etherscan:", data.message);
      } 
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "transactions":
        return (
          <div className="transaction-log">
            <h2>Transaction History</h2>
            {transactions.length === 0 ? (
              <p>Loading or no transactions found...</p>
            ) : (
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Hash</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Value (ETH)</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.hash}>
                      <td>{tx.hash.slice(0, 10)}...</td>
                      <td>{tx.from.slice(0, 10)}...</td>
                      <td>{tx.to ? tx.to.slice(0, 10) : "Contract"}</td>
                      <td>{(Number(tx.value) / 1e18).toFixed(4)}</td>
                      <td>{new Date(tx.timeStamp * 1000).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case "products":
        return (
          <div className="product-management">
            <h2>Product </h2>
            <p>Here you can add, update, or remove products from your store.</p>
            {/* Replace this with real product table or UI */}
            <ul>
              <li>Product A - In Stock</li>
              <li>Product B - Out of Stock</li>
              <li>Product C - Limited</li>
            </ul>
          </div>
        );

      case "revenue":
        return (
          <div className="revenue-overview">
            <h2>Revenue Overview</h2>
            <p>See your revenue by month or product category.</p>
            {/* Replace this with real chart or data */}
            <ul>
              <li>January: $1,200</li>
              <li>February: $1,800</li>
              <li>March: $2,050</li>
            </ul>
          </div>
        );

      default:
        return (
          <>
            <h1>Welcome to the Dashboard</h1>
            <p>This is your admin dashboard where you can manage products, view revenue, and track transactions.</p>
            <div className="card-container">
              <div className="card" onClick={() => setActiveTab("products")} style={{ cursor: "pointer" }}>
                <h3>Products</h3>
                <p>Manage your products here.</p>
              </div>
              <div className="card" onClick={() => setActiveTab("revenue")} style={{ cursor: "pointer" }}>
                <h3>Revenue</h3>
                <p>View your revenue reports.</p>
              </div>
              <div className="card" onClick={() => setActiveTab("transactions")} style={{ cursor: "pointer" }}>
                <h3>Transaction Log</h3>
                <p>Track all your transactions.</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="logo" onClick={toggleNav}>
          Dashboard
        </div>
      </header>

      <div className={`sidebar ${isNavOpen ? "open" : "closed"}`}>
        <div className="nav-links">
          <div className="menu-link" onClick={() => setActiveTab("products")}>
            <FontAwesomeIcon icon={faBox} size="2xl" />
            <span>Product Management</span>
          </div>
          <div className="menu-link" onClick={() => setActiveTab("revenue")}>
            <FontAwesomeIcon icon={faChartLine} size="2xl" />
            <span>Revenue</span>
          </div>
          <div className="menu-link" onClick={() => setActiveTab("transactions")}>
            <FontAwesomeIcon icon={faFileInvoice} size="2xl" />
            <span>Transaction Log</span>
          </div>
          <div className="menu-link">
            <FontAwesomeIcon icon={faSignOutAlt} size="2xl" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      <div className="main-content">{renderMainContent()}</div>
    </div>
  );
};

export default Dashboard;
