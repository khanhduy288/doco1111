import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Input, notification } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AuctionPage.css';

const AuctionPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState("");

  // Fetch product info
  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        const response = await fetch(`https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop/${id}`);
        if (!response.ok) throw new Error("Failed to load product info");
        const data = await response.json();
        setProduct(data);
        setCurrentBid(data.currentBid || 0);
        setHighestBidder(data.highestBidder || "");
        setBiddingHistory(data.biddingHistory || []);
      } catch (err) {
        toast.error("Error loading product info.");
      }
    };

    fetchProductInfo();
  }, [id]);

  // Fetch seller's wallet address
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch("https://681de07ac1c291fa66320473.mockapi.io/addressqr/wallet/1");
        if (!response.ok) throw new Error("Failed to retrieve wallet address");
        const data = await response.json();
        setWalletAddress(data.address || "");
      } catch (error) {
        toast.error("Failed to retrieve wallet address.");
      }
    };

    fetchWallet();
  }, []);

  // Update product info
  const updateProduct = async (updatedProduct) => {
    try {
      const response = await fetch(`https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) throw new Error("Failed to update product");

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      toast.error("Failed to update product.");
    }
  };

  // Handle bidding
  const handleBid = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    if (!walletAddress) {
      toast.error("Seller wallet address not available.");
      return;
    }

    if (parseFloat(bidAmount) <= currentBid) {
      notification.error({
        message: "Error",
        description: "Bid must be higher than current price.",
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const sender = accounts[0];

      const tx = {
        from: sender,
        to: walletAddress,
        value: `0x${(parseFloat(bidAmount) * 1e18).toString(16)}`,
        gas: '0x5208',
      };

      toast.info("Sending transaction...");

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
      });

      toast.success(`Transaction successful: ${txHash}`);

      const updatedHistory = [...biddingHistory, { bidder: sender, amount: bidAmount }];

      const updatedProduct = {
        ...product,
        currentBid: parseFloat(bidAmount),
        highestBidder: sender,
        biddingHistory: updatedHistory,
      };

      setCurrentBid(parseFloat(bidAmount));
      setHighestBidder(sender);
      setBiddingHistory(updatedHistory);
      setBidAmount("");

      await updateProduct(updatedProduct);
      toast.success("Product updated successfully.");
    } catch (error) {
      toast.error("Transaction failed.");
      console.error("Transaction error:", error);
    }
  };

  return (
    <div className="auction-page">
      {product ? (
        <div className="product-info">
          <div className="product-header">
            <img
              src={product.image}
              alt={product.name}
              className="auction-product-image"
            />
            <h2>{product.name}</h2>
            <p>{product.description}</p>
          </div>
          <div className="auction-details">
            <h3>Current Auction</h3>
            <p><strong>Current Price: </strong>{currentBid} ETH</p>
            <p><strong>Highest Bidder: </strong>{highestBidder || "No winner yet"}</p>
            <div>
              <Input
                placeholder="Enter your bid"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={currentBid + 0.1}
              />
              <Button type="primary" onClick={handleBid} style={{ marginTop: '10px' }}>
                Place Bid
              </Button>
            </div>
          </div>
          <div className="bidding-history">
            <h3>Bidding History</h3>
            <ul>
              {biddingHistory.length > 0 ? (
                biddingHistory.map((bid, index) => (
                  <li key={index}>
                    <strong>{bid.bidder}</strong>: {bid.amount} ETH
                  </li>
                ))
              ) : (
                <p>No bidding history yet.</p>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="loading">Loading...</div>
      )}
    </div>
  );
};

export default AuctionPage;
