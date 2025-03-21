import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Pagination, Select } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WithBootstrap from "../../../../../WithBoostrap";

const AllArea = () => {
  const [areas, setAreas] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newRestaurantID, setNewRestaurantID] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchAreas = async () => {
    const token = getToken();
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Areas/get-full",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSuccessed) {
        let areas = response.data.resultObj;
        if (Array.isArray(areas)) {
          areas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAreas(areas);
        } else {
          console.error("Unexpected response data format:", areas);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the areas:", error);
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
    fetchAreas();
    fetchRestaurants();
  }, []);

  const handleAddArea = async () => {
    const token = getToken();
    if (!newAreaName.trim() || !newRestaurantID) {
      toast.error("Tên Khu vực và  cơ sở không được để trống");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("areaName", newAreaName);
      formData.append("restaurantID", newRestaurantID);

      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Areas/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data === true) {
        await fetchAreas();
        toast.success("Thêm mới khu vực thành công");
        setNewAreaName("");
        setNewRestaurantID("");
        setModalVisible(false);
      } else {
        toast.error("Lỗi trong việc thêm khu vực: Unexpected response");
      }
    } catch (error) {
      toast.error(
        "Thêm khu vực thất bại. Khu vực đã tồn tại hoặc có lỗi " + error.message
      );
      console.error("Error adding area:", error);
    }
  };

  const handleDeleteArea = async (areaID) => {
    const token = getToken();
    try {
      const response = await axios.delete(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Areas/delete?id=${areaID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data === true) {
        await fetchAreas();
        toast.success("Xóa khu vực thành công");
      } else {
        console.error("Failed to delete area:", response.data.message);
        toast.error("Xóa khu vực thất bại: " + response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa khu vực: " + error.message);
      console.error("Error deleting area:", error);
    }
  };

  const handleEditArea = (area) => {
    setEditingArea(area);
    setEditModalVisible(true);
  };

  const handleUpdateArea = async () => {
    const token = getToken();
    if (
      !editingArea ||
      !editingArea.areaName.trim() ||
      !editingArea.restaurantID
    ) {
      toast.error("Tên Khu vực và cơ sở không được để trống");
      return;
    }

    try {
      const response = await axios.put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Areas/update?id=${editingArea.areaID}`,
        {
          areaID: editingArea.areaID,
          areaName: editingArea.areaName,
          restaurantID: editingArea.restaurantID,
          createdAt: editingArea.createdAt,
          updatedAt: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json-patch+json",
          },
        }
      );

      if (response.data === true) {
        await fetchAreas();
        toast.success("Cập nhật khu vực thành công");
        setEditModalVisible(false);
        setEditingArea(null);
      } else {
        toast.error("Cập nhật khu vực thất bại: Unexpected response");
      }
    } catch (error) {
      toast.error(
        "Cập nhật khu vực thất bại. Khu vực đã tồn tại hoặc có lỗi " +
          error.message
      );
      console.error("Error updating area:", error);
    }
  };

  const filteredAreas = areas.filter((area) =>
    area.areaName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRestaurantAddress = (restaurantID) => {
    const restaurant = restaurants.find(
      (rest) => rest.restaurantID === restaurantID
    );
    return restaurant ? restaurant.address : "Unknown";
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAreas = filteredAreas.slice(startIndex, endIndex);

  const confirmDelete = (areaID) => {
    toast.warn(
      <div>
        <p>Bạn có chắc chắn muốn xóa khu vực này?</p>
        <Button onClick={() => handleDeleteArea(areaID)}>Xác nhận</Button>
        <Button onClick={() => toast.dismiss()}>Hủy</Button>
      </div>,
      { autoClose: 3000, closeOnClick: true, draggable: false }
    );
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
        <h3>Tất cả khu vực</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-6">
              <Button
                type="button"
                className="btn btn-warning"
                onClick={() => setModalVisible(true)}
              >
                Thêm khu vực mới
              </Button>
              <Modal
                title="Thêm khu vực mới"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                  <Button key="back" onClick={() => setModalVisible(false)}>
                    Đóng
                  </Button>,
                  <Button key="submit" type="primary" onClick={handleAddArea}>
                    Thêm
                  </Button>,
                ]}
              >
                <label className="text-dark">Chọn nhà hàng *</label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Chọn nhà hàng"
                  value={newRestaurantID}
                  onChange={(value) => setNewRestaurantID(value)}
                >
                  {restaurants.map((restaurant) => (
                    <Select.Option
                      key={restaurant.restaurantID}
                      value={restaurant.restaurantID}
                    >
                      {restaurant.address}
                    </Select.Option>
                  ))}
                </Select>
                <label className="text-dark">Nhập tên khu vực *</label>
                <Input
                  placeholder="Nhập tên khu vực"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  maxLength={60}
                />
              </Modal>
            </div>
            <div className="col-lg-6">
              <Input.Search
                placeholder="Tìm khu vực "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="table-responsive">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">STT</th>
                  <th scope="col">Tên khu vực</th>
                  <th scope="col">Địa chỉ nhà hàng</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentAreas.map((area, index) => (
                  <tr key={area.areaID}>
                    <th scope="row">{index + 1}</th>
                    <td>{area.areaName}</td>
                    <td>{getRestaurantAddress(area.restaurantID)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleEditArea(area)}
                      >
                        Sửa
                      </button>
                      {/* <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => confirmDelete(area.areaID)}
                      >
                        Xóa
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div
          className="pagination-container"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredAreas.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <Modal
        title="Sửa khu vực"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingArea(null);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setEditModalVisible(false);
              setEditingArea(null);
            }}
          >
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateArea}>
            Cập nhật
          </Button>,
        ]}
      >
        <label className="text-dark">Chọn nhà hàng *</label>
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn nhà hàng"
          value={editingArea ? editingArea.restaurantID : ""}
          onChange={(value) =>
            setEditingArea({
              ...editingArea,
              restaurantID: value,
            })
          }
        >
          {restaurants.map((restaurant) => (
            <Select.Option
              key={restaurant.restaurantID}
              value={restaurant.restaurantID}
            >
              {restaurant.address}
            </Select.Option>
          ))}
        </Select>
        <label className="text-dark">Nhập tên khu vực *</label>
        <Input
          placeholder="Nhập tên khu vực"
          value={editingArea ? editingArea.areaName : ""}
          onChange={(e) =>
            setEditingArea({
              ...editingArea,
              areaName: e.target.value,
            })
          }
        />
      </Modal>
    </WithBootstrap>
  );
};

export default AllArea;
