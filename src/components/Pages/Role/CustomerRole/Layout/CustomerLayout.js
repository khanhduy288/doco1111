import React from "react";
import SiderComponent from "./Sider";
import { Outlet } from "react-router-dom";
const CustomerLayout = () => {
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
              <h1 className="mb-2 bread">Hồ sơ</h1>
              <p className="breadcrumbs">
                <span className="mr-2">
                  <a href="index.html">
                    Trang chủ <i className="fa fa-chevron-right" />
                  </a>
                </span>{" "}
                <span>
                  Hồ sơ <i className="fa fa-chevron-right" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-fluid mt-5 mb-5">
        <div className="row flex-column flex-md-row">
          <div className="col-12 col-md-4 col-lg-2 sidebar-wrapper">
            <SiderComponent />
          </div>
          <main className="col-12 col-md-8 col-lg-10 px-md-4">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default CustomerLayout;
