import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchUserData = () => {
    const storedUser = JSON.parse(localStorage.getItem("SEPuser"));
    const token = localStorage.getItem("SEPtoken");

    if (storedUser && storedUser.id) {
      axios
        .get(
          `https://projectsep490g64summer24backend.azurewebsites.net/api/User/get-by-id?Id=${storedUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          const userData = response.data;
          setUser({
            fullName: userData.fullName,
            email: userData.email,
            phoneNumber: userData.phoneNumber || "",
            dateOfBirth: userData.dob || "",
            gender: userData.gender,
          });
        })
        .catch((error) => {
          console.error("There was an error fetching the user data!", error);
          toast.error("Không thể tải thông tin người dùng.");
        });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!user.fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
    }

    if (!user.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!validateEmail(user.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (user.phoneNumber && !/^\d{10}$/.test(user.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có đúng 10 chữ số";
    }

    if (!user.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh không được để trống";
    }

    if (user.gender === null) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]:
        name === "phoneNumber"
          ? value.replace(/\D/g, "").slice(0, 10)
          : name === "gender"
          ? value === "true"
          : value,
    }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleUpdate = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (validateForm()) {
      const storedUser = JSON.parse(localStorage.getItem("SEPuser"));
      const token = localStorage.getItem("SEPtoken");

      if (storedUser && storedUser.id) {
        const updateData = {
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber || null,
          dob: user.dateOfBirth || null,
          gender: user.gender,
        };

        axios
          .put(
            `https://projectsep490g64summer24backend.azurewebsites.net/api/User/update?id=${storedUser.id}`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            console.log("User updated successfully:", response.data);
            setIsEditing(false);
            toast.success("Cập nhật thông tin thành công!");
            fetchUserData();
          })
          .catch((error) => {
            console.error("There was an error updating the user data!", error);
            if (
              error.response &&
              error.response.data &&
              error.response.data.errors
            ) {
              const errorMessages = Object.values(
                error.response.data.errors
              ).flat();
              errorMessages.forEach((message) => toast.error(message));
            } else {
              toast.error("Có lỗi xảy ra khi cập nhật thông tin.");
            }
          });
      }
    } else {
      // Hiển thị tất cả các lỗi
      Object.values(errors).forEach((error) => {
        if (error) toast.error(error);
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    fetchUserData();
  };

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <ToastContainer
        style={{
          top: "80px",
          right: "20px",
        }}
        position="top-right"
        autoClose={1500}
      />
      <Card
        className="p-1"
        style={{
          width: "600px",
          borderRadius: "20px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Card.Body>
          <Card.Title
            className="text-center mb-4"
            style={{ fontSize: "24px", fontWeight: "bold" }}
          >
            THÔNG TIN CÁ NHÂN
          </Card.Title>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group controlId="fullName">
                  <Form.Label className="text-dark">Họ và Tên</Form.Label>
                  {isEditing ? (
                    <>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={user.fullName}
                        onChange={handleInputChange}
                        isInvalid={!!errors.fullName}
                        maxLength={40}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fullName}
                      </Form.Control.Feedback>
                    </>
                  ) : (
                    <p>{user.fullName}</p>
                  )}
                </Form.Group>
                <Form.Group controlId="email">
                  <Form.Label className="text-dark">Email</Form.Label>
                  {isEditing ? (
                    <>
                      <Form.Control
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleInputChange}
                        isInvalid={!!errors.email}
                        maxLength={40}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </>
                  ) : (
                    <p>{user.email}</p>
                  )}
                </Form.Group>
                <Form.Group controlId="gender">
                  <Form.Label className="text-dark">Giới tính</Form.Label>
                  {isEditing ? (
                    <>
                      <Form.Control
                        as="select"
                        name="gender"
                        value={
                          user.gender === null ? "" : user.gender.toString()
                        }
                        onChange={handleInputChange}
                        isInvalid={!!errors.gender}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="false">Nam</option>
                        <option value="true">Nữ</option>
                      </Form.Control>
                      <Form.Control.Feedback type="invalid">
                        {errors.gender}
                      </Form.Control.Feedback>
                    </>
                  ) : (
                    <p>
                      {user.gender === null
                        ? "Chưa cập nhật"
                        : user.gender
                        ? "Nữ"
                        : "Nam"}
                    </p>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="phoneNumber">
                  <Form.Label className="text-dark">Số điện thoại</Form.Label>
                  {isEditing ? (
                    <>
                      <Form.Control
                        type="text"
                        name="phoneNumber"
                        value={user.phoneNumber}
                        onChange={handleInputChange}
                        isInvalid={!!errors.phoneNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phoneNumber}
                      </Form.Control.Feedback>
                    </>
                  ) : (
                    <p>{user.phoneNumber || "Chưa cập nhật"}</p>
                  )}
                </Form.Group>
                <Form.Group controlId="dateOfBirth">
                  <Form.Label className="text-dark">Ngày sinh</Form.Label>
                  {isEditing ? (
                    <>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={user.dateOfBirth || ""}
                        onChange={handleInputChange}
                        isInvalid={!!errors.dateOfBirth}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dateOfBirth}
                      </Form.Control.Feedback>
                    </>
                  ) : (
                    <p>
                      {user.dateOfBirth
                        ? user.dateOfBirth.split("T")[0]
                        : "" || "Chưa cập nhật"}
                    </p>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <div className="text-center mt-4">
              {isEditing ? (
                <>
                  <Button
                    variant="outline-secondary"
                    onClick={handleCancel}
                    className="mb-2"
                  >
                    Hủy
                  </Button>
                  <Button variant="outline-primary" onClick={handleSave}>
                    Lưu thông tin
                  </Button>
                </>
              ) : (
                <Button variant="outline-dark" onClick={handleUpdate}>
                  Sửa thông tin
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
