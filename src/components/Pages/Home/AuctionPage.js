import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Input, notification } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AuctionPage.css';

const AuctionPage = () => {
  const { id } = useParams(); // Lấy id từ URL
  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState("");

  // Fetch thông tin sản phẩm khi component được mount
  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        const response = await fetch(`https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop/${id}`);
        if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm");
        const data = await response.json();
        setProduct(data); // Cập nhật thông tin sản phẩm vào state
        setCurrentBid(data.currentBid || 0);
        setHighestBidder(data.highestBidder || "");
        setBiddingHistory(data.biddingHistory || []);  // Lưu lịch sử đấu giá từ sản phẩm
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        toast.error("Có lỗi xảy ra khi tải thông tin sản phẩm.");
      }
    };

    fetchProductInfo();
  }, [id]);

  // Cập nhật thông tin sản phẩm sau khi người dùng đặt giá
  const updateProduct = async (updatedProduct) => {
    try {
      console.log("Cập nhật sản phẩm với dữ liệu:", updatedProduct);
      const response = await fetch(`https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        console.error("Cập nhật sản phẩm thất bại:", await response.text());
        throw new Error("Không thể cập nhật sản phẩm");
      }
      
      const data = await response.json();
      console.log("Sản phẩm sau khi cập nhật:", data);
      setProduct(data); // Cập nhật lại sản phẩm trong state sau khi update
    } catch (err) {
      console.error("Lỗi cập nhật sản phẩm:", err);
      toast.error("Cập nhật sản phẩm thất bại.");
    }
  };

  const handleBid = async () => {
    if (!window.ethereum) {
      toast.error("Vui lòng cài đặt MetaMask!");
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
        to: product.walletAddress, // Địa chỉ ví người bán
        value: `0x${(bidAmount * 1e18).toString(16)}`,
        gas: '0x5208',
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
      });

      toast.success(`Đặt giá thành công! Giao dịch: ${txHash}`);
      setCurrentBid(parseFloat(bidAmount)); // Cập nhật lại mức giá cao nhất
      setHighestBidder(sender); // Cập nhật lại người thắng
      setBidAmount(""); // Xóa input bid
      // Cập nhật lịch sử đấu giá sau khi đặt giá mới
      setBiddingHistory([...biddingHistory, { bidder: sender, amount: bidAmount }]);

      // Cập nhật thông tin sản phẩm mới sau khi đặt giá
      const updatedProduct = {
        ...product,
        currentBid: parseFloat(bidAmount),
        highestBidder: sender,
      };
      
      await updateProduct(updatedProduct); // Cập nhật sản phẩm với giá và người thắng mới
    } catch (error) {
      console.error("Lỗi giao dịch:", error);
      toast.error("Giao dịch thất bại.");
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
