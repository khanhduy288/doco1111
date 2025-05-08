import "animate.css/animate.min.css";
import WOW from "wow.js";
import { useEffect, useState, useContext } from "react";
import "./Reservation.css";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../Cart/CartContext";
import axios from "axios";
import { useReservation } from "./ReservationContext";
import moment from "moment-timezone";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Reservation = () => {
  const location = useLocation();
  const initialCart = location.state?.cart || [];
  const showCart = location.state?.showCart || false;

  const [isTableVisible, setIsTableVisible] = useState(showCart);
  const { removeItem, clearCart } = useContext(CartContext);

  const [tableItems, setTableItems] = useState(initialCart);

  const { reservationData, setReservationData } = useReservation();
  const [restaurants, setRestaurants] = useState([]);

  const saveCartToLocalStorage = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const handleRemoveItem = (dishId) => {
    removeItem(dishId);
    const updatedItems = tableItems.filter((item) => item.dishId !== dishId);
    setTableItems(updatedItems);
    saveCartToLocalStorage(updatedItems);
  };

  const nav = useNavigate();
  const handleAddMoreDish = () => {
    nav("/menu");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservationData((prev) => {
      const newData = {
        ...prev,
        [name]: name === "restaurantID" ? parseInt(value, 10) : value,
      };

      // Reset time when date changes
      if (name === "date") {
        newData.time = "";
      }

      return newData;
    });
  };

  const handleGuestCountChange = (delta) => {
    setReservationData((prev) => ({
      ...prev,
      guestCount: Math.min(60, Math.max(1, prev.guestCount + delta)),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      { name: "name", label: "Họ tên" },
      { name: "phone", label: "Số điện thoại" },
      { name: "restaurantID", label: "Cơ sở" },
      { name: "guestCount", label: "Số lượng khách" },
      { name: "date", label: "Ngày" },
      { name: "time", label: "Giờ ăn" },
    ];

    let isValid = true;

    requiredFields.forEach((field) => {
      if (!reservationData[field.name]) {
        toast.error(`Vui lòng nhập ${field.label}`);
        isValid = false;
      }
    });

    if (reservationData.phone && reservationData.phone.length !== 10) {
      toast.error("Số điện thoại phải có đủ 10 số.");
      isValid = false;
    }

    if (isValid) {
      localStorage.setItem("reservationData", JSON.stringify(reservationData));
      localStorage.setItem("restaurants", JSON.stringify(restaurants));
      saveCartToLocalStorage(tableItems);
      nav("/reservationDetail");
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Restaurants/get-full"
      );
      if (response.data.isSuccessed && Array.isArray(response.data.resultObj)) {
        setRestaurants(response.data.resultObj);
      } else {
        console.error("Unexpected data structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  useEffect(() => {
    new WOW().init();
    fetchRestaurants();

    const userData = localStorage.getItem("SEPuser");
    if (userData) {
      const { fullName, phoneNumber } = JSON.parse(userData);
      setReservationData((prev) => ({
        ...prev,
        name: fullName,
        phone: phoneNumber,
      }));
    }
  }, []);

  const getMinDate = () => {
    const today = moment.tz("Asia/Ho_Chi_Minh");
    return today.format("YYYY-MM-DD");
  };

  const getMaxDate = () => {
    const today = moment.tz("Asia/Ho_Chi_Minh");
    today.add(2, "days");
    return today.format("YYYY-MM-DD");
  };

  const getValidTimes = () => {
    const now = moment.tz("Asia/Ho_Chi_Minh");
    const selectedDate = moment.tz(reservationData.date, "Asia/Ho_Chi_Minh");
    const isToday = selectedDate.isSame(now, "day");

    const times = [
      { value: "09:00", label: "09:00" },
      { value: "10:00", label: "10:00" },
      { value: "11:00", label: "11:00" },
      { value: "12:00", label: "12:00" },
      { value: "17:00", label: "17:00" },
      { value: "18:00", label: "18:00" },
      { value: "19:00", label: "19:00" },
    ];

    if (isToday) {
      return times.filter((time) => {
        const [hours, minutes] = time.value.split(":");
        const timeDate = moment.tz(
          {
            year: now.year(),
            month: now.month(),
            day: now.date(),
            hour: hours,
            minute: minutes,
          },
          "Asia/Ho_Chi_Minh"
        );
        return timeDate.isAfter(now);
      });
    }

    return times;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <section
        className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: 'url("images/bg_5.jpg")' }}
        data-stellar-background-ratio="0.5"
      >
        <div className="overlay" />
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center">
            <div className="col-md-9 wow animate__animated animate__fadeIn text-center mb-5">
              <h1 className="mb-2 bread">Đặt bàn luôn nào</h1>
              <p className="breadcrumbs">
                <span className="mr-2">
                  <a href="index.html">
                    Trang chủ <i className="fa fa-chevron-right" />
                  </a>
                </span>{" "}
                <span>
                  Đặt bàn <i className="fa fa-chevron-right" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ftco-section ftco-wrap-about ftco-no-pb ftco-no-pt">
        <div className="container">
          <div className="row no-gutters">
            <div className="col-sm-12 p-4 p-md-5 d-flex align-items-center justify-content-center bg-primary">
              <form action="#" className="appointment-form">
                <h3 className="mb-3">Thông tin đặt bàn</h3>
                <div className="row justify-content-center">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Họ tên</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Tên của bạn"
                        value={reservationData.name}
                        onChange={handleInputChange}
                        maxLength={40}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="Số điện thoại"
                        required
                        minLength="10"
                        maxLength="10"
                        value={reservationData.phone}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          handleInputChange({
                            target: {
                              name: "phone",
                              value: value,
                            },
                          });
                        }}
                        pattern="[0-9]{10}"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Chọn cơ sở</label>
                      <div className="form-field">
                        <div className="select-wrap">
                          <div className="icon">
                            <span className="fa fa-chevron-down" />
                          </div>
                          <select
                            name="restaurantID"
                            className="form-control"
                            required
                            value={reservationData.restaurantID}
                            onChange={handleInputChange}
                          >
                            <option value="">Chọn nhà hàng</option>
                            {restaurants.map((restaurant) => (
                              <option
                                key={restaurant.restaurantID}
                                value={restaurant.restaurantID}
                              >
                                {restaurant.address}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Số lượng khách</label>
                      <div class="">
                        <div class="qty-container">
                          <button
                            class="qty-btn-minus btn-light"
                            type="button"
                            onClick={() => handleGuestCountChange(-1)}
                          >
                            <i class="fa fa-minus"></i>
                          </button>
                          <input
                            type="number"
                            name="guestCount"
                            value={reservationData.guestCount}
                            onChange={handleInputChange}
                            className="input-qty"
                            maxLength={60}
                          />
                          <button
                            class="qty-btn-plus btn-light"
                            type="button"
                            onClick={() => handleGuestCountChange(1)}
                          >
                            <i class="fa fa-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Chọn ngày</label>
                      <div className="input-wrap">
                        <input
                          type="date"
                          name="date"
                          className="form-control book_date"
                          placeholder="Check-In"
                          required
                          value={reservationData.date}
                          onChange={handleInputChange}
                          min={getMinDate()}
                          max={getMaxDate()}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Giờ ăn</label>
                      <div className="form-field">
                        <div className="select-wrap">
                          <div className="icon">
                            <span className="fa fa-chevron-down" />
                          </div>
                          <select
                            name="time"
                            className="form-control"
                            value={reservationData.time}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Giờ đến</option>
                            {getValidTimes().map((time) => (
                              <option key={time.value} value={time.value}>
                                {time.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <input
                        type="button"
                        defaultValue="Đặt"
                        className="btn btn-white py-3 px-4"
                        onClick={handleSubmit}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {isTableVisible && (
        <div
          className="container"
          style={{ marginTop: "35px", marginBottom: "35px" }}
        >
          <div style={{ overflowX: "auto" }}>
            <h4 style={{ textAlign: "center" }}>THỰC ĐƠN THEO KÈM</h4>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">STT</th>
                  <th scope="col">Hình ảnh</th>
                  <th scope="col">Tên món</th>
                  <th scope="col">Số lượng</th>
                  <th scope="col">Giá</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {tableItems.map((item, index) => (
                  <tr key={item.dishId}>
                    <th scope="row">{index + 1}</th>
                    <td>
                      <img
                        src={item.image}
                        style={{ width: "50px", height: "auto" }}
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}đ</td>
                    <td>
                      {" "}
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleRemoveItem(item.dishId)}
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn btn-secondary m-2"
            onClick={handleAddMoreDish}
          >
            Thêm món
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              setTableItems([]);
              clearCart();
            }}
          >
            Xóa hết
          </button>
        </div>
      )}

      <section className="ftco-section">
        <div className="container">
          <div className="row d-flex">
            <div className="col-md-6 d-flex">
              <div
                className="img img-2 w-100 mr-md-2"
                style={{ backgroundImage: "url(images/bg_6.jpg)" }}
              />
              <div
                className="img img-2 w-100 ml-md-2"
                style={{ backgroundImage: "url(images/bg_4.jpg)" }}
              />
            </div>
            <div className="col-md-6 wow animate__animated animate__fadeIn makereservation p-4 p-md-5">
              <div className="heading-section wow animate__animated animate__fadeIn mb-5">
                <span className="subheading">Đây là bí mật của chúng tôi</span>
                <h2 className="mb-4">Thành phần hoàn hảo</h2>
                <p>
                  Nhà hàng của chúng tôi tự hào với thực đơn đa dạng, kết hợp
                  tinh hoa ẩm thực truyền thống và hiện đại. Từ hải sản tươi
                  ngon, thịt nướng thơm lừng đến các món thanh đạm, tất cả đều
                  được chế biến từ nguyên liệu tươi sạch và gia vị đặc biệt.
                </p>
                <p>
                  <a href="/menu" className="btn btn-primary">
                    Khám phá ngay
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

export default Reservation;
