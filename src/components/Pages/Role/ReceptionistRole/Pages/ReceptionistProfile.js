import React, { useState, useEffect } from "react";
import WithBootstrap from "../../../../../WithBoostrap.js";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ReceptionistProfile = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    userName: "",
    dob: "",
    gender: "",
    cccd: "",
    roles: [],
    restaurantID: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    email: "",
    fullName: "",
    dob: "",
    phoneNumber: "",
    role: "",
    restaurantID: "",
    gender: null,
  });
  const [restaurants, setRestaurants] = useState([]);
  const nav = useNavigate();

  const handleChangePw = () => {
    nav("/receptionist/changepw");
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("SEPuser"));
    const token = localStorage.getItem("SEPtoken");

    if (storedUser && storedUser.id) {
      axios
        .get(`https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/get-by-id?Id=${storedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const userData = response.data;
          // Đảm bảo roles luôn là một mảng
          userData.roles = Array.isArray(userData.roles)
            ? userData.roles
            : [userData.roles].filter(Boolean);
          setUser(userData);
          setUpdatedUser({
            fullName: userData.fullName || "",
            phoneNumber: userData.phoneNumber || "",
            dob: userData.dob || "",
            email: userData.email || "",
            // Lấy role đầu tiên từ mảng roles nếu có
            role:
              userData.roles && userData.roles.length > 0
                ? userData.roles[0]
                : "",
            restaurantID: userData.restaurantID || "",
            gender: userData.gender,
          });
        })
        .catch((error) => {
          console.error("There was an error fetching the user data!", error);
        });
    }
  }, []);

  const fetchRestaurants = async () => {
    const token = localStorage.getItem("SEPtoken");
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Restaurants/get-full",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSuccessed) {
        setRestaurants(response.data.resultObj);
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching the restaurants:", error);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const getRestaurantAddress = (restaurantID) => {
    const restaurant = restaurants.find(
      (rest) => rest.restaurantID === restaurantID
    );
    return restaurant ? restaurant.address : "Unknown";
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [id]:
        id === "restaurantID"
          ? parseInt(value, 10)
          : id === "phoneNumber"
          ? value.replace(/\D/g, "").slice(0, 10)
          : id === "gender"
          ? value === ""
            ? null
            : value === "true"
          : value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!updatedUser.fullName.trim()) {
      errors.fullName = "Họ và tên không được để trống";
    }

    if (!updatedUser.phoneNumber) {
      errors.phoneNumber = "Số điện thoại không được để trống";
    } else if (!/^\d{10}$/.test(updatedUser.phoneNumber)) {
      errors.phoneNumber = "Số điện thoại phải có đúng 10 chữ số";
    }

    if (!updatedUser.email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(updatedUser.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!updatedUser.dob) {
      errors.dob = "Ngày sinh không được để trống";
    }

    if (updatedUser.gender === null || updatedUser.gender === undefined) {
      errors.gender = "Vui lòng chọn giới tính";
    }

    return errors;
  };

  const handleUpdate = async () => {
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      // Hiển thị các lỗi
      Object.values(errors).forEach((error) => {
        toast.error(error);
      });
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem("SEPuser"));
    const token = localStorage.getItem("SEPtoken");
    if (storedUser && storedUser.id) {
      try {
        const updateData = {
          fullName: updatedUser.fullName,
          phoneNumber: updatedUser.phoneNumber,
          dob: updatedUser.dob,
          email: updatedUser.email,
          restaurantID: updatedUser.restaurantID,
          // Gửi role như một chuỗi đơn
          role: updatedUser.role,
          gender: updatedUser.gender,
          cccd: user.cccd,
        };

        // Gọi API cập nhật
        await axios.put(
          `https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/update?id=${storedUser.id}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json-patch+json",
            },
          }
        );

        // Sau khi cập nhật thành công, lấy lại thông tin mới
        const response = await axios.get(
          `https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/get-by-id?Id=${storedUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data;
        // Đảm bảo roles luôn là một mảng
        userData.roles = Array.isArray(userData.roles)
          ? userData.roles
          : [userData.roles].filter(Boolean);

        setUser(userData);
        setUpdatedUser({
          fullName: userData.fullName || "",
          phoneNumber: userData.phoneNumber || "",
          dob: userData.dob || "",
          email: userData.email || "",
          // Lấy role đầu tiên từ mảng roles nếu có
          role:
            userData.roles && userData.roles.length > 0
              ? userData.roles[0]
              : "",
          restaurantID: userData.restaurantID || "",
        });

        setIsEditing(false);
        console.log("User updated successfully");
        toast.success("Cập nhật thông tin thành công");
      } catch (error) {
        console.error("Error updating user:", error);
        toast.error("Lỗi khi cập nhật thông tin.Kiểm tra lại format");
      }
    }
  };

  const handleCancel = () => {
    setUpdatedUser({
      fullName: user.fullName || "",
      phoneNumber: user.phoneNumber || "",
      dob: user.dob || "",
      email: user.email || "",
      restaurantID: user.restaurantID || "",
      role: user.roles && user.roles.length > 0 ? user.roles[0] : "",
    });
    setIsEditing(false);
  };

  const labelStyle = {
    color: "#000",
    fontWeight: "bold",
  };

  return (
    <WithBootstrap>
      <ToastContainer
        style={{
          top: "80px",
          right: "20px",
        }}
        position="top-right"
        autoClose={1500}
      />
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0">Thông tin Nhân viên</h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label
                          htmlFor="fullName"
                          className="form-label"
                          style={labelStyle}
                        >
                          Họ và Tên
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            id="fullName"
                            value={updatedUser.fullName}
                            onChange={handleChange}
                            maxLength={40}
                          />
                        ) : (
                          <p>{user.fullName}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label
                          htmlFor="cccd"
                          className="form-label"
                          style={labelStyle}
                        >
                          Số CCCD/CMND
                        </label>
                        <p>{user.cccd || "Không có dữ liệu"}</p>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label
                          htmlFor="phoneNumber"
                          className="form-label"
                          style={labelStyle}
                        >
                          Số điện thoại
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            className="form-control"
                            id="phoneNumber"
                            value={updatedUser.phoneNumber}
                            onChange={handleChange}
                          />
                        ) : (
                          <p>{user.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label
                          htmlFor="email"
                          className="form-label"
                          style={labelStyle}
                        >
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={updatedUser.email}
                            onChange={handleChange}
                            maxLength={40}
                          />
                        ) : (
                          <p>{user.email || "Không có dữ liệu"}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label
                          htmlFor="dob"
                          className="form-label"
                          style={labelStyle}
                        >
                          Ngày sinh
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            className="form-control"
                            id="dob"
                            value={updatedUser.dob}
                            onChange={handleChange}
                          />
                        ) : (
                          <p>{user.dob ? user.dob.split("T")[0] : ""}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label
                          htmlFor="role"
                          className="form-label"
                          style={labelStyle}
                        >
                          Vai trò
                        </label>

                        <p>
                          {user.roles && user.roles.length > 0
                            ? user.roles.join(", ")
                            : "Không có dữ liệu"}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label
                          htmlFor="gender"
                          className="form-label"
                          style={labelStyle}
                        >
                          Giới tính
                        </label>
                        {isEditing ? (
                          <select
                            className="form-control"
                            id="gender"
                            value={
                              updatedUser.gender === null ||
                              updatedUser.gender === undefined
                                ? ""
                                : updatedUser.gender.toString()
                            }
                            onChange={handleChange}
                          >
                            <option>Chọn giới tính</option>
                            <option value="false">Nam</option>
                            <option value="true">Nữ</option>
                          </select>
                        ) : (
                          <p>
                            {user.gender !== null && user.gender !== undefined
                              ? user.gender === false
                                ? "Nam"
                                : "Nữ"
                              : "Không có dữ liệu"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label
                          htmlFor="restaurantID"
                          className="form-label"
                          style={labelStyle}
                        >
                          Nhân viên cơ sở
                        </label>

                        <p>
                          {getRestaurantAddress(user.restaurantID) ||
                            "Không có dữ liệu"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary me-2"
                          onClick={handleCancel}
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={handleUpdate}
                        >
                          Lưu
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary mr-1"
                          onClick={handleChangePw}
                        >
                          Đổi mật khẩu
                        </button>
                        <button
                          type="button"
                          className="btn btn-info"
                          onClick={handleEditClick}
                        >
                          Cập nhật
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WithBootstrap>
  );
};

export default ReceptionistProfile;
