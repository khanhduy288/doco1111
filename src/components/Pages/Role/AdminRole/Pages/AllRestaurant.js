import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Pagination } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WithBootstrap from "../../../../../WithBoostrap";

const AllRestaurant = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRestaurantAddress, setNewRestaurantAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Restaurants/get-full"
      );
      console.log("Fetched Restaurant:", response.data);
      if (response.data.isSuccessed) {
        let restaurants = response.data.resultObj;
        if (Array.isArray(restaurants)) {
          restaurants.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setRestaurants(restaurants);
        } else {
          console.error("Unexpected response data format:", restaurants);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the restaurants:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const handleAddRestaurant = async () => {
    const token = getToken();
    if (!newRestaurantAddress.trim()) {
      toast.error("Địa chỉ cơ sở không được để trống");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("address", newRestaurantAddress);

      console.log("Sending restaurant data:", formData.get("address"));

      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Restaurants/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Full response:", response);

      if (response.data === true) {
        const newRestaurant = {
          restaurantID: response.data.restaurantID,
          address: newRestaurantAddress,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setRestaurants([newRestaurant, ...restaurants]);
        // await fetchRestaurant();
        toast.success("Thêm thành công cơ sở");
        setNewRestaurantAddress("");
        setModalVisible(false);
      } else {
        toast.error("Thêm cơ sở mới thất bại: Unexpected response");
        console.error("Unexpected response", response.data);
      }
    } catch (error) {
      toast.error(
        "Thêm cơ sở mới thất bại. Cơ sở đã tồn tại hoặc có lỗi " + error.message
      );
      console.error("Error adding restaurant:", error);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    const token = getToken();
    console.log("Deleting restaurant with ID:", restaurantId);

    try {
      const response = await axios.delete(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Restaurants/delete?id=${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data === true) {
        await fetchRestaurant();
        toast.success("Xóa cơ sở thành công");
      } else {
        console.error("Failed to delete restaurant:", response.data.message);
        toast.error("Xóa cơ sở thất bại: " + response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa cơ sở: " + error.message);
      console.error("Error deleting restaurant:", error);
    }
  };

  const filteredRestaurant = restaurants.filter((restaurant) =>
    restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditRestaurant = (restaurant) => {
    console.log("Editing restaurant:", restaurant);
    setEditingRestaurant(restaurant);
    setEditModalVisible(true);
  };

  const handleUpdateRestaurant = async () => {
    const token = getToken();
    if (!editingRestaurant || !editingRestaurant.address.trim()) {
      toast.error("Địa chỉ cơ sở không được để trống");
      return;
    }

    console.log("Updating restaurant:", editingRestaurant);

    try {
      const response = await axios.put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Restaurants/update?id=${editingRestaurant.restaurantID}`,
        {
          restaurantID: editingRestaurant.restaurantID,
          address: editingRestaurant.address,
          createdAt: editingRestaurant.createdAt,
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
        await fetchRestaurant();
        toast.success("Cập nhật cơ sở thành công");
        setEditModalVisible(false);
        setEditingRestaurant(null);
      } else {
        toast.error("Cập nhật cơ sở thất bại: Unexpected response");
        console.error("Unexpected response", response.data);
      }
    } catch (error) {
      toast.error(
        "Cập nhật cơ sở thất bại. Cơ sở đã tồn tại hoặc có lỗi " + error.message
      );
      console.error("Error updating restaurant:", error);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRestaurants = filteredRestaurant.slice(startIndex, endIndex);

  const confirmDelete = (restaurantId) => {
    toast.warn(
      <div>
        <p>Bạn có chắc chắn muốn xóa cơ sở này?</p>
        <Button onClick={() => handleDeleteRestaurant(restaurantId)}>
          Xác nhận
        </Button>
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
        <h3>Tất cả cơ sở</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-6">
              <Button
                type="button"
                className="btn btn-warning"
                onClick={() => setModalVisible(true)}
              >
                Thêm cơ sở mới
              </Button>
              <Modal
                title="Thêm cơ sở mới"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                  <Button key="back" onClick={() => setModalVisible(false)}>
                    Đóng
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={handleAddRestaurant}
                  >
                    Thêm
                  </Button>,
                ]}
              >
                <label className="text-dark">Nhập địa chỉ *</label>
                <Input
                  placeholder="Nhập địa chỉ của cơ sở mới"
                  value={newRestaurantAddress}
                  onChange={(e) => setNewRestaurantAddress(e.target.value)}
                />
              </Modal>
            </div>
            <div className="col-lg-6">
              <Input.Search
                placeholder="Tìm cơ sở "
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
                  <th scope="col">Địa chỉ</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentRestaurants.map((restaurant, index) => (
                  <tr key={restaurant.idRestaurant}>
                    <th scope="row">{index + 1}</th>
                    <td>{restaurant.address}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleEditRestaurant(restaurant)}
                      >
                        Sửa
                      </button>
                      {/* <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => confirmDelete(restaurant.restaurantID)}
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
            total={filteredRestaurant.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <Modal
        title="Sửa cơ sở"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRestaurant(null);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setEditModalVisible(false);
              setEditingRestaurant(null);
            }}
          >
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateRestaurant}>
            Cập nhật
          </Button>,
        ]}
      >
        <label className="text-dark">Nhập địa chỉ *</label>
        <Input
          placeholder="Nhập địa chỉ của cơ sở"
          value={editingRestaurant ? editingRestaurant.address : ""}
          onChange={(e) =>
            setEditingRestaurant({
              ...editingRestaurant,
              address: e.target.value,
            })
          }
        />
      </Modal>
    </WithBootstrap>
  );
};

export default AllRestaurant;
