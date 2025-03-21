import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const LogoutModal = ({ isOpen, onRequestClose, onConfirm }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Logout Confirmation"
    className="modal-content"
    overlayClassName="modal-overlay"
  >
    <h4>Đăng xuất khỏi hệ thống?</h4>
    <div className="modal-actions">
      <button onClick={onRequestClose}>Hủy</button>
      <button onClick={onConfirm}>Đăng xuất</button>
    </div>
  </Modal>
);

export default LogoutModal;
