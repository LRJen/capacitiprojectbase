import React from 'react';

const LogsTable = ({
  paginatedLogs = [],
  logs = [],
  pageSize = 5,
  logPage = 1,
  setLogPage = () => {},
  endLogIndex = 0,
}) => {
  return (
    <div className="log-table">
      <h2>Action Logs</h2>

      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {paginatedLogs.length === 0 ? (
            <tr><td colSpan="2">No logs to display.</td></tr>
          ) : (
            paginatedLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.timestamp}</td>
                <td>{log.message}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {logs.length > pageSize && (
        <div className="pagination-controls">
          <button
            disabled={logPage === 1}
            onClick={() => setLogPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span>
            Page {logPage} of {Math.ceil(logs.length / pageSize)}
          </span>
          <button
            disabled={endLogIndex >= logs.length}
            onClick={() => setLogPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LogsTable;
