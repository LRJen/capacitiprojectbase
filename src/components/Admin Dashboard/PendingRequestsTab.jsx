import React from 'react';

const PendingRequestsTab = ({
  paginatedRequests = [],
  allRequests = [],
  users = {},
  pageSize = 5,
  requestPage,
  setRequestPage,
  endRequestIndex,
  handleUserProfileClick,
  handleApprove,
  handleRejectClick,
}) => {
  return (
    <div className="pending-requests">
      <h1>Pending Requests</h1>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Resource</th>
            <th>Status</th>
            <th>Rejection Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRequests.length === 0 ? (
            <tr><td colSpan="5">No requests to display.</td></tr>
          ) : (
            paginatedRequests.map((req) => (
              <tr key={req.id}>
                <td>
                  <button
                    onClick={() => handleUserProfileClick(req.userId)}
                    className="user-link"
                  >
                    {users[req.userId]?.name || req.userId}
                  </button>
                </td>
                <td>{req.resourceTitle}</td>
                <td>{req.status}</td>
                <td>{req.rejectionReason || '-'}</td>
                <td>
                  <div className="resource-actions">
                    {req.status === 'pending' ? (
                      <>
                        <button onClick={() => handleApprove(req.id, req.userId, req.resourceId)}>
                          Approve
                        </button>
                        <button onClick={() => handleRejectClick(req.id, req.userId, req.resourceId)}>
                          Reject
                        </button>
                      </>
                    ) : (
                      req.status
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {allRequests.length > pageSize && (
        <div className="pagination-controls">
          <button
            disabled={requestPage === 1}
            onClick={() => setRequestPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span>
            Page {requestPage} of {Math.ceil(allRequests.length / pageSize)}
          </span>
          <button
            disabled={endRequestIndex >= allRequests.length}
            onClick={() => setRequestPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsTab;
