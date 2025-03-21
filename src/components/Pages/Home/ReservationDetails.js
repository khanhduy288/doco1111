import React, { useState, useEffect, useContext } from "react";
import {
  Layout,
  Row,
  Col,
  Button,
  Table,
  Form,
  Radio,
  Typography,
  Card,
  Select,
} from "antd";
import "./ReservationDetails.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { CartContext } from "../Cart/CartContext";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const columns = [
  { title: "STT", dataIndex: "stt", key: "stt" },
  { title: "Món ăn", dataIndex: "monAn", key: "monAn" },
  { title: "Giá", dataIndex: "gia", key: "gia" },
  { title: "SL(đĩa)", dataIndex: "sl", key: "sl" },
  { title: "Tiền", dataIndex: "tien", key: "tien" },
];

const ReservationDetail = () => {
  const nav = useNavigate();
  const [paymentOption, setPaymentOption] = useState("noDeposit");
  const [depositPercentage, setDepositPercentage] = useState(null);

  const [reservationData, setReservationData] = useState({});
  const [cart, setCart] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const isCartEmpty = cart.length === 0;
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    const savedReservationData = JSON.parse(
      localStorage.getItem("reservationData")
    );
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    setReservationData(savedReservationData);
    setCart(savedCart);
  }, []);

  useEffect(() => {
    const savedReservationData =
      JSON.parse(localStorage.getItem("reservationData")) || {};
    const savedRestaurants =
      JSON.parse(localStorage.getItem("restaurants")) || [];
    setReservationData(savedReservationData);
    setRestaurants(savedRestaurants);
  }, []);

  const getRestaurantAddress = (restaurantID) => {
    if (!restaurants || restaurants.length === 0) return "Đang tải...";
    const restaurant = restaurants.find((r) => r.restaurantID === restaurantID);
    return restaurant ? restaurant.address : "Không xác định";
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vnp_ResponseCode = urlParams.get("vnp_ResponseCode");

    if (vnp_ResponseCode) {
      const confirmPayment = async () => {
        try {
          const response = await axios.get(
            "https://localhost:7050/api/VNPay/PaymentConfirm",
            {
              params: Object.fromEntries(urlParams),
            }
          );
          if (response.data && response.data.success) {
            Swal.fire({
              title: "Thanh toán thành công",
              text: "Đơn đặt bàn của bạn đã được xác nhận",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              nav("/");
            });
          } else {
            toast.error(
              "Xác nhận thanh toán thất bại. Vui lòng liên hệ hỗ trợ."
            );
          }
        } catch (error) {
          console.error("Error confirming payment:", error);
          toast.error(
            "Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại sau."
          );
        }
      };

      confirmPayment();
    }
  }, [nav]);

  useEffect(() => {
    if (isCartEmpty) {
      setPaymentOption("noDeposit");
      setDepositPercentage(null);
    }
  }, [isCartEmpty]);

  const handleConfirmOrder = async () => {
    if (paymentOption === "deposit" && !depositPercentage) {
      toast.error("Vui lòng chọn phần trăm cọc trước khi thanh toán.");
      return;
    }
    const orderData = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderID: 0,
      restaurantID: reservationData.restaurantID,
      userName: reservationData.name,
      priceTotal: totalAmount,
      description: "",
      numberOfCustomer: reservationData.guestCount,
      tableID: 0,
      payment: amountToPay,
      vat: 0,
      phone: reservationData.phone,
      status: 0,
      date: new Date(reservationData.date).toISOString(),
      time: reservationData.time,
      deposit: paymentOption === "deposit",
      orderDetailDtos: cart.map((item) => ({
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderID: 0,
        price: item.price,
        description: "",
        dishID: item.dishId,
        date: new Date(reservationData.date).toISOString(),
        numberOfCustomer: reservationData.guestCount,
        tableID: 0,
        payment: 0,
        quantity: item.quantity,
        id: 0,
        tableNumber: 0,
      })),
    };

    try {
      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Order/post",
        orderData
      );
      console.log("Order created:", response.data);
      clearCart();
      Swal.fire({
        title: "Đặt Bàn Thành Công",
        text: "Vui lòng chờ xác nhận đơn hàng từ bên nhà hàng thông qua Số điện thoại đã đặt bàn",
        icon: "success",
        confirmButtonText: "Thoát",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then((result) => {
        if (result.isConfirmed) {
          nav("/");
        }
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleVNPayPayment = async () => {
    if (paymentOption === "vnpay" && !depositPercentage) {
      toast.error("Vui lòng chọn phần trăm cọc trước khi thanh toán.");
      return;
    }

    const orderData = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderID: 0,
      restaurantID: reservationData.restaurantID,
      userName: reservationData.name,
      priceTotal: totalAmount,
      description: "",
      numberOfCustomer: reservationData.guestCount,
      tableID: 0,
      payment: amountToPay,
      vat: 0,
      phone: reservationData.phone,
      status: 0,
      date: new Date(reservationData.date).toISOString(),
      time: reservationData.time,
      deposit: true,
      orderDetailDtos: cart.map((item) => ({
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderID: 0,
        price: item.price,
        description: "",
        dishID: item.dishId,
        date: new Date(reservationData.date).toISOString(),
        numberOfCustomer: reservationData.guestCount,
        tableID: 0,
        payment: 0,
        quantity: item.quantity,
        id: 0,
        tableNumber: 0,
      })),
    };

    try {
      const response = await axios.post(
        "https://localhost:7050/api/VNPay",
        orderData
      );
      if (response.data && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error(
          "Không thể tạo liên kết thanh toán VNPay. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error("Error creating VNPay payment:", error);
      toast.error(
        "Có lỗi xảy ra khi tạo thanh toán VNPay. Vui lòng thử lại sau."
      );
    }
  };

  const handlePaymentOptionChange = (e) => {
    setPaymentOption(e.target.value);
    if (e.target.value !== "deposit" && e.target.value !== "vnpay") {
      setDepositPercentage(null);
    }
  };

  const handleDepositPercentageChange = (value) => {
    setDepositPercentage(value);
  };

  const handleBackReservation = () => {
    nav("/reservation");
  };

  // Tính tổng số tiền các món trong giỏ hàng
  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Tính số tiền cần thanh toán dựa trên tùy chọn cọc trước
  const amountToPay =
    paymentOption === "deposit" ||
    (paymentOption === "vnpay" && depositPercentage)
      ? totalAmount * (depositPercentage / 100)
      : 0;

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  const dataSource = cart.map((item, index) => ({
    key: index.toString(),
    stt: index + 1,
    monAn: truncateText(item.name, 10),
    gia: `${item.price}đ`,
    sl: item.quantity,
    tien: `${item.price * item.quantity}đ`,
  }));

  return (
    <>
      <ToastContainer />
      <section
        className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: 'url("images/bg_5.jpg")' }}
        data-stellar-background-ratio="0.5"
      >
        <div className="overlay" />
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center">
            <div className="col-md-9 wow animate__animated animate__fadeIn text-center mb-5">
              <h1 className="mb-2 bread">Chi tiết đơn đặt bàn</h1>
              <p className="breadcrumbs">
                <span className="mr-2">
                  <a href="index.html">
                    Trang chủ <i className="fa fa-chevron-right" />
                  </a>
                </span>{" "}
                <span>
                  Chi tiết đơn đặt bàn <i className="fa fa-chevron-right" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Layout>
        <div className="container">
          <Content style={{ maxWidth: "1200px" }}>
            <Title level={2} className="text-center">
              CHI TIẾT ĐƠN ĐẶT BÀN
            </Title>
            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24} sm={4}>
                <Button
                  type="primary"
                  className="mb-4"
                  onClick={handleBackReservation}
                >
                  Quay lại
                </Button>
              </Col>
              <Col xs={24} sm={20}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card title="Thông tin đặt hàng" className="mb-3">
                      <Text>Tên người đặt: {reservationData.name}</Text>
                      <br />
                      <Text>
                        Số lượng khách : {reservationData.guestCount} người
                      </Text>
                      <br />
                      <Text>Điện thoại: {reservationData.phone}</Text>
                      <br />
                      <Text>
                        Thời gian dùng bữa: {reservationData.date} (
                        {reservationData.time} giờ)
                      </Text>
                      <br />
                      <Text>
                        Địa điểm dùng bữa:
                        {getRestaurantAddress(reservationData.restaurantID)}
                      </Text>
                    </Card>
                    <Card title="Thực đơn đặt trước">
                      <div className="responsive-table">
                        <Table
                          dataSource={dataSource}
                          columns={columns}
                          pagination={false}
                        />
                      </div>
                      <Text>
                        <strong>Tổng cộng:</strong> {totalAmount}đ
                      </Text>
                      <br />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card title="THANH TOÁN">
                      <Text>
                        <strong>Số tiền cần thanh toán:</strong> {amountToPay}đ
                      </Text>
                      <Form>
                        <Form.Item name="paymentOption">
                          <Radio.Group
                            onChange={handlePaymentOptionChange}
                            value={paymentOption}
                            defaultValue="noDeposit"
                          >
                            <Radio value="noDeposit">Không cọc</Radio>
                            <Form.Item>
                              <Text type="secondary">
                                - 10 phút tính từ thời gian dùng bữa nếu không
                                nhận bàn, bạn sẽ bị hủy
                              </Text>
                            </Form.Item>
                            {!isCartEmpty && (
                              <>
                                <Radio value="deposit">
                                  Cọc trước 1 phần (chuyển khoản)
                                </Radio>
                                <Form.Item>
                                  <Text type="secondary">
                                    - Quyền lợi: Cọc trước sẽ được giữ bàn trong
                                    30p tính từ thời gian dùng bữa
                                  </Text>
                                </Form.Item>
                                <Radio value="vnpay">Cọc bằng VNPay</Radio>
                                <Form.Item>
                                  <Text type="secondary">
                                    - Thanh toán an toàn và nhanh chóng qua
                                    VNPay
                                  </Text>
                                </Form.Item>
                              </>
                            )}
                          </Radio.Group>
                        </Form.Item>
                        {paymentOption === "deposit" && (
                          <>
                            <Form.Item label="Chọn phần trăm cọc">
                              <Select
                                value={depositPercentage}
                                onChange={handleDepositPercentageChange}
                              >
                                <Option value={30}>30%</Option>
                              </Select>
                            </Form.Item>
                            <Card size="small" style={{ marginBottom: "16px" }}>
                              <Text>Chủ TK: PHUNG DUC DUNG</Text>
                              <br />
                              <Text>Số TK: 1902 6437 6070 11</Text>
                              <br />
                              <Text>Ngân hàng: TECHCOMBANK</Text>
                              <br />
                              <Text type="secondary">
                                -Quý khách vui lòng chuyển tiền tới số tk trên
                                sau đó ấn nút thanh toán
                              </Text>
                            </Card>
                          </>
                        )}
                        {paymentOption === "vnpay" && (
                          <Form.Item label="Chọn phần trăm cọc">
                            <Select
                              value={depositPercentage}
                              onChange={handleDepositPercentageChange}
                            >
                              <Option value={30}>30%</Option>
                            </Select>
                          </Form.Item>
                        )}
                        <Button
                          type="primary"
                          className="mt-3"
                          onClick={
                            paymentOption === "vnpay"
                              ? handleVNPayPayment
                              : handleConfirmOrder
                          }
                        >
                          {isCartEmpty
                            ? "Xác nhận đặt bàn"
                            : paymentOption === "vnpay"
                            ? "Thanh toán qua VNPay"
                            : paymentOption === "deposit"
                            ? "Xác nhận đặt cọc"
                            : "Xác nhận đặt bàn"}
                        </Button>
                      </Form>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Content>
        </div>
      </Layout>
    </>
  );
};

export default ReservationDetail;
