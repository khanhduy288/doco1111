import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Pagination, Select } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WithBootstrap from "../../../../../WithBoostrap";

const AllTable = () => {
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newAreaID, setNewAreaID] = useState("");
  const [newQuantityDesk, setNewQuantityDesk] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchTables = async () => {
    const token = getToken();
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Tables/get-full",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSuccessed) {
        const tables = response.data.resultObj;
        if (Array.isArray(tables)) {
          tables.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setTables(tables);
        } else {
          console.error("Unexpected response data format:", tables);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the tables:", error);
      setLoading(false);
    }
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
        setAreas(response.data.resultObj);
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching the areas:", error);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchAreas();
  }, []);

  const handleAddTable = async () => {
    const token = getToken();
    if (!newTableNumber.trim() || !newAreaID || !newQuantityDesk) {
      toast.error("Số bàn và khu vực không được để trống");
      return;
    }
    if (parseInt(newTableNumber) <= 0 || parseInt(newQuantityDesk) <= 0) {
      toast.error("Số bàn và số lượng ghế phải lớn hơn 0");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("tableNumber", newTableNumber);
      formData.append("areaID", newAreaID);
      formData.append("status", 0);
      formData.append("numberOfDesk", newQuantityDesk);

      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Tables/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data === true) {
        await fetchTables();
        toast.success("Thêm mới bàn thành công");
        setNewTableNumber("");
        setNewAreaID("");
        setNewQuantityDesk("");
        setModalVisible(false);
      } else {
        toast.error("Lỗi trong việc thêm bàn: Unexpected response");
      }
    } catch (error) {
      toast.error(
        "Lỗi trong việc thêm bàn. Bàn đã tồn tại hoặc có lỗi " + error.message
      );
      console.error("Error adding table:", error);
    }
  };

  const handleDeleteTable = async (tableID) => {
    const token = getToken();
    try {
      const response = await axios.delete(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Tables/delete?id=${tableID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data === true) {
        await fetchTables();
        toast.success("Xóa bàn ăn thành công");
      } else {
        console.error("Failed to delete table:", response.data.message);
        toast.error("Xóa bàn ăn thất bại: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Lỗi khi xóa bàn ăn");
    }
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setEditModalVisible(true);
  };

  const handleUpdateTable = async () => {
    const token = getToken();
    if (
      !editingTable ||
      !String(editingTable.tableNumber).trim() ||
      !editingTable.areaID ||
      !editingTable.numberOfDesk
    ) {
      toast.error("Số bàn và khu vực không được để trống");
      return;
    }
    if (parseInt(editingTable.tableNumber) <= 0 || parseInt(editingTable.numberOfDesk) <= 0) {
      toast.error("Số bàn và số lượng ghế phải lớn hơn 0");
      return;
    }

    try {
      const response = await axios.put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Tables/update?id=${editingTable.tableID}`,
        {
          tableID: editingTable.tableID,
          tableNumber: String(editingTable.tableNumber),
          status: editingTable.status,
          areaID: editingTable.areaID,
          numberOfDesk: editingTable.numberOfDesk,
          createdAt: editingTable.createdAt,
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
        await fetchTables();
        toast.success("Cập nhật bàn thành công");
        setEditModalVisible(false);
        setEditingTable(null);
      } else {
        toast.error("Cập nhật bàn thất bại: Unexpected response");
      }
    } catch (error) {
      toast.error(
        "Cập nhật bàn thất bại. Bàn đã tồn tại hoặc có lỗi " + error.message
      );
      console.error("Error updating table:", error);
    }
  };

  const filteredTables = tables.filter((table) =>
    table.tableNumber.toString().includes(searchTerm.toLowerCase())
  );

  const getAreaName = (areaID) => {
    const area = areas.find((area) => area.areaID === areaID);
    return area ? area.areaName : "Unknown";
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTables = filteredTables.slice(startIndex, endIndex);

  const confirmDelete = (tableID) => {
    toast.warn(
      <div>
        <p>Bạn có chắc chắn muốn xóa cơ sở này?</p>
        <Button onClick={() => handleDeleteTable(tableID)}>Xác nhận</Button>
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
        <h3>Tất cả bàn</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-6">
              <Button
                type="button"
                className="btn btn-warning"
                onClick={() => setModalVisible(true)}
              >
                Thêm bàn mới
              </Button>
              <Modal
                title="Thêm bàn mới"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                  <Button key="back" onClick={() => setModalVisible(false)}>
                    Đóng
                  </Button>,
                  <Button key="submit" type="primary" onClick={handleAddTable}>
                    Thêm
                  </Button>,
                ]}
              >
                <label className="text-dark">Chọn khu vực *</label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Chọn khu vực"
                  value={newAreaID}
                  onChange={(value) => setNewAreaID(value)}
                >
                  {areas.map((area) => (
                    <Select.Option key={area.areaID} value={area.areaID}>
                      {area.areaName}
                    </Select.Option>
                  ))}
                </Select>
                <label className="text-dark">Nhập số bàn *</label>
                <Input
                  type="number"
                  placeholder="Nhập số bàn"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                />
                <label className="text-dark">Nhập số lượng ghế *</label>
                <Input
                  type="number"
                  placeholder="Nhập số lượng ghế"
                  value={newQuantityDesk}
                  onChange={(e) => setNewQuantityDesk(e.target.value)}
                />
              </Modal>
            </div>
            <div className="col-lg-6">
              <Input.Search
                placeholder="Tìm bàn"
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
              <thead style={{ textAlign: "center" }}>
                <tr>
                  <th scope="col">STT</th>
                  <th scope="col">Số bàn</th>
                  <th scope="col">Tên khu vực</th>
                  <th scope="col">Số ghế</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: "center" }}>
                {currentTables.map((table, index) => (
                  <tr key={table.tableID}>
                    <th scope="row">{index + 1}</th>
                    <td>{table.tableNumber}</td>
                    <td>{getAreaName(table.areaID)}</td>
                    <td>{table.numberOfDesk}</td>
                    <td>{table.status === 0 ? "Trống" : "Đã đặt"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleEditTable(table)}
                      >
                        Sửa
                      </button>
                      {/* <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => confirmDelete(table.tableID)}
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
            total={filteredTables.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <Modal
        title="Sửa bàn"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingTable(null);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setEditModalVisible(false);
              setEditingTable(null);
            }}
          >
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateTable}>
            Cập nhật
          </Button>,
        ]}
      >
        <label className="text-dark">Chọn khu vực *</label>
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn khu vực"
          value={editingTable ? editingTable.areaID : ""}
          onChange={(value) =>
            setEditingTable({
              ...editingTable,
              areaID: value,
            })
          }
        >
          {areas.map((area) => (
            <Select.Option key={area.areaID} value={area.areaID}>
              {area.areaName}
            </Select.Option>
          ))}
        </Select>
        <label className="text-dark">Nhập số bàn *</label>
        <Input
          type="number"
          placeholder="Nhập số bàn"
          value={editingTable ? editingTable.tableNumber : ""}
          onChange={(e) =>
            setEditingTable({
              ...editingTable,
              tableNumber: e.target.value,
            })
          }
        />
        <label className="text-dark">Nhập số lượng ghế *</label>
        <Input
          type="number"
          placeholder="Nhập số lượng ghế"
          value={editingTable ? editingTable.numberOfDesk : ""}
          onChange={(e) =>
            setEditingTable({
              ...editingTable,
              numberOfDesk: e.target.value,
            })
          }
        />
      </Modal>
    </WithBootstrap>
  );
};

export default AllTable;
