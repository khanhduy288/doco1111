import "animate.css/animate.min.css";
import WOW from "wow.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { Pagination } from "antd";
import { Link } from "react-router-dom";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Blogs/get-full"
      );
      if (response.data.isSuccessed) {
        const blogs = response.data.resultObj;
        if (Array.isArray(blogs)) {
          setBlogs(blogs);
        } else {
          console.error("Unexpected response data format:", blogs);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the blogs:", error);
      setLoading(false);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  useEffect(() => {
    new WOW().init();
    fetchBlogs();
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBlogs = blogs.slice(startIndex, endIndex);

  return (
    <>
      {/* END nav */}
      <section
        className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: 'url("images/bg_5.jpg")' }}
        data-stellar-background-ratio="0.5"
      >
        <div className="overlay" />
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center">
            <div className="col-md-9 wow animate__animated animate__fadeUp text-center mb-5">
              <h1 className="mb-2 bread">Blog</h1>
              <p className="breadcrumbs">
                <span className="mr-2">
                  <a href="index.html">
                    Home <i className="fa fa-chevron-right" />
                  </a>
                </span>{" "}
                <span>
                  Blog <i className="fa fa-chevron-right" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="ftco-section bg-light">
        <div className="container">
          <div className="row">
            {currentBlogs.map((blog) => (
              <div
                key={blog.idBlog}
                className="col-md-4 wow animate__animated animate__fadeUp"
              >
                <Link to={`/blogDetails/${blog.idBlog}`}>
                <div className="blog-entry">
                  <a
                    href="#"
                    className="block-20"
                    style={{ backgroundImage: `url(${blog.image})` }}
                  ></a>
                  <div className="text px-4 pt-3 pb-4">
                    <div className="meta">
                      <div>
                        <a href="#">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </a>
                      </div>
                      <div>
                        <a href="#">Admin</a>
                      </div>
                    </div>
                    <h3 className="heading">
                      <a href="#">{truncateText(blog.title, 40)}</a>
                    </h3>
                    <p className="clearfix">
                      <a href="#" className="float-left read btn btn-primary">
                        Đọc thêm
                      </a>
                    </p>
                  </div>
                </div>
                </Link>
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
              total={blogs.length}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </section>
    </>
  );
};
export default Blog;
