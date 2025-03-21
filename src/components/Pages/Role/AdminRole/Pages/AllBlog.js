import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Pagination, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WithBootstrap from "../../../../../WithBoostrap";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [currentBlogDetails, setCurrentBlogDetails] = useState(null);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Blogs/get-full"
      );
      if (response.data.isSuccessed) {
        const blogs = response.data.resultObj;
        if (Array.isArray(blogs)) {
          blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setBlogs(blogs);
        } else {
          console.error("Unexpected response data format:", blogs);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the blogs:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleAddBlog = async () => {
    const token = getToken();
    if (!title.trim() || !subTitle.trim() || !description.trim() || !image) {
      toast.error("Hãy điền đầy đủ các trường.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("subTitle", subTitle.trim());
      formData.append("description", description.trim());
      formData.append("createAtBy", "Admin");
      formData.append("status", true);

      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(image);
      });

      formData.append("image", base64Image);

      console.log("Sending blog data:", Object.fromEntries(formData.entries()));

      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Blogs/add",
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
        await fetchBlogs();
        toast.success("Thêm bài blog thành công");
        setTitle("");
        setSubTitle("");
        setDescription("");
        setImage(null);
        setModalVisible(false);
      } else {
        toast.error("Lỗi khi thêm bài blog: " + JSON.stringify(response.data));
        console.error("Unexpected response", response.data);
      }
    } catch (error) {
      toast.error(
        "Lỗi thêm bài blog: " + (error.response?.data?.message || error.message)
      );
      console.error("Error adding blog:", error.response?.data || error);
    }
  };

  const handleUpdateBlog = async () => {
    const token = getToken();
    if (
      !editingBlog.title.trim() ||
      !editingBlog.subTitle.trim() ||
      !editingBlog.description.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      let updatedBlogData = {
        idBlog: editingBlog.idBlog,
        title: editingBlog.title.trim(),
        subTitle: editingBlog.subTitle.trim(),
        description: editingBlog.description.trim(),
        createAtBy: editingBlog.createAtBy,
        createdAt: editingBlog.createdAt,
        updatedAt: new Date().toISOString(),
        image: editingBlog.image,
        status: editingBlog.status,
      };

      if (image) {
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(image);
        });
        updatedBlogData.image = base64Image;
      }

      console.log("Sending update request with data:", updatedBlogData);

      const response = await axios.put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Blogs/update?id=${editingBlog.idBlog}`,
        updatedBlogData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json-patch+json",
          },
        }
      );

      console.log("Update response:", response);

      if (response.data === true) {
        await fetchBlogs();
        toast.success("Cập nhật bài blog thành công");
        setEditModalVisible(false);
        setEditingBlog(null);
        setImage(null);
      } else {
        toast.error("Cập nhật bài blog thất bại: Phản hồi không mong đợi");
        console.error("Phản hồi không mong đợi", response.data);
      }
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật bài blog:",
        error.response?.data || error
      );
      toast.error(
        "Lỗi khi cập nhật bài blog: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleImageUpload = async ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      setImage(file);
    } else {
      setImage(null);
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setEditModalVisible(true);
  };

  const handleDeleteBlog = async (blogId) => {
    const token = getToken();
    try {
      const response = await axios.delete(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Blogs/delete?id=${blogId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data === true) {
        await fetchBlogs();
        toast.success("Xóa bài blog thành công");
      } else {
        toast.error("Xóa bài blog thất bại: " + response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa bài blog: " + error.message);
      console.error("Lỗi khi xóa bài blog", error);
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const confirmDelete = (blogId) => {
    toast.warn(
      <div>
        <p>Bạn có chắc chắn muốn bài blog này?</p>
        <Button onClick={() => handleDeleteBlog(blogId)}>Xác nhận</Button>
        <Button onClick={() => toast.dismiss()}>Hủy</Button>
      </div>,
      { autoClose: 3000, closeOnClick: true, draggable: false }
    );
  };

  const handleOpenDetails = async (blogId) => {
    try {
      const response = await axios.get(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Blogs/get-by-id?id=${blogId}`
      );
      console.log("API response:", response.data);
      if (response.data && response.status === 200) {
        setCurrentBlogDetails(response.data);
        setDetailsModalVisible(true);
      } else {
        toast.error("Failed to fetch blog details: " + response.data.message);
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching blog details:", error);
      toast.error("Error fetching blog details: " + error.message);
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
        <h3>Tất cả loại món ăn</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-6">
              <Button
                type="button"
                className="btn btn-warning"
                onClick={() => setModalVisible(true)}
              >
                Thêm bài blog mới
              </Button>
              <Modal
                title="Thêm bài blog mới"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                  <Button key="back" onClick={() => setModalVisible(false)}>
                    Đóng
                  </Button>,
                  <Button key="submit" type="primary" onClick={handleAddBlog}>
                    Thêm
                  </Button>,
                ]}
              >
                <div className="mb-3">
                  <label className="text-dark">Tiêu đề *</label>
                  <Input
                    placeholder="Tiêu đề"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="text-dark">Phụ đề *</label>
                  <Input
                    placeholder="Phụ đề"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
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
            </div>
            <div className="col-lg-6">
              <Input.Search
                placeholder="Tìm bài blog"
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
                  <th scope="col">Ảnh</th>
                  <th scope="col">Tiêu đề</th>
                  <th scope="col">Phụ đề</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentBlogs.map((blog, index) => (
                  <tr key={blog.idBlog}>
                    <th scope="row">{index + 1}</th>
                    <td>
                      <img src={blog.image} style={{ width: "60px" }} />
                    </td>
                    <td>{truncateText(blog.title, 25)}</td>
                    <td>{blog.subTitle}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-info"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleOpenDetails(blog.idBlog)}
                      >
                        Chi tiết
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleEditBlog(blog)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => confirmDelete(blog.idBlog)}
                      >
                        Xóa
                      </button>
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
            total={filteredBlogs.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <Modal
        title="Sửa bài blog"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingBlog(null);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setEditModalVisible(false);
              setEditingBlog(null);
            }}
          >
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateBlog}>
            Cập nhật
          </Button>,
        ]}
      >
        <div className="mb-3">
          <label className="text-dark">Tiêu đề *</label>
          <Input
            placeholder="Tiêu đề"
            value={editingBlog ? editingBlog.title : ""}
            onChange={(e) =>
              setEditingBlog({
                ...editingBlog,
                title: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Phụ đề *</label>
          <Input
            placeholder="Phụ đề"
            value={editingBlog ? editingBlog.subTitle : ""}
            onChange={(e) =>
              setEditingBlog({
                ...editingBlog,
                subTitle: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Mô tả *</label>
          <Input.TextArea
            autoSize={{ minRows: 4, maxRows: 7 }}
            placeholder="Mô tả"
            value={editingBlog ? editingBlog.description : ""}
            onChange={(e) =>
              setEditingBlog({
                ...editingBlog,
                description: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3">
          <label className="text-dark">Hình ảnh</label>
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
            onChange={handleImageUpload}
          >
            <Button icon={<UploadOutlined />}>Tải ảnh mới lên</Button>
          </Upload>
        </div>
        {editingBlog && editingBlog.image && (
          <div className="mb-3">
            <label className="text-dark">Ảnh hiện tại:</label>
            <img
              src={editingBlog.image}
              alt="Current"
              style={{ maxWidth: "100%", maxHeight: "200px" }}
            />
          </div>
        )}
      </Modal>
      <Modal
        title="Chi tiết bài blog"
        visible={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={650}
      >
        {currentBlogDetails ? (
          <div>
            <img
              src={currentBlogDetails.image}
              alt={currentBlogDetails.title}
              style={{ maxWidth: "100%", marginBottom: "20px" }}
            />
            <h2>{currentBlogDetails.title}</h2>
            <h4>{currentBlogDetails.subTitle}</h4>
            <p>{currentBlogDetails.description}</p>
          </div>
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </Modal>
    </WithBootstrap>
  );
};

export default AllBlogs;
