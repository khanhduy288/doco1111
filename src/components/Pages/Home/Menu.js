import "animate.css/animate.min.css";
import WOW from "wow.js";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../Cart/CartContext";
import { Pagination } from "antd";
import "./Menu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHome, faBook } from "@fortawesome/free-solid-svg-icons";

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
  <section style={{ backgroundColor: "white", color: "gold" }}>
    <div className="overlay" />
    <div className="container">
      <div className="row no-gutters slider-text align-items-end justify-content-center">
        <div className="col-md-9 wow animate__animated animate__fadeIn text-center mb-5">
          <h1 className="mb-2 bread"></h1>
          <p className="breadcrumbs">
          <span className="mr-2">
          <a href="index.html">
            Trang chủ <FontAwesomeIcon icon={faHome} />
          </a>
          </span>
          <span>
            Khóa học <FontAwesomeIcon icon={faBook} />
          </span>
          </p>
        </div>
      </div>
    </div>
  </section>

  <section id="courses" className="pt-5 pb-5">
  <div className="container">
    <div className="row">
      <div className="col-lg-12">
        <div className="page_title text-center mb-4">
          <h1>Danh sách khóa học</h1>
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
            {["Thực hành", "Lý thuyết"].map((category, index) => (
              <li
                key={index}
                className={selectedCategory === category ? "active" : ""}
              >
                <a onClick={() => handleCategoryClick(category)}>{category}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="tab-content col-lg-12">
        <div className="tab-pane fade show active">
          <div className="row">
            {selectedCategory !== "Lý thuyết" && (
              <div className="col-md-6">
                <div className="single_menu">
                  <h4>Chuyên đề thực hành:</h4>
                  <ul>
                    <li className="course-item">KN phòng tránh, xử lý tình huống ngạt nước, đuối nước</li>
                    <li className="course-item">KN phòng chống và xử lý khi xảy ra tai nạn giao thông</li>
                    <li className="course-item">KN phòng chống và xử lý khi có hỏa hoạn</li>
                    <li className="course-item">KN phòng chống bắt cóc, xâm hại</li>
                    <li className="course-item">KN phòng chống bạo lực học đường</li>
                    <li className="course-item">KN phòng chống và xử lý khi bị hóc, sặc dị vật đường thở</li>
                    <li className="course-item">KN sơ cấp cứu ban đầu theo tiêu chuẩn WHO</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedCategory !== "Thực hành" && (
              <div className="col-md-6">
                <div className="single_menu">
                  <h4>Chuyên đề lý thuyết:</h4>
                  <ul>
                    <li className="course-item">An toàn không gian mạng</li>
                    <li className="course-item">KN phòng chống và xử lý khi xảy ra tai nạn điện</li>
                    <li className="course-item">KN phòng chống ma túy và các chất gây nghiện</li>
                    <li className="course-item">KN phòng chống ngộ độc thực phẩm</li>
                    <li className="course-item">KN phòng chống và xử lý khi bị động vật tấn công</li>
                  </ul>
                </div>
              </div>
            )}
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
