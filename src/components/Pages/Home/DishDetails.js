import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../Cart/CartContext";
import axios from "axios";
import { Card, Button } from "antd";

const DishDetails = () => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchDish = async () => {
      if (id) {
        try {
          console.log(`Fetching dish with id: ${id}`);
          const response = await axios.get(
            `https://projectsep490g64summer24backend.azurewebsites.net/api/Dishs/get-by-id?id=${id}`
          );
          console.log("API response:", response);
          if (response.data) {
            setDish(response.data);
          } else {
            console.error("API call unsuccessful: No data in response");
          }
        } catch (error) {
          console.error("Error fetching the dish:", error);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
        }
      } else {
        console.error("No id provided for fetching dish details");
      }
    };

    fetchDish();
  }, [id]);

  if (!dish) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <section
        className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: 'url("../images/bg_5.jpg")' }}
        data-stellar-background-ratio="0.5"
      >
        <div className="overlay" />
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center">
            <div className="col-md-9 wow animate__animated animate__fadeIn text-center mb-5">
              <h1 className="mb-2 bread">Chi tiết món</h1>
              <p className="breadcrumbs">
                <span className="mr-2">
                  <a href="index.html">
                    Trang chủ <i className="fa fa-chevron-right" />
                  </a>
                </span>{" "}
                <span>
                  Chi tiết món <i className="fa fa-chevron-right" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mt-3 mb-3">
        <div className="row">
          <div className="col-lg-8">
            <img
              src={dish.image}
              style={{ width: "500px", height: "auto", borderRadius: "5%" }}
              alt={dish.name}
            />
          </div>
          <div className="col-lg-4">
            <Card
              hoverable
              style={{
                width: "100%",
                marginBottom: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                backgroundColor: "#f0f8ff", 
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ textAlign: "center", height: "140px" }}>
                <h3 style={{ color: "#1890ff" }}>Món: {dish.name}</h3>
                <h4 style={{ color: "#52c41a" }}>Giá: {dish.price} VND</h4>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                    marginTop: "10px",
                  }}
                  onClick={() => addToCart(dish)}
                >
                  Đặt món
                </Button>
              </div>
              <div style={{ marginTop: "30px" }}>
                <h4 style={{ color: "#1890ff" }}>Mô tả:</h4>
                <p style={{ color: "#595959" }}>{dish.description}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default DishDetails;
