import React, { useEffect, useState } from 'react';
import './Home.css'; // Tạo file này để thêm CSS responsive
import { Button, Row, Col } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { CartContext } from '../Cart/CartContext'; // Cập nhật đúng đường dẫn nếu cần

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);


  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetch('https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop');
        if (!response.ok) {
          throw new Error('Failed to load product data');
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
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
    // Thêm logic lưu vào cart context hoặc localStorage tại đây nếu cần
  };

  const handleBuyNow = async (product) => {
    if (!window.ethereum) {
      toast.error("Vui lòng cài đặt MetaMask!");
      return;
    }
  
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const sender = accounts[0];
  
      const tx = {
        from: sender,
        to: "0x65D7d2381b18AB6FbAA980f1EB550672Af50710b", // 🛑 thay địa chỉ người bán
        value: `0x${(product.price * 1e18).toString(16)}`,
        gas: '0x5208', // hoặc để trống để MetaMask tự tính
      };
  
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
      });
  
      toast.success(`TX thành công: ${txHash}`);
    } catch (error) {
      console.error(error);
      toast.error("Giao dịch bị huỷ hoặc lỗi.");
    }
  };
  

  const handleAuction = (product) => {
    toast.warning(`Enter auction for ${product.name}`);
    // Điều hướng đến trang đấu giá
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="home container">
      <h1 className="page-title">Antique Treasures</h1>
      <Row gutter={[16, 16]} justify="center">
        {products.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
            <div className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">${product.price}</p>
              </div>
              <div className="product-actions">
                <Button type="primary" block onClick={() => handleBuyNow(product)}>Buy Now</Button>
                <Button type="dashed" block style={{ margin: '8px 0' }} onClick={() => handleAuction(product)}>Auction</Button>
                <Button type="default" block onClick={() => handleAddToCart(product)}>Add to Cart</Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
