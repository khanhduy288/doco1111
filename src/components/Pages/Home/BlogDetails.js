import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (id) {
        try {
          console.log(`Fetching blog with id: ${id}`);
          const response = await axios.get(
            `https://projectsep490g64summer24backend.azurewebsites.net/api/Blogs/get-by-id?id=${id}`
          );
          console.log("API response:", response);
          if (response.data) {
            setBlog(response.data);
          } else {
            console.error("API call unsuccessful: No data in response");
          }
        } catch (error) {
          console.error("Error fetching the blog:", error);
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
        }
      } else {
        console.error("No id provided for fetching blog details");
      }
    };

    fetchBlog();
  }, [id]);

  if (!blog) {
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
              <h1 className="mb-2 bread">Blog Details</h1>
              <p className="breadcrumbs">
                <span className="mr-2">
                  <a href="index.html">
                    Home <i className="fa fa-chevron-right" />
                  </a>
                </span>{" "}
                <span>
                  Blog Details <i className="fa fa-chevron-right" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mt-3 mb-3">
        <div className="row">
          <div className="col-lg-12">
            <h2 style={{ textAlign: "left", fontStyle: "italic", fontSize:"40px" }}>🌟 {blog.title}</h2>
            <h2 style={{ textAlign: "left" }}>🌟 {blog.subTitle}</h2>
            <img src={blog.image} style={{ width: "100%" }} alt="" />
            <h5 className="mt-3" style={{ textAlign: "left" }}>
              {blog.description}
            </h5>
            <p>
              ---------------------------------------------------------------------------------------------------------------------------
            </p>
            <h5>⏰ Opening Hours (Singapore Time): </h5>
            <h5>🔺 Monday - Sunday: Morning: 10:00 - 14:00 / Evening: 18:00 - 21:00</h5>
            <h5>☎️ Reservation Hotline: 039 797 0202</h5>
            <p>
              ---------------------------------------------------------------------------------------------------------------------------
            </p>
            <h5>Branch 1: High-Tech Park</h5>
            <h5>Branch 2: 201 </h5>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;
