import React from 'react';

const RejectModal = ({ showRejectModal, rejectionReason, setRejectionReason, handleRejectSubmit, closeRejectModal }) => {
  if (!showRejectModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Reject Request</h3>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter reason for rejection"
        />
        <div className="modal-actions">
          <button onClick={handleRejectSubmit}>Submit</button>
          <button onClick={closeRejectModal}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
