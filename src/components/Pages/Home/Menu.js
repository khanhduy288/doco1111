import "animate.css/animate.min.css";
import WOW from "wow.js";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../Cart/CartContext";
import { Pagination } from "antd";
import "./Menu.css";
import axios from "axios";

const Menu = () => {
  useEffect(() => {
    new WOW().init();
  }, []);

  const { addToCart } = useContext(CartContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentDishes = dishes.slice(startIndex, endIndex);

  const fetchDishes = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Dishs/get-full"
      );
      if (response.data.isSuccessed) {
        const dishes = response.data.resultObj;
        if (Array.isArray(dishes)) {
          setDishes(dishes);
        } else {
          console.error("Unexpected response data format:", dishes);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching the dishes:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Categories/get-full"
      );
      if (response.data.isSuccessed) {
        const categories = response.data.resultObj;
        if (Array.isArray(categories)) {
          setCategories(categories);
        } else {
          console.error("Unexpected response data format:", categories);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching the categories:", error);
    }
  };

  useEffect(() => {
    fetchDishes();
    fetchCategories();
  }, []);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const filteredDishes = selectedCategory
    ? dishes.filter((dish) => dish.categoryID === selectedCategory)
    : dishes;

  return (
    <>
      <section style={{ backgroundColor: "white", color: "gold" }}
       
      >
        <div className="overlay" />
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center">
            <div className="col-md-9 wow animate__animated animate__fadeIn text-center mb-5">
              <h1 className="mb-2 bread">Thực đơn</h1>
              <p className="breadcrumbs">
                <span className="mr-2">
                  <a href="index.html">
                    Trang chủ <i className="fa fa-chevron-right" />
                  </a>
                </span>{" "}
                <span>
                  Thực đơn <i className="fa fa-chevron-right" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="our_menu" className="pt-5 pb-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="page_title text-center mb-4">
                <h1>thực đơn</h1>
                <div className="single_line" />
              </div>
            </div>
          </div>

          <div className="row mt-1">
            <div className="col-12">
              <nav id="menu" style={{ backgroundColor: "white", color: "gold" }}>
                <ul>
                  <li className={selectedCategory === null ? "active" : ""}>
                    <a onClick={() => handleCategoryClick(null)}>TẤT CẢ</a>
                  </li>
                  {categories.map((category) => (
                    <li
                      key={category.idCategory}
                      className={
                        selectedCategory === category.idCategory ? "active" : ""
                      }
                    >
                      <a
                        onClick={() => handleCategoryClick(category.idCategory)}
                      >
                        {category.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="tab-content col-lg-12" id="myTabContent">
              <div
                className="tab-pane fade show active"
                id="breakfast"
                role="tabpanel"
                aria-labelledby="breakfast-tab"
              >
                <div className="row">
                  {filteredDishes.slice(startIndex, endIndex).map((dish) => (
                    <div key={dish.dishId} className="col-md-6">
                      <div className="single_menu">
                        <Link to={`/details/${dish.dishId}`}>
                          <img src={dish.image} alt={dish.name} />
                        </Link>
                        <div className="menu_content">
                          <h4>
                            {dish.name} <span>{dish.price}đ</span>
                          </h4>
                          <p>{truncateText(dish.description, 50)}</p>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => addToCart(dish)}
                          >
                            Đặt +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="pagination-container"
                  style={{ marginTop: "20px", textAlign: "center" }}
                >
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredDishes.length}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Menu;
