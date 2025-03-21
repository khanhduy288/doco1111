import React, { useState, useEffect } from "react";
import { Input, Pagination, Button, Modal, Form, Select } from "antd";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WithBootstrap from "../../../../../WithBoostrap";

const AllStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchStaff = async () => {
    const token = getToken();
    console.log("Fetching staff with selectedRestaurant:", selectedRestaurant);
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/paging",
        {
          params: {
            pageSize: pageSize,
            pageIndex: currentPage,
            name: null,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched staff:", response.data);
      if (response.data.isSuccessed) {
        const filteredStaff = response.data.resultObj.items
          .filter((member) =>
            member.roles.some((role) =>
              ["Receptionist", "Waiter", "Manager"].includes(role)
            )
          )
          .map((staff) => ({
            ...staff,
            isBanned: staff.status === 1,
          }));
        setStaff(filteredStaff);
        setTotalRecord(response.data.resultObj.totalRecords);
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the staff:", error);
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    const token = getToken();
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
    fetchStaff();
  }, [currentPage, pageSize, searchTerm, selectedRole, selectedRestaurant]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const getRestaurantAddress = (restaurantID) => {
    const restaurant = restaurants.find(
      (rest) => rest.restaurantID === restaurantID
    );
    return restaurant ? restaurant.address : "Unknown";
  };

  const getFilteredStaff = () => {
    return staff.filter((member) => {
      const nameMatch = member.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const roleMatch = selectedRole
        ? member.roles.includes(selectedRole)
        : true;
      const restaurantMatch = selectedRestaurant
        ? member.restaurantID.toString() === selectedRestaurant.toString()
        : true;
      return nameMatch && roleMatch && restaurantMatch;
    });
  };

  const filteredStaff = getFilteredStaff();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhoneNumber = (phoneNumber) => {
    return phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);
  };

  const validateCCCD = (cccd) => {
    return cccd.length === 12 && /^\d+$/.test(cccd);
  };

  const handleAddStaff = async (values) => {
    const token = getToken();

    if (!validateEmail(values.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    if (!validatePhoneNumber(values.phoneNumber)) {
      toast.error("Số điện thoại phải có đủ 10 chữ số");
      return;
    }

    if (!validateCCCD(values.cccd)) {
      toast.error("CCCD phải có đủ 12 chữ số");
      return;
    }
    try {
      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/create",
        {
          ...values,
          gender: values.gender === "true",
          restaurantID: values.restaurantID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data === true) {
        toast.success("Thêm nhân viên thành công");
        fetchStaff();
        setIsModalVisible(false);
      } else {
        toast.error("Thêm nhân viên thất bại");
        console.error("Thêm nhân viên thất bại:", response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi thêm nhân viên:", error);
      toast.error("Lỗi khi thêm nhân viên");
    }
  };

  const handleEditClick = (member) => {
    setEditingStaff({ ...member, restaurantID: member.restaurantID });
    setIsEditModalVisible(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;
    const token = getToken();

    // Kiểm tra các trường bắt buộc
    const requiredFields = [
      "email",
      "fullName",
      "phoneNumber",
      "roles",
      "restaurantID",
      "cccd",
    ];

    for (const field of requiredFields) {
      if (!editingStaff[field]) {
        toast.error(`Vui lòng điền đầy đủ thông tin ${field}`);
        return;
      }
    }

    if (!validateEmail(editingStaff.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    if (!validatePhoneNumber(editingStaff.phoneNumber)) {
      toast.error("Số điện thoại phải có đủ 10 chữ số");
      return;
    }

    if (!validateCCCD(editingStaff.cccd)) {
      toast.error("CCCD phải có đủ 12 chữ số");
      return;
    }

    try {
      const response = await axios.put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/update?id=${editingStaff.id}`,
        {
          email: editingStaff.email,
          fullName: editingStaff.fullName,
          dob: editingStaff.dob,
          phoneNumber: editingStaff.phoneNumber,
          role: editingStaff.roles[0],
          restaurantID: editingStaff.restaurantID,
          gender: editingStaff.gender,
          cccd: editingStaff.cccd,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data === true) {
        toast.success("Cập nhật nhân viên thành công");
        fetchStaff();
        setIsEditModalVisible(false);
        setEditingStaff(null);
      } else {
        toast.error("Cập nhật nhân viên thất bại");
        console.error("Cập nhật nhân viên thất bại:", response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật nhân viên:", error);
      toast.error("Lỗi khi cập nhật nhân viên");
    }
  };
  
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    setCurrentPage(1);
  };

  const toggleUserBan = async (staffId, currentBanStatus) => {
    const token = getToken();
    try {
      console.log(token);

      const response = await axios.put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/${staffId}/ban`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSuccessed) {
        setStaff((prevStaffs) =>
          prevStaffs.map((staff) =>
            staff.id === staffId
              ? {
                  ...staff,
                  isBanned: !currentBanStatus,
                  status: currentBanStatus ? 0 : 1,
                }
              : staff
          )
        );
        toast.success(
          `Nhân viên đã được ${currentBanStatus ? "bỏ cấm" : "cấm"} thành công.`
        );
        fetchStaff();
      } else {
        toast.error(
          `Không thể ${currentBanStatus ? "bỏ cấm" : "cấm"} nhân viên.`
        );
      }
    } catch (error) {
      console.error(
        `Lỗi khi ${currentBanStatus ? "bỏ cấm" : "cấm"} nhân viên:`,
        error
      );
      toast.error(
        `Có lỗi xảy ra khi ${currentBanStatus ? "bỏ cấm" : "cấm"} nhân viên.`
      );
    }
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
      setIsDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching staff details:", error);
      toast.error("Lỗi khi lấy thông tin chi tiết nhân viên");
    }
  };
  const handleModalClose = () => {
    setIsDetailModalVisible(false);
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
        <h3>Danh sách nhân viên</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-3">
              <Button
                type="button"
                className="btn btn-warning"
                onClick={() => setIsModalVisible(true)}
              >
                Thêm nhân viên
              </Button>
              <Modal
                title="Thêm nhân viên mới"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
              >
                <Form onFinish={handleAddStaff}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Vui lòng nhập email",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="userName"
                    label="Tên đăng nhập"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên đăng nhập",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu" },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                    name="dob"
                    label="Ngày sinh"
                    rules={[
                      { required: true, message: "Vui lòng nhập ngày sinh" },
                    ]}
                  >
                    <Input type="date" />
                  </Form.Item>
                  <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="role"
                    label="Vai trò"
                    rules={[
                      { required: true, message: "Vui lòng chọn vai trò" },
                    ]}
                  >
                    <Select>
                      <Select.Option value="Receptionist">
                        Receptionist
                      </Select.Option>
                      <Select.Option value="Waiter">Waiter</Select.Option>
                      <Select.Option value="Manager">Manager</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[
                      { required: true, message: "Vui lòng chọn giới tính" },
                    ]}
                  >
                    <Select>
                      <Select.Option value={true}>Nam</Select.Option>
                      <Select.Option value={false}>Nữ</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="cccd"
                    label="CCCD"
                    rules={[{ required: true, message: "Vui lòng nhập CCCD" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="restaurantID"
                    label="Nhân viên nhà hàng"
                    rules={[
                      { required: true, message: "Vui lòng chọn nhà hàng" },
                    ]}
                  >
                    <Select>
                      {restaurants.map((restaurant) => (
                        <Select.Option
                          key={restaurant.restaurantID}
                          value={restaurant.restaurantID}
                        >
                          {restaurant.address}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Thêm nhân viên
                    </Button>
                  </Form.Item>
                </Form>
              </Modal>
            </div>
            <div className="col-lg-3">
              <Input.Search
                placeholder="Tìm kiếm nhân viên"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
              />
            </div>
            <div className="col-lg-3">
              <select
                className="form-select-sm"
                aria-label="Sort by role"
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Waiter">Waiter</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="col-lg-3">
              <select
                className="form-select-sm"
                aria-label="Sort by restaurant"
                value={selectedRestaurant}
                onChange={(e) => handleRestaurantChange(e.target.value)}
              >
                <option value="">Tất cả nhà hàng</option>
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
                  <th scope="col">Vai trò</th>
                  <th scope="col">Nhà hàng</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member, index) => (
                  <tr key={member.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{member.fullName}</td>
                    <td>{member.userName}</td>
                    <td>{member.email}</td>
                    <td>{member.roles.join(", ")}</td>
                    <td>{getRestaurantAddress(member.restaurantID)}</td>
                    <td>
                      <Button
                        type="primary"
                        style={{ marginRight: "10px" }}
                        onClick={() => showStaffDetails(member.id)}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        type="default"
                        style={{
                          marginRight: "10px",
                          backgroundColor: "#6c757d",
                          borderColor: "#6c757d",
                          color: "#fff",
                        }}
                        onClick={() => handleEditClick(member)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="primary"
                        danger={!member.isBanned}
                        onClick={() =>
                          toggleUserBan(member.id, member.isBanned)
                        }
                      >
                        {member.isBanned ? "Bỏ cấm" : "Cấm"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <Modal
                title="Sửa thông tin nhân viên"
                visible={isEditModalVisible}
                onCancel={() => {
                  setIsEditModalVisible(false);
                  setEditingStaff(null);
                }}
                footer={[
                  <Button
                    key="back"
                    onClick={() => {
                      setIsEditModalVisible(false);
                      setEditingStaff(null);
                    }}
                  >
                    Đóng
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={handleUpdateStaff}
                  >
                    Cập nhật
                  </Button>,
                ]}
              >
                {editingStaff && (
                  <>
                    <div>
                      <label className="text-dark">Nhập Email (*):</label>
                      <Input
                        value={editingStaff.email}
                        onChange={(e) =>
                          setEditingStaff({
                            ...editingStaff,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-dark">Nhập Họ và tên (*):</label>
                      <Input
                        value={editingStaff.fullName}
                        onChange={(e) =>
                          setEditingStaff({
                            ...editingStaff,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-dark">Nhập Ngày sinh (*):</label>
                      <Input
                        type="date"
                        value={editingStaff.dob}
                        onChange={(e) =>
                          setEditingStaff({
                            ...editingStaff,
                            dob: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-dark">
                        Nhập Số điện thoại (*):
                      </label>
                      <Input
                        value={editingStaff.phoneNumber}
                        onChange={(e) =>
                          setEditingStaff({
                            ...editingStaff,
                            phoneNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mt-3 ">
                      <label className="text-dark">Chọn Vai trò (*):</label>
                      <Select
                        value={editingStaff.roles[0]}
                        onChange={(value) =>
                          setEditingStaff({ ...editingStaff, roles: [value] })
                        }
                      >
                        <Select.Option value="Receptionist">
                          Receptionist
                        </Select.Option>
                        <Select.Option value="Waiter">Waiter</Select.Option>
                        <Select.Option value="Manager">Manager</Select.Option>
                      </Select>
                    </div>
                    <div className="mt-3">
                      <label className="text-dark">Giới tính:</label>
                      <Select
                        value={editingStaff.gender}
                        onChange={(value) =>
                          setEditingStaff({ ...editingStaff, gender: value })
                        }
                      >
                        <Select.Option value={false}>Nam</Select.Option>
                        <Select.Option value={true}>Nữ</Select.Option>
                      </Select>
                    </div>
                    <div className="mt-3">
                      <label className="text-dark">CCCD:</label>
                      <Input
                        value={editingStaff.cccd}
                        onChange={(e) =>
                          setEditingStaff({
                            ...editingStaff,
                            cccd: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mt-3">
                      <label className="text-dark">
                        Nhân viên nhà hàng (*):
                      </label>
                      <Select
                        value={editingStaff.restaurantID}
                        onChange={(value) =>
                          setEditingStaff({
                            ...editingStaff,
                            restaurantID: value,
                          })
                        }
                      >
                        {restaurants.map((restaurant) => (
                          <Select.Option
                            key={restaurant.restaurantID}
                            value={restaurant.restaurantID}
                          >
                            {restaurant.name} - {restaurant.address}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  </>
                )}
              </Modal>
            </table>
          )}
        </div>
        <Modal
          title="Chi tiết nhân viên"
          visible={isDetailModalVisible}
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
                <strong>Ngày sinh:</strong>{" "}
                {selectedStaffDetails.dob.split("T")[0]}
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
                {getRestaurantAddress(selectedStaffDetails.restaurantID)}
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
            total={filteredStaff.length}
            onChange={(page) => setCurrentPage(page)}
            onShowSizeChange={(current, size) => setPageSize(size)}
          />
        </div>
      </div>
    </WithBootstrap>
  );
};

export default AllStaff;
