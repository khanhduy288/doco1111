import React from "react";
import { Carousel } from "react-bootstrap";
import "./Home.css";
import "animate.css/animate.min.css";
import WOW from "wow.js";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Pagination } from "antd";


const Home = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);

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

  const handleReservationClick = () => {
    navigate("/reservation");
  };

  const handleMenuClick = () => {
    navigate("/menu");
  };
  return (
    <div>
  {/* style={{ marginTop: "50px" }} */}
  <section className="hero-wrap">
  <Carousel>
    {/* Slide 1 */}
    <Carousel.Item>
      <div
        className="slider-item"
        style={{
          height: "600px",
          width: "100vw", // Full màn hình
          backgroundImage: "url('/images/bg_1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="overlay" />
        <Carousel.Caption
          style={{
            position: "absolute",
            bottom: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
          }}
        >
          <div className="container-fluid">
            <div className="row no-gutters slider-text align-items-center justify-content-center">
              <div className="col-md-12">
                <div className="text w-100 mt-5 text-center">
                  <h1></h1>
                  <span className="subheading-2"></span>
                </div>
              </div>
            </div>
          </div>
        </Carousel.Caption>
      </div>
    </Carousel.Item>

    {/* Slide 2 */}
    <Carousel.Item>
      <div
        className="slider-item"
        style={{
          height: "600px",
          width: "100vw", // Full màn hình
          backgroundImage: "url('/images/bg_2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="overlay" />
        <Carousel.Caption
          style={{
            position: "relative",
            width: "100%",
          }}
        >
          <div className="container-fluid">
            <div className="row no-gutters slider-text align-items-center justify-content-center">
              <div className="col-md-12">
                <div className="text w-100 mt-5 text-center">
                  <h1></h1>
                  <span className="subheading-2"></span>
                </div>
              </div>
            </div>
          </div>
        </Carousel.Caption>
      </div>
    </Carousel.Item>
  </Carousel>
</section>
<section className="ftco-section ftco-no-pt ftco-no-pb ftco-intro bg-primary">
  <div className="container py-5">
    <div className="row py-2 align-items-center">
      {/* Phần nội dung giới thiệu */}
      <div className="col-md-7 text-white">
      <br></br>
      <br></br>
        <h2 className="mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '700' }}>Về Chúng Tôi</h2>
        <p className="lead" style={{ maxWidth: "80%", margin: "0 auto" }}>

          Viện khoa học giáo dục an toàn Việt Nam có nhiều năm kinh nghiệm trong việc giảng dạy,
          huấn luyện thực hành phòng chống tai nạn thương tích cho trẻ, nhằm phòng chống mọi nguy hiểm có
          thể xảy ra hàng ngày như tai nạn đuối nước, bắt cóc, xâm hại tình dục, bạo lực học đường, tai nạn giao
          thông, tai nạn điện, hỏa hoạn, phòng chống ngộ độc, phòng chống động vật tấn công, phòng chống ma túy và
          các chất gây nghiện, sơ cấp cứu đúng cách. Đối với Chúng tôi, mục tiêu trọng tâm của mọi hoạt động giáo dục là chia sẻ,
          huấn luyện thực hành để “Những kỹ năng chúng tôi chia sẻ hôm nay sẽ cứu được ai đó ngày mai”.
        </p>
        <button 
          className="btn"
          style={{
            backgroundColor: "#ff7f00",
            color: "#fff",
            margin:"10%",
            padding: "10px 20px",
            borderRadius: "25px",
            fontWeight: "bold",
            border: "none",
            marginTop: "15px"
          }}
        >
          XEM THÊM
        </button>
        
      </div>
      

      {/* Phần hình ảnh giới thiệu */}
      <div className="col-md-5 d-flex justify-content-center">
        <img
          src="/images/chef-4.jpg"
          alt="Giới thiệu nhà hàng"
          className="img-fluid rounded"
          style={{
            maxWidth: "90%", // Tăng kích thước ảnh để cân đối với phần chữ
            height: "auto",
            borderRadius: "10px",
          }}
        />
      </div>
    </div>
  </div>
</section>


      <section
        className="ftco-section ftco-intro"
        style={{ backgroundImage: "url(images/bg_white.jpg)" }}
      >
        <div style={{ background: "none" }} className="overlay" />
        <div className="row justify-content-center mb-3 pb-2">
          <div className="col-md-7 text-center heading-section heading-section-white ">
            <span className="subheading">Testimony</span>
            <div className="video-container" style={{ textAlign: "center", marginTop: "20px" }}>
            <iframe 
            width="100%" 
            height="500px" 
            src="https://www.youtube.com/embed/-sUNNCZNbbw" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
        ></iframe>
</div>
          </div>
        </div>
      </section>
      <section className="ftco-section bg-light">
  <div className="container">
    <div className="row justify-content-center mb-5 pb-2">
      <div className="col-md-7 text-center heading-section">
        <span className="subheading"></span>
        <h2 className="mb-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '700' }}>Chương trình tập huấn trải nghiệm thực tế</h2>
      </div>
    </div>
    <div className="row">
      <div className="col-md-6 col-lg-4">
        <div className="staff">
          <div className="img" style={{ backgroundImage: "url(images/chef-4.jpg)" }} />
          <div className="text px-4 pt-2">
            <h3>Kỹ năng dành cho con</h3>
            <div className="faded">
            <p></p>
              <ul className="ftco-social d-flex">
                <li><a href="#"><span className="icon-twitter" /></a></li>
                <li><a href="#"><span className="icon-facebook" /></a></li>
                <li><a href="#"><span className="icon-google-plus" /></a></li>
                <li><a href="#"><span className="icon-instagram" /></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="staff">
          <div className="img" style={{ backgroundImage: "url(images/chef-2.jpg)" }} />
          <div className="text px-4 pt-2">
            <h3>Cách sơ cấp cứu ban đầu</h3>
            <div className="faded">
              <p></p>
              <ul className="ftco-social d-flex">
                <li><a href="#"><span className="icon-twitter" /></a></li>
                <li><a href="#"><span className="icon-facebook" /></a></li>
                <li><a href="#"><span className="icon-google-plus" /></a></li>
                <li><a href="#"><span className="icon-instagram" /></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6 col-lg-4">
        <div className="staff">
          <div className="img" style={{ backgroundImage: "url(images/chef-3.jpg)" }} />
          <div className="text px-4 pt-2">
            <h3>Trải nghiệm tập huấn trại hè</h3>
            <div className="faded">
              <p></p>
              <ul className="ftco-social d-flex">
                <li><a href="#"><span className="icon-twitter" /></a></li>
                <li><a href="#"><span className="icon-facebook" /></a></li>
                <li><a href="#"><span className="icon-google-plus" /></a></li>
                <li><a href="#"><span className="icon-instagram" /></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <br></br>
  <br></br>
  <br></br>
  <div className="col-md-12 text-center heading-section">
              <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '700' }} >TÌM HIỂU NỘI DUNG KHÓA HUẤN LUYỆN THỰC HÀNH</h2>
            </div>
</section>
      <section
        className="ftco-section testimony-section"
        style={{ background: "white" }}
      >
        <div style={{ background: "none" }} className="overlay" />
        <div className="container wow animate__animated animate__fadeIn">
        <div className="row">
  <div className="col-md-4">
    <div className="training-item">
      <div 
        className="training-img"
        style={{ backgroundImage: `url("/images/skillcapcuu.jpg")` }}
      />
      <h3 className="training-title">Kỹ năng sơ cấp cứu ban đầu</h3>
    </div>
  </div>

  <div className="col-md-4">
    <div className="training-item">
      <div 
        className="training-img"
        style={{ backgroundImage: `url("/images/skillbatcoc.jpg")` }}
      />
      <h3 className="training-title">Kỹ năng phòng, chống bắt cóc và xâm hại trẻ em</h3>
    </div>
  </div>

  <div className="col-md-4">
    <div className="training-item">
      <div 
        className="training-img"
        style={{ backgroundImage: `url("/images/skillhoahoan.jpg")` }}
      />
      <h3 className="training-title">Phòng, chống hỏa hoạn & thoát hiểm trong đám cháy</h3>
    </div>
  </div>

  <div className="col-md-4">
    <div className="training-item">
      <div 
        className="training-img"
        style={{ backgroundImage: `url("/images/skilltunoi.jpg")` }}
      />
      <h3 className="training-title">Kĩ năng tự nổi</h3>
    </div>
  </div>

  <div className="col-md-4">
    <div className="training-item">
      <div 
        className="training-img"
        style={{ backgroundImage: `url("/images/skilldiengiat.jpg")` }}
      />
      <h3 className="training-title">Phòng, chống và xử lý tai nạn điện giật</h3>
    </div>
  </div>

  <div className="col-md-4">
    <div className="training-item">
      <div 
        className="training-img"
        style={{ backgroundImage: `url("/images/skillngodoc.jpg")` }}
      />
      <h3 className="training-title">Kỹ năng phòng, chống ngộ độc</h3>
    </div>
  </div>
</div>
        </div>
        <div className="container">
          <div className="row  justify-content-center">
            <div className="col-md-7">
              <div className="carousel-testimony owl-carousel ftco-owl">
                <div className="item">
                  <div className="testimony-wrap text-center">
                    <div className="text p-3">
                      <p className="mb-4">
                       
                      </p>
                      <div
                        className="user-img mb-4"
                        style={{ backgroundImage: "url(images/person_1.jpg)" }}
                      >
                        <span className="quote d-flex align-items-center justify-content-center">
                          <i className="fa fa-quote-left" />
                        </span>
                      </div>
                      <p className="name"></p>
                      <span className="position"></span>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="testimony-wrap text-center">
                    <div className="text p-3">
                      <p className="mb-4">
                        
                      </p>
                      <div
                        className="user-img mb-4"
                        style={{ backgroundImage: "url(images/person_1.jpg)" }}
                      >
                        <span className="quote d-flex align-items-center justify-content-center">
                          <i className="fa fa-quote-left" />
                        </span>
                      </div>
                      <p className="name"> </p>
                      <span className="position"></span>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="testimony-wrap text-center">
                    <div className="text p-3">
                      <p className="mb-4">
                    
                      </p>
                      <div
                        className="user-img mb-4"
                        style={{ backgroundImage: "url(images/person_1.jpg)" }}
                      >
                        <span className="quote d-flex align-items-center justify-content-center">
                          <i className="fa fa-quote-left" />
                        </span>
                      </div>
                      <p className="name"> </p>
                      <span className="position"></span>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="testimony-wrap text-center">
                    <div className="text p-3">
                      <p className="mb-4">
                       
                      </p>
                      <div
                        className="user-img mb-4"
                        style={{ backgroundImage: "url(images/person_1.jpg)" }}
                      >
                        <span className="quote d-flex align-items-center justify-content-center">
                          <i className="fa fa-quote-left" />
                        </span>
                      </div>
                      <p className="name"> </p>
                      <span className="position"></span>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="testimony-wrap text-center">
                    <div className="text p-3">
                      <p className="mb-4">
                     
                      </p>
                      <div
                        className="user-img mb-4"
                        style={{ backgroundImage: "url(images/person_1.jpg)" }}
                      >
                        <span className="quote d-flex align-items-center justify-content-center">
                          <i className="fa fa-quote-left" />
                        </span>
                      </div>
                      <p className="name"> </p>
                      <span className="position"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="register-section">
  <h2>Đăng ký khóa học</h2>
  <form className="register-form">
    <input type="text" name="name" placeholder="Họ tên *" required />
    <input type="email" name="email" placeholder="Email *" required />
    <input type="tel" name="phone" placeholder="Điện thoại *" required />
    <select name="course" required>
      <option value="">- Chọn Khóa Học -</option>
      <option value="course1">-	KN phòng tránh, xử lý tình huống ngạt nước đuối nước</option>
      <option value="course2">-	KN phòng chống và xử lý khi xảy ra tai nạn giao thông</option>
      <option value="course2">-	KN phòng chống và xử lý khi có hoả hoạn</option>
      <option value="course2">-	KN phòng chống bắt cóc, xâm hại</option>
      <option value="course2">-	KN phòng chống bao lực học đường</option>
      <option value="course2">-	KN phòng chống và xử lý khi bị hóc, sặc dị vật đường thở</option>
      <option value="course2">-	KN sơ cấp cứu ban đầu theo tiêu chuẩn WHO</option>  
    </select>
    <textarea name="message" placeholder="Lời nhắn"></textarea>
    <button type="submit">Đăng ký</button>
  </form>
</section>
      <section className="ftco-section bg-light">
        <div className="container">
          <div className="row justify-content-center mb-5 pb-2">
            <div className="col-md-7 text-center heading-section ">
              <span className="subheading"></span>
              <h2 className="mb-4"></h2>
            </div>
          </div>
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
    </div>
  );
};

export default Home;
