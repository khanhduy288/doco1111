import React, { useState, useEffect } from "react";
import WithBootstrap from "../../../../../WithBoostrap.js";
import { Input, Pagination, Button, Modal } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [currentStaff, setCurrentStaff] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  useEffect(() => {
    const token = getToken();
    const storedUser = JSON.parse(localStorage.getItem("SEPuser"));

    // Fetch current staff information
    if (storedUser && storedUser.id) {
      axios
        .get(`https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/get-by-id?Id=${storedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setCurrentStaff(response.data);
          // After getting staff info, fetch staff for their restaurant
          fetchStaff(response.data.restaurantID);
        })
        .catch((error) => {
          console.error("Error fetching staff information:", error);
          toast.error("Lỗi khi lấy thông tin nhân viên");
        });
    }

    axios
      .get("https://projectsep490g64summer24backend.azurewebsites.net/api/Restaurants/get-full", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.isSuccessed) {
          setRestaurants(response.data.resultObj);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the restaurants!", error);
        toast.error("Lỗi khi lấy danh sách nhà hàng");
      });
  }, []);

  const fetchStaff = async (restaurantID) => {
    try {
      const token = getToken();
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/paging",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            pageSize: 100,
            pageIndex: currentPage,
            name: null,
            role: selectedRole || null,
          },
        }
      );
      console.log("Fetched staff:", response.data);
      if (response.data.isSuccessed) {
        const filteredStaff = response.data.resultObj.items.filter(
          (member) =>
            member.restaurantID === restaurantID &&
            member.roles.some((role) =>
              ["Receptionist", "Waiter", "Manager"].includes(role)
            )
        );
        setStaff(filteredStaff);
        setTotalRecord(filteredStaff.length);
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the staff:", error);
      toast.error("Lỗi khi lấy danh sách nhân viên");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStaff) {
      fetchStaff(currentStaff.restaurantID);
    }
  }, [currentPage, pageSize, selectedRole, currentStaff]);

  const filteredStaff = staff.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedRole === "" || member.roles.includes(selectedRole))
  );

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentStaffList = filteredStaff.slice(startIndex, endIndex);

  const getRestaurantName = (id) => {
    const restaurant = restaurants.find((r) => r.restaurantID === id);
    return restaurant ? restaurant.address : "Unknown";
  };

  const showStaffDetails = async (staffId) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/get-by-id?Id=${staffId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedStaffDetails(response.data);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching staff details:", error);
      toast.error("Lỗi khi lấy thông tin chi tiết nhân viên");
    }
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedStaffDetails(null);
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
      <div className="main">
        <h3>
          Danh sách nhân viên - Cơ sở{" "}
          {currentStaff && getRestaurantName(currentStaff.restaurantID)}
        </h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-6">
              <Input.Search
                placeholder="Tìm kiếm nhân viên"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-lg-6">
              <select
                className="form-select-sm"
                aria-label="Sort by role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Waiter">Waiter</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">STT</th>
                  <th scope="col">Họ và tên</th>
                  <th scope="col">Tên đăng nhập</th>
                  <th scope="col">Email</th>
                  <th scope="col">Số điện thoại</th>
                  <th scope="col">Vai trò</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentStaffList.map((member, index) => (
                  <tr key={member.id}>
                    <th scope="row">{startIndex + index + 1}</th>
                    <td>{member.fullName}</td>
                    <td>{member.userName}</td>
                    <td>{member.email}</td>
                    <td>{member.phoneNumber}</td>
                    <td>{member.roles.join(", ")}</td>
                    <td>
                      {" "}
                      <Button
                        type="primary"
                        onClick={() => showStaffDetails(member.id)}
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Modal
          title="Chi tiết nhân viên"
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Đóng
            </Button>,
          ]}
        >
          {selectedStaffDetails && (
            <div>
              <p>
                <strong>Họ và tên:</strong> {selectedStaffDetails.fullName}
              </p>
              <p>
                <strong>Tên đăng nhập:</strong> {selectedStaffDetails.userName}
              </p>
              <p>
                <strong>Email:</strong> {selectedStaffDetails.email}
              </p>
              <p>
                <strong>Số điện thoại:</strong>{" "}
                {selectedStaffDetails.phoneNumber}
              </p>
              <p>
                <strong>Ngày sinh:</strong> {selectedStaffDetails.dob.split("T")[0]}
              </p>
              <p>
                <strong>Giới tính:</strong>{" "}
                {selectedStaffDetails.gender ? "Nữ" : "Nam"}
              </p>
              <p>
                <strong>Số CCCD/CMND:</strong> {selectedStaffDetails.cccd}
              </p>
              <p>
                <strong>Vai trò:</strong>{" "}
                {selectedStaffDetails.roles.join(", ")}
              </p>
              <p>
                <strong>Nhà hàng:</strong>{" "}
                {getRestaurantName(selectedStaffDetails.restaurantID)}
              </p>
            </div>
          )}
        </Modal>
        <div
          className="pagination-container"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalRecord}
            onChange={(page) => setCurrentPage(page)}
            onShowSizeChange={(current, size) => setPageSize(size)}
          />
        </div>
      </div>
    </WithBootstrap>
  );
};

export default ListStaff;
