import "animate.css/animate.min.css";
import WOW from "wow.js";
import { useEffect } from "react";

const Contact = () => {
  useEffect(() => {
    new WOW().init();
  }, []);
  return (
    <>
      <section
        className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: 'url("images/bg_5.jpg")' }}
        data-stellar-background-ratio="0.5"
      >
        <div className="overlay" />
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center">
            <div className="col-md-9 wow animate__animated animate__fadeUp text-center mb-5">
              <h1 className="mb-2 bread">Liên hệ với chúng tôi</h1>
              <p className="breadcrumbs">
                <span className="mr-2">
                  <a href="index.html">
                    Trang chủ <i className="fa fa-chevron-right" />
                  </a>
                </span>{" "}
                <span>
                  Liên hệ với chúng tôi <i className="fa fa-chevron-right" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="ftco-section contact-section bg-light">
        <div className="container">
          <div className="row d-flex contact-info">
            <div className="col-md-12">
              <h2 className="h4 font-weight-bold">Thông tin liên hệ</h2>
            </div>
            <div className="w-100" />
            <div className="col-md-3 mb-2 d-flex">
              <div className="dbox">
                <p>
                  <span>Địa chỉ 1:</span>  A2 D6, Ngõ 5, Thọ Tháp, Dịch Vọng, Cầu Giấy, Hà Nội
                </p>
              </div>
            </div>
            <div className="col-md-3 mb-2 d-flex">
              <div className="dbox">
                <p>
                  <span>Số điện thoại:</span> 
                  <a href="tel://1234567920"> 098 522 1159</a>
                </p>
              </div>
            </div>
            <div className="col-md-3 mb-2 d-flex">
              <div className="dbox">
                <p>
                  <span>Email:</span>{" "}
                  <a href="mailto:info@yoursite.com">vp.vienkhgdat@gmail.com</a>
                </p>
              </div>
            </div>
            <div className="col-md-3 mb-2 d-flex">
              <div className="dbox">
                <p>
                  <span>Fanpage</span>{" "}
                  <a href="https://www.facebook.com/visafe.edu.vn" target="_blank">
                  https://www.facebook.com/visafe.edu.vn
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
