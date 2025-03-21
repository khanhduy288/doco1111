import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Input, Button, Select, Upload, Pagination } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./Pages.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WithBootstrap from "../../../../../WithBoostrap";

const AllDish = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [currentDishDetails, setCurrentDishDetails] = useState(null);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get(
          "https://projectsep490g64summer24backend.azurewebsites.net/api/Categories/get-full"
        );
        if (response.data.isSuccessed) {
          const categories = response.data.resultObj;
          if (Array.isArray(categories)) {
            setCategories(categories);
            console.log("Categories loaded:", categories);
          } else {
            console.error(
              "Định dạng dữ liệu phản hồi không mong đợi:",
              categories
            );
          }
        }
      } catch (error) {
        console.error("Lỗi tìm nạp danh mục:", error);
      }
    };
    getCategories();
  }, []);

  const getCategoryName = (categoryID) => {
    const category = categories.find(
      (cat) => cat.idCategory === parseInt(categoryID, 10)
    );
    return category ? category.name : "Không xác định";
  };

  const fetchDishes = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Dishs/get-full"
      );
      if (response.data.isSuccessed) {
        const dishes = response.data.resultObj;
        if (Array.isArray(dishes)) {
          dishes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setDishes(dishes);
        } else {
          console.error("Unexpected response data format:", dishes);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the dishes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const handleDeleteDish = async (dishId) => {
    const token = getToken();
    try {
      const response = await axios.delete(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Dishs/delete?id=${dishId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data === true) {
        toast.success("Xóa món ăn thành công");
        setDishes(dishes.filter((dish) => dish.dishId !== dishId));
      } else {
        toast.error("Xóa món ăn thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi xóa món ăn:", error);
      toast.error("Đã xảy ra lỗi khi xóa món ăn");
    }
  };

  const compressImage = (file, maxWidth, maxHeight, quality) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            quality
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      const compressedBlob = await compressImage(file, 800, 600, 0.7);
      setImage(compressedBlob);
    } else {
      setImage(null);
    }
  };

  const handleAddDish = async () => {
    const token = getToken();
    const trimmedCategoryName = categoryName
      ? categoryName.trim()
      : "defaultCategoryName";
    console.log({
      name: name.trim(),
      price,
      description: description.trim(),
      type: type.trim(),
      categoryName: trimmedCategoryName,
      image,
      categoryId,
    });

    if (!image) {
      toast.error("Hãy chọn ảnh.");
      return;
    }

    if (
      !name.trim() ||
      !price ||
      !description.trim() ||
      !type.trim() ||
      !trimmedCategoryName ||
      !image ||
      !categoryId
    ) {
      toast.error("Hãy điền đầy đủ các trường.");
      return;
    }
    if (parseFloat(price) <= 0) {
      toast.error("Giá món phải lớn hơn 0");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", parseFloat(price));
      formData.append("description", description.trim());
      formData.append("type", type.trim());
      formData.append("categoryName", trimmedCategoryName);
      formData.append("categoryId", parseInt(categoryId, 10));

      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(image);
      });

      formData.append("image", base64Image);

      console.log("Sending dish data:", Object.fromEntries(formData.entries()));

      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Dishs/add",
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
        await fetchDishes();
        toast.success("Thêm món ăn thành công");
        setName("");
        setPrice("");
        setDescription("");
        setType("");
        setCategoryName("");
        setImage(null);
        setCategoryId(null);
        setModalVisible(false);
      } else {
        toast.error("Lỗi khi thêm món ăn: " + JSON.stringify(response.data));
        console.error("Unexpected response", response.data);
      }
    } catch (error) {
      toast.error(
        "Lỗi thêm món ăn. Món ăn đã tồn tại hoặc có lỗi " +
          (error.response?.data?.message || error.message)
      );
      console.error("Error adding dish:", error.response?.data || error);
    }
  };

  const filteredAndSortedDishes = dishes
    .filter(
      (dish) =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory
          ? dish.categoryID === parseInt(selectedCategory, 10)
          : true)
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.price - b.price;
      } else if (sortOrder === "desc") {
        return b.price - a.price;
      }
      return 0;
    });

  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setEditModalVisible(true);
  };

  const handleUpdateDish = async () => {
    const token = getToken();
    if (
      !editingDish.name.trim() ||
      !editingDish.price ||
      !editingDish.description.trim() ||
      !editingDish.type.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (parseFloat(editingDish.price) <= 0) {
      toast.error("Giá món phải lớn hơn 0");
      return;
    }

    try {
      let updatedDishData = {
        dishId: editingDish.dishId,
        name: editingDish.name.trim(),
        price: parseFloat(editingDish.price),
        description: editingDish.description.trim(),
        type: editingDish.type.trim(),
        categoryID: parseInt(editingDish.categoryID, 10),
        categoryName: editingDish.categoryName,
        createdAt: editingDish.createdAt,
        updatedAt: new Date().toISOString(),
        image: editingDish.image,
      };

      if (image) {
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(image);
        });
        updatedDishData.image = base64Image;
      }

      console.log("Sending update request with data:", updatedDishData);

      const response = await axios.put(
        `https://localhost:7050/api/Dishs/update?id=${editingDish.dishId}`,
        updatedDishData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json-patch+json",
          },
        }
      );

      console.log("Update response:", response);

      if (response.data === true) {
        await fetchDishes();
        toast.success("Cập nhật món ăn thành công");
        setEditModalVisible(false);
        setEditingDish(null);
        setImage(null);
      } else {
        toast.error("Cập nhật món ăn thất bại: Phản hồi không mong đợi");
        console.error("Phản hồi không mong đợi", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật món ăn:", error.response?.data || error);
      toast.error(
        "Lỗi khi cập nhật món ăn. Món ăn đã tồn tại hoặc có lỗi " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentDishs = filteredAndSortedDishes.slice(startIndex, endIndex);

  const confirmDelete = (dishId) => {
    toast.warn(
      <div>
        <p>Bạn có chắc chắn muốn xóa món ăn này?</p>
        <Button onClick={() => handleDeleteDish(dishId)}>Xác nhận</Button>
        <Button onClick={() => toast.dismiss()}>Hủy</Button>
      </div>,
      { autoClose: 3000, closeOnClick: true, draggable: false }
    );
  };

  const handleOpenDetails = async (dishId) => {
    try {
      const response = await axios.get(
        `https://localhost:7050/api/Dishs/get-by-id?id=${dishId}`
      );
      console.log("API response:", response.data);
      if (response.data && response.status === 200) {
        setCurrentDishDetails(response.data);
        setDetailsModalVisible(true);
      } else {
        toast.error("Failed to fetch dish details: " + response.data.message);
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching dish details:", error);
      toast.error("Error fetching dish details: " + error.message);
    }
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
        <h3>Tất cả món ăn</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-4">
              <Input.Search
                type="search"
                placeholder="Tìm món "
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-warning mt-2"
                onClick={() => setModalVisible(true)}
              >
                Thêm món mới
              </button>
            </div>
            <div className="col-lg-4">
              <select
                className="form-select-sm"
                aria-label="Sort by price"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="">Lọc theo giá</option>
                <option value="asc">Từ thấp đến cao</option>
                <option value="desc">Từ cao đến thấp</option>
              </select>
            </div>
            <div className="col-lg-4">
              <select
                className="form-select-sm"
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tất cả loại món ăn</option>
                {categories.map((category) => (
                  <option key={category.idCategory} value={category.idCategory}>
                    {category.name}
                  </option>
                ))}
              </select>
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

                  <th scope="col">Hình ảnh</th>
                  <th scope="col">Tên món</th>
                  <th scope="col">Loại món</th>
                  <th scope="col">Giá</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentDishs.map((dish, index) => (
                  <tr key={dish.dishId}>
                    <th scope="row">{index + 1}</th>
                    <td>
                      <img src={dish.image} style={{ width: "60px" }} />
                    </td>
                    <td>{dish.name}</td>
                    <td>{getCategoryName(dish.categoryID)}</td>
                    <td>{dish.price}đ</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-info"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleOpenDetails(dish.dishId)}
                      >
                        Chi tiết
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleEditDish(dish)}
                      >
                        Sửa
                      </button>
                      {/* <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => confirmDelete(dish.dishId)}
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
            total={filteredAndSortedDishes.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <Modal
        title="Thêm món mới"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddDish}>
            Thêm
          </Button>,
        ]}
      >
        <div className="mb-3">
          <label className="text-dark">Tên món *</label>
          <Input
            placeholder="Tên món"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Giá *</label>
          <Input
            placeholder="Giá"
            value={price}
            type="number"
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Mô tả *</label>
          <Input.TextArea
            autoSize={{ minRows: 4, maxRows: 7 }}
            placeholder="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Loại đơn vị *</label>
          <Input
            placeholder="Loại đơn vị"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        {/* <div className="mb-3">
          <label className="text-dark">Loại món *</label>
          <Input
            placeholder="Loại món"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div> */}
        <div className="mb-3">
          <label className="text-dark">Chọn loại món *</label>
          <Select
            placeholder="Chọn loại món"
            value={categoryId}
            onChange={(value) => setCategoryId(value)}
            style={{ width: "100%" }}
          >
            {categories.map((category) => (
              <Select.Option
                key={category.idCategory}
                value={category.idCategory}
              >
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="mb-3">
          <label className="text-dark">Hình ảnh *</label>
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
            onChange={handleImageUpload}
          >
            <Button icon={<UploadOutlined />}>Tải ảnh lên *</Button>
          </Upload>
        </div>
      </Modal>

      <Modal
        title="Edit Dish"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingDish(null);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setEditModalVisible(false);
              setEditingDish(null);
            }}
          >
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateDish}>
            Cập nhật
          </Button>,
        ]}
      >
        <div className="mb-3">
          <label className="text-dark">Tên món *</label>
          <Input
            value={editingDish ? editingDish.name : ""}
            onChange={(e) =>
              setEditingDish({
                ...editingDish,
                name: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Giá *</label>
          <Input
            type="number"
            value={editingDish ? editingDish.price : ""}
            onChange={(e) =>
              setEditingDish({
                ...editingDish,
                price: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Mô tả *</label>
          <Input.TextArea
            autoSize={{ minRows: 4, maxRows: 7 }}
            value={editingDish ? editingDish.description : ""}
            onChange={(e) =>
              setEditingDish({
                ...editingDish,
                description: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Loại đơn vị *</label>
          <Input
            value={editingDish ? editingDish.type : ""}
            onChange={(e) =>
              setEditingDish({
                ...editingDish,
                type: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Loại món ăn *</label>
          <Select
            value={editingDish ? editingDish.categoryID : ""}
            onChange={(value) =>
              setEditingDish({
                ...editingDish,
                categoryID: value,
              })
            }
            style={{ width: "100%" }}
          >
            {categories.map((category) => (
              <Select.Option
                key={category.idCategory}
                value={category.idCategory}
              >
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="mb-3">
          <label className="text-dark">Hình ảnh *</label>
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
            onChange={(info) => {
              if (info.fileList.length > 0) {
                handleImageUpload(info);
              }
            }}
          >
            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
          </Upload>
        </div>
      </Modal>
      <Modal
        title="Chi tiết món ăn"
        visible={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {currentDishDetails ? (
          <div>
            <img
              src={currentDishDetails.image}
              alt={currentDishDetails.name}
              style={{ width: "100%", height: "350px", marginBottom: "20px" }}
            />
            <h2>{currentDishDetails.name}</h2>
            <p>
              Giá: {currentDishDetails.price}đ/{currentDishDetails.type}
            </p>
            <p>Loại món: {currentDishDetails.categoryName}</p>
            <p>{currentDishDetails.description}</p>
          </div>
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </Modal>
    </WithBootstrap>
  );
};

export default AllDish;
