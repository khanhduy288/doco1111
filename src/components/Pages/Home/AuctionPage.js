import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Input, notification } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AuctionPage.css';

const AuctionPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [walletAddress, setWalletAddress] = useState(""); // thêm state lưu địa chỉ ví
  const [bidAmount, setBidAmount] = useState("");
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState("");

  // Fetch thông tin sản phẩm
  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        const response = await fetch(`https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop/${id}`);
        if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm");
        const data = await response.json();
        setProduct(data);
        setCurrentBid(data.currentBid || 0);
        setHighestBidder(data.highestBidder || "");
        setBiddingHistory(data.biddingHistory || []);
      } catch (err) {
        toast.error("Có lỗi khi tải thông tin sản phẩm.");
      }
    };

    fetchProductInfo();
  }, [id]);

  // Fetch địa chỉ ví từ API khác
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch("https://681de07ac1c291fa66320473.mockapi.io/addressqr/wallet/1");
        if (!response.ok) throw new Error("Không thể lấy địa chỉ ví");
        const data = await response.json();
        setWalletAddress(data.address  || ""); // Lưu địa chỉ ví vào state
      } catch (error) {
        toast.error("Không thể lấy địa chỉ ví.");
      }
    };

    fetchWallet();
  }, []);

  // Gửi PUT cập nhật sản phẩm
  const updateProduct = async (updatedProduct) => {
    try {
      const response = await fetch(`https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) throw new Error("Không thể cập nhật sản phẩm");

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      toast.error("Cập nhật sản phẩm thất bại.");
    }
  };

  // Xử lý đặt giá
  const handleBid = async () => {
    if (!window.ethereum) {
      toast.error("Vui lòng cài đặt MetaMask!");
      return;
    }

    if (!walletAddress) {
      toast.error("Chưa có địa chỉ ví của người bán.");
      return;
    }

    if (parseFloat(bidAmount) <= currentBid) {
      notification.error({
        message: "Lỗi",
        description: "Giá đấu phải cao hơn mức giá hiện tại.",
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

      toast.info("Đang gửi giao dịch...");

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
      });

      toast.success(`Giao dịch thành công: ${txHash}`);

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
      toast.success("Cập nhật sản phẩm thành công.");
    } catch (error) {
      toast.error("Giao dịch thất bại.");
      console.error("Lỗi giao dịch:", error);
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
            <h3>Đấu Giá Hiện Tại</h3>
            <p><strong>Mức giá hiện tại: </strong>{currentBid} ETH</p>
            <p><strong>Người thắng cuộc: </strong>{highestBidder || "Chưa có người thắng"}</p>
            <div>
              <Input
                placeholder="Nhập giá đấu"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={currentBid + 0.1}
              />
              <Button type="primary" onClick={handleBid} style={{ marginTop: '10px' }}>
                Đặt giá
              </Button>
            </div>
          </div>
          <div className="bidding-history">
            <h3>Lịch Sử Đấu Giá</h3>
            <ul>
              {biddingHistory.length > 0 ? (
                biddingHistory.map((bid, index) => (
                  <li key={index}>
                    <strong>{bid.bidder}</strong>: {bid.amount} ETH
                  </li>
                ))
              ) : (
                <p>Chưa có lịch sử đấu giá nào.</p>
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
