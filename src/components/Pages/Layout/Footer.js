import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faGlobe, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <>
      <footer className="ftco-footer bg-dark text-white py-5">
        <div className="container">
          <div className="row">
            {/* Column for Company Info */}
            <div className="col-md-4 mb-4">
              <h5 className="ftco-heading-2">About Us</h5>
              <h6 style={{ color: 'white' }}>
              We will provide you with a trustworthy and fair playground. Have fun!
              </h6>            </div>

            {/* Column for Customer Service */}
            <div className="col-md-4 mb-4">
              <h5 className="ftco-heading-2">Customer Service</h5>
              <ul className="list-unstyled">
                <li><a href="#" className="text-white">Contact Us</a></li>
                <li><a href="#" className="text-white">FAQ</a></li>
                <li><a href="#" className="text-white">Shipping Info</a></li>
                <li><a href="#" className="text-white">Returns & Exchanges</a></li>
              </ul>
            </div>

            {/* Column for Contact Info */}
            <div className="col-md-4 mb-4">
              <h5 className="ftco-heading-2">Contact Us</h5>
              <ul className="list-unstyled">
                <li><FontAwesomeIcon icon={faEnvelope} /> Email: support@shopname.com</li>
                <li><FontAwesomeIcon icon={faPhone} /> Phone: +1 (123) 456-7890</li>
                <li><FontAwesomeIcon icon={faGlobe} /> Website: www.shopname.com</li>
                <li><FontAwesomeIcon icon={faMapMarkerAlt} /> Address: 123 Main Street, City, Country</li>
              </ul>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12 text-center">
              <ul className="ftco-footer-social list-unstyled d-flex justify-content-center">
                <li className="mr-3">
                  <a href="https://www.instagram.com"  target="_blank" rel="noopener noreferrer" className="social-link">
                    <FontAwesomeIcon icon={faInstagram} className="text-white" />
                  </a>
                </li>
                <li className="mr-3">
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FontAwesomeIcon icon={faFacebook} className="text-white" />
                  </a>
                </li>
                <li className="mr-3">
                  <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FontAwesomeIcon icon={faYoutube} className="text-white" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="bg-dark py-3">
          <div className="container text-center">
            <p className="mb-0">&copy; 2025 ShopName - All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
