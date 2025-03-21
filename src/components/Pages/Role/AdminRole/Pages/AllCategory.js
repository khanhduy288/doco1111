import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Pagination } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WithBootstrap from "../../../../../WithBoostrap";

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Categories/get-full"
      );
      console.log("Fetched categories:", response.data);
      if (response.data.isSuccessed) {
        const categories = response.data.resultObj;
        if (Array.isArray(categories)) {
          categories.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setCategories(categories);
        } else {
          console.error("Unexpected response data format:", categories);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the categories:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const token = getToken();
    if (!newCategoryName.trim()) {
      toast.error("Tên loại món không được để trống");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newCategoryName);

      console.log("Sending category data:", formData.get("name"));

      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Categories/add",
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
        await fetchCategories();
        toast.success("Thêm loại món thành công");
        setNewCategoryName("");
        setModalVisible(false);
      } else {
        toast.error("Thêm loại món thất bại: Phản hồi không mong đợi");
        console.error("Unexpected response", response.data);
      }
    } catch (error) {
      toast.error(
        "Lỗi khi thêm loại món. Loại món đã tồn tại hoặc có lỗi " +
          error.message
      );
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const token = getToken();
    try {
      const response = await axios.delete(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Categories/delete?id=${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data === true) {
        await fetchCategories();
        toast.success("Xóa loại món thành công");
      } else {
        toast.error("Xóa loại món thất bại: " + response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa loại món: " + error.message);
      console.error("Error deleting category:", error);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditModalVisible(true);
  };

  const handleUpdateCategory = async () => {
    const token = getToken();
    if (!editingCategory.name.trim()) {
      toast.error("Tên loại món không được để trống");
      return;
    }

    try {
      const response = await axios.put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Categories/update?id=${editingCategory.idCategory}`,
        {
          idCategory: editingCategory.idCategory,
          name: editingCategory.name,
          createdAt: editingCategory.createdAt,
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
        await fetchCategories();
        toast.success("Cập nhật loại món thành công");
        setEditModalVisible(false);
        setEditingCategory(null);
      } else {
        toast.error("Cập nhật loại món thất bại: Phản hồi không mong đợi");
        console.error("Unexpected response", response.data);
      }
    } catch (error) {
      toast.error(
        "Lỗi khi cập nhật loại món. Loại món đã tồn tại hoặc có lỗi " +
          error.message
      );
      console.error("Error updating category:", error);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  const confirmDelete = (categoryId) => {
    toast.warn(
      <div>
        <p>Bạn có chắc chắn muốn xóa loại món này?</p>
        <Button onClick={() => handleDeleteCategory(categoryId)}>
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
        <h3>Tất cả loại món ăn</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-6">
              <Button
                type="button"
                className="btn btn-warning"
                onClick={() => setModalVisible(true)}
              >
                Thêm loại món mới
              </Button>
              <Modal
                title="Thêm loại món mới"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                  <Button key="back" onClick={() => setModalVisible(false)}>
                    Đóng
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={handleAddCategory}
                  >
                    Thêm
                  </Button>,
                ]}
              >
                <label className="text-dark">Nhập tên loại món *</label>
                <Input
                  placeholder="Nhập tên loại món"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </Modal>
            </div>
            <div className="col-lg-6">
              <Input.Search
                placeholder="Tìm loại món"
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
                  <th scope="col">Loại món ăn</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category, index) => (
                  <tr key={category.idCategory}>
                    <th scope="row">{index + 1}</th>
                    <td>{category.name}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleEditCategory(category)}
                      >
                        Sửa
                      </button>
                      {/* <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => confirmDelete(category.idCategory)}
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
            total={filteredCategories.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <Modal
        title="Sửa loại món"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingCategory(null);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setEditModalVisible(false);
              setEditingCategory(null);
            }}
          >
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateCategory}>
            Cập nhật
          </Button>,
        ]}
      >
        <label className="text-dark">Nhập tên loại món *</label>
        <Input
          placeholder="Nhập tên loại món"
          value={editingCategory ? editingCategory.name : ""}
          onChange={(e) =>
            setEditingCategory({
              ...editingCategory,
              name: e.target.value,
            })
          }
        />
      </Modal>
    </WithBootstrap>
  );
};

export default AllCategories;
