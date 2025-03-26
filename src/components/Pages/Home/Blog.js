import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import WOW from "wow.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHome, faBook } from "@fortawesome/free-solid-svg-icons";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const demoBlog = {
    idBlog: "demo",
    title: "Hoạt động huấn luyện phòng chống tai nạn thương tích cho học sinh trường THCS Chu Văn An",
    image: "https://external.fhan17-1.fna.fbcdn.net/emg1/v/t13/4491442508476661845?url=https%3A%2F%2Fi.ytimg.com%2Fvi%2FC0hnhkivJU4%2Fmaxresdefault.jpg%3Fsqp%3D-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGFggZShDMA8%3D%26rs%3DAOn4CLD96d_j5grFUrUYsRQgnxT2dLCXtw&fb_obo=1&utld=ytimg.com&stp=c0.5000x0.5000f_dst-jpg_flffffff_p500x261_q75_tt6&_nc_oc=AdlMP1DaGtpT0dKDOSq2oUq2wriqhSmjwVEe8O2VWPzONqtzNSJaGRelPbzxmJCCgWU&ccb=13-1&oh=06_Q39-_jY6nUi8_5Uw4Emsc-g2cYqoOXOT9b6QNfliqBSm2VI&oe=67E54FE0&_nc_sid=c97757",
    createdAt: new Date().toISOString(),
  };

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Blogs/get-full"
      );
      if (response.data.isSuccessed) {
        const blogs = response.data.resultObj;
        if (Array.isArray(blogs) && blogs.length > 0) {
          setBlogs(blogs);
        } else {
          console.error("Unexpected response data format:", blogs);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching the blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    new WOW().init();
    fetchBlogs();
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBlogs = blogs.length > 0 ? blogs.slice(startIndex, endIndex) : [demoBlog];

  return (
    <>
      <section style={{ backgroundColor: "white", color: "gold", marginTop: "5%" }}>
  <div className="overlay" />
  <div className="container">
    <div className="row no-gutters slider-text align-items-end justify-content-center">
      <div className="col-md-9 wow animate__animated animate__fadeIn text-center mb-5">
        <h1 className="mb-2 bread">Tin Tức Mới Nhất</h1>
        <p className="breadcrumbs">
          <span className="mr-2">
            <a href="index.html">
              Trang chủ <FontAwesomeIcon icon={faHome} />
            </a>
          </span>
          <span>
            Tin Tức <FontAwesomeIcon icon={faBook} />
          </span>
        </p>
      </div>
    </div>
  </div>
</section>

      <section className="ftco-section bg-light">
        <div className="container">
          <div className="row justify-content-center">
            {currentBlogs.map((blog) => (
              <div key={blog.idBlog} className="col-md-6 mb-4">
                <Link to={blog.idBlog !== "demo" ? `/blogDetails/${blog.idBlog}` : "#"}>
                  <div className="blog-entry" style={{ borderRadius: "10px", overflow: "hidden", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
                    <div
                      className="block-20"
                      style={{ 
                        backgroundImage: `url(${blog.image})`,
                        height: "350px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="text p-4" style={{ textAlign: "center" }}>
                      <div className="meta mb-2">
                        <div><a href="#">{new Date(blog.createdAt).toLocaleDateString()}</a></div>
                        <div><a href="#">Admin</a></div>
                      </div>
                      <h3 className="heading">
                        <a href="#" style={{ fontSize: "20px", fontWeight: "bold" }}>{blog.title}</a>
                      </h3>
                      <p className="clearfix">
                        <a 
                          href="https://www.youtube.com/watch?v=C0hnhkivJU4" 
                          className="btn btn-primary" 
                          style={{ padding: "8px 20px", borderRadius: "20px" }} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                      Đọc thêm
                      </a>
                    </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {blogs.length > 0 && (
            <div className="pagination-container" style={{ marginTop: "20px", textAlign: "center" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={blogs.length}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
