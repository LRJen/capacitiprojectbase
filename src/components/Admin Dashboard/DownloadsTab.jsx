import React from 'react';

const DownloadsTab = ({
  downloads = [],
  users = {},
  paginatedDownloads = [],
  pageSize = 5,
  downloadPage = 1,
  setDownloadPage = () => {},
  endDownloadIndex = 0,
  handleUserProfileClick = () => {},
}) => {
  return (
    <div className="downloads">
      <h1>Downloads ({downloads.length || 0} total)</h1>

      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Resource</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDownloads.length === 0 ? (
            <tr>
              <td colSpan="3">No downloads to show.</td>
            </tr>
          ) : (
            paginatedDownloads.map((download) => (
              <tr key={download.id}>
                <td>
                  <button
                    onClick={() => handleUserProfileClick(download.userId)}
                    className="user-link"
                  >
                    {users[download.userId]?.name || download.userId}
                  </button>
                </td>
                <td>{download.title}</td>
                <td>{download.timestamp}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {downloads.length > pageSize && (
        <div className="pagination-controls">
          <button
            disabled={downloadPage === 1}
            onClick={() => setDownloadPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span>
            Page {downloadPage} of {Math.ceil(downloads.length / pageSize)}
          </span>
          <button
            disabled={endDownloadIndex >= downloads.length}
            onClick={() => setDownloadPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadsTab;
