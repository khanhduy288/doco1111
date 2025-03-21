import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <>
  <footer className="ftco-footer ftco-no-pb ftco-section">
    <div className="container">
      <div className="row mb-5">
        {/* Cột logo & mạng xã hội */}
        <div className="col-md-6 col-lg-3 d-flex flex-column align-items-between">
          <div className="ftco-footer-widget mb-4 text-between">
            <h2 className="ftco-heading-2">Taste.it</h2>
            <ul className="ftco-footer-social list-unstyled mt-3 d-flex justify-content-center">
              <li className="mr-3">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                  <span className="fa fa-instagram" />
                </a>
              </li>                                     
              <li className="mr-3">
                <a href="https://www.facebook.com/profile.php?id=61573711116533" target="_blank" rel="noopener noreferrer">
                  <span className="fa fa-facebook" />
                </a>
              </li>
              <li className="mr-3">
                <a href="https://www.youtube.com/@safedu-antoanviet" target="_blank" rel="noopener noreferrer">
                  <span className="fa fa-youtube" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Cột hình ảnh */}
        <div className="col-md-6 col-lg-3">
          <div className="ftco-footer-widget mb-4">
            <h2 className="ftco-heading-2">Hình Ảnh</h2>
            <div className="thumb d-sm-flex">
              <a href="#" className="thumb-menu img" style={{ backgroundImage: "url(images/skill-1.jpg)" }}></a>
              <a href="#" className="thumb-menu img" style={{ backgroundImage: "url(images/chef-4.jpg)" }}></a>
              <a href="#" className="thumb-menu img" style={{ backgroundImage: "url(images/skill-1.jpg)" }}></a>
            </div>
            <div className="thumb d-flex">
              <a href="#" className="thumb-menu img" style={{ backgroundImage: "url(images/chef-4.jpg)" }}></a>
              <a href="#" className="thumb-menu img" style={{ backgroundImage: "url(images/skill-1.jpg)" }}></a>
              <a href="#" className="thumb-menu img" style={{ backgroundImage: "url(images/chef-4.jpg)" }}></a>
            </div>
          </div>
        </div>

        {/* Cột thông tin liên hệ */}
        <div className="col-md-6 col-lg-3">
          <div className="ftco-footer-widget mb-4">
            <h2 className="ftco-heading-2">Liên Hệ</h2>
            <ul className="list-unstyled">
              <li><span className="fa fa-envelope"></span> Email: vp.vienkhgdat@gmail.com</li>
              <li><span className="fa fa-phone"></span> Số điện thoại: 098 522 1159</li>
              <li><span className="fa fa-globe"></span> Website: viengiaoducantoan.edu.vn</li>
              <li><span className="fa fa-map-marker"></span>A2 D6, Ngõ 5, Thọ Tháp, Dịch Vọng, Cầu Giấy, Hà Nội </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    {/* Dòng chữ bản quyền */}
    <div className="container-fluid px-0 bg-primary py-3">
      <div className="row no-gutters">
        <div className="col-md-12 text-center">
          <p className="mb-0">SAFEDU VN</p>
        </div>
      </div>
    </div>
  </footer>
    </>
  );
};

export default Footer;
