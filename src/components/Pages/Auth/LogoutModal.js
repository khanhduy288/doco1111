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
    <h4>Logout System</h4>
    <div className="modal-actions">
      <button onClick={onRequestClose}>Cancel</button>
      <button onClick={onConfirm}>Logout</button>
    </div>
  </Modal>
);

export default LogoutModal;
