import React, { useState, useEffect } from "react";
import { Input, Pagination, Button, Modal } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WithBootstrap from "../../../../../WithBoostrap";

const AllCustomer = () => {
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchCustomer = async () => {
    const token = getToken();
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/User/paging",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        {
          params: {
            pageSize: 100,
            pageIndex: currentPage,
            name: null,
          },
        }
      );
      console.log("Fetched customer:", response.data);
      if (response.data.isSuccessed) {
        const filteredCustomer = response.data.resultObj.items
          .filter((member) =>
            member.roles.some((role) => ["Customer"].includes(role))
          )
          .map((customer) => ({
            ...customer,
            isBanned: customer.status === 1,
          }));
        setCustomer(filteredCustomer);
        setTotalRecord(filteredCustomer.length);
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the customer:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [currentPage, pageSize]);

  const filteredCustomer = customer.filter((member) =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserBan = async (userId, currentBanStatus) => {
    try {
      const token = getToken();
      console.log(token);

      const response = await axios.put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/User/${userId}/ban`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSuccessed) {
        setCustomer((prevCustomers) =>
          prevCustomers.map((customer) =>
            customer.id === userId
              ? {
                  ...customer,
                  isBanned: !currentBanStatus,
                  status: currentBanStatus ? 0 : 1,
                }
              : customer
          )
        );
        toast.success(
          `Người dùng đã được ${
            currentBanStatus ? "bỏ cấm" : "cấm"
          } thành công.`
        );
        // Gọi lại API để cập nhật danh sách người dùng
        fetchCustomer();
      } else {
        toast.error(
          `Không thể ${currentBanStatus ? "bỏ cấm" : "cấm"} người dùng.`
        );
      }
    } catch (error) {
      console.error(
        `Lỗi khi ${currentBanStatus ? "bỏ cấm" : "cấm"} người dùng:`,
        error
      );
      toast.error(
        `Có lỗi xảy ra khi ${currentBanStatus ? "bỏ cấm" : "cấm"} người dùng.`
      );
    }
  };

  const showUserDetails = async (userId) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/User/get-by-id?Id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedUserDetails(response.data);
      setIsDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Lỗi khi lấy thông tin chi tiết khách hàng");
    }
  };
  const handleModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedUserDetails(null);
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
        <h3>Danh sách khách hàng</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-6">
              <Input.Search
                placeholder="Tìm kiếm khách hàng"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomer.map((member, index) => (
                  <tr key={member.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{member.fullName}</td>
                    <td>{member.userName}</td>
                    <td>{member.email}</td>
                    <td>{member.phoneNumber}</td>
                    <td>
                      {" "}
                      {/* <Button
                        type="default"
                        style={{
                          marginRight: "10px",
                          backgroundColor: "#6c757d",
                          borderColor: "#6c757d",
                          color: "#fff",
                        }}
                        onClick={() => showUserDetails(member.id)}
                      >
                        Chi tiết
                      </Button> */}
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
          {selectedUserDetails && (
            <div>
              <p>
                <strong>Họ và tên:</strong> {selectedUserDetails.fullName}
              </p>
              <p>
                <strong>Tên đăng nhập:</strong> {selectedUserDetails.userName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUserDetails.email}
              </p>
              <p>
                <strong>Số điện thoại:</strong>{" "}
                {selectedUserDetails.phoneNumber}
              </p>
              <p>
                <strong>Ngày sinh:</strong>{" "}
                {selectedUserDetails.dob.split("T")[0]}
              </p>
              <p>
                <strong>Giới tính:</strong>{" "}
                {selectedUserDetails.gender ? "Nữ" : "Nam"}
              </p>
              <p>
                <strong>Số CCCD/CMND:</strong>{" "}
                {selectedUserDetails.cccd || "Không có dữ liệu"}
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

export default AllCustomer;
