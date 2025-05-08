import React, { useEffect, useState } from 'react';
import './Home.css'; // Đảm bảo bạn tạo và import file CSS này

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetch('https://63e1d6414324b12d963f5108.mockapi.io/api/v11/laptop'); // Thay thế URL API của bạn vào đây
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu sản phẩm');
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="home">
      <h1 className="page-title">List Product</h1>
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-info">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <p className="product-price"><strong>Price: ${product.price}</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
