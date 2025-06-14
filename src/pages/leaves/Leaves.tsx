import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveRequestForm from './LeaveRequestForm';

const Leaves: React.FC = () => {
  const navigate = useNavigate();
  const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);

  const handleNewRequest = () => {
    setShowLeaveRequestModal(true);
  };

  const handleCloseModal = () => {
    setShowLeaveRequestModal(false);
  };

  const handleSubmitLeaveRequest = async (data: any) => {
    try {
      // Handle leave request submission
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  return (
    <div className="leaves-container">
      <div className="page-header">
        <h1>Leave Management</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNewRequest}
        >
          New Request
        </button>
      </div>

      {showLeaveRequestModal && (
        <LeaveRequestForm
          onClose={handleCloseModal}
          onSubmit={handleSubmitLeaveRequest}
        />
      )}
    </div>
  );
};

export default Leaves; 