import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "antd";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Hàm fetch dữ liệu từ API
  const fetchBlogs = async () => {
    try {
      const response = await fetch("https://67ec9492aa794fb3222e24a5.mockapi.io/Blog/Blog");
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const currentBlogs = blogs.slice(startIndex, startIndex + pageSize);

  return (
    <section className="blog-section" style={{ padding: "5%" }}>
      <div  className="container">
        <h1 className="text-center mb-4">Tin Tức Mới Nhất</h1>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div style={{ padding: "5%" }} className="row">
            {currentBlogs.map((blog) => (
              <div key={blog.id} className="col-md-6 mb-4">
                <Link to={blog.detail}>
                  <div
                    className="blog-entry"
                    style={{
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <img
                      src={blog.avatar}
                      alt={blog.name}
                      style={{
                        
                        width: "100%",
                        height: "350px",
                        objectFit: "cover",
                        borderTopLeftRadius: "10px",
                        borderTopRightRadius: "10px",
                        
                      }}
                    />
                    <div className="text p-4 text-center">
                      <h3 className="heading">
                        <Link to={blog.detail} style={{ fontSize: "20px", fontWeight: "bold" }}>
                          {blog.name}
                        </Link>
                      </h3>
                      <Link
                        to={blog.detail}
                        className="btn btn-primary"
                        style={{ padding: "8px 20px", borderRadius: "20px" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Đọc thêm
                      </Link>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {blogs.length > 0 && (
          <div className="pagination-container text-center mt-4">
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
  );
};

export default Blog;