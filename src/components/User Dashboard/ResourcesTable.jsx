import React from 'react';
import ResourceRow from './ResourceRow';

const ResourcesTable = ({
  activeTab,
  resources,
  notifications,
  downloads,
  searchQuery,
  filter,
  handleRequest,
  handleCancelRequest,
  handleDownloadOrAccess
}) => {
  const filterFn = (item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filter === 'all' || item.type === filter);

  const filteredResources = {
    available: resources.filter((r) => r.status === 'available' && filterFn(r)),
    myResources: resources.filter(filterFn),
    myLibrary: downloads.filter(filterFn),
  };

  const list = activeTab === 'available'
    ? filteredResources.available
    : activeTab === 'myLibrary'
    ? filteredResources.myLibrary
    : filteredResources.myResources;

  return (
    <div className="resources-table">
      <table>
        <thead>
          <tr>
            <th>Title</th><th>Description</th><th>Type</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((res) => (
            <ResourceRow
              key={res.id}
              resource={res}
              notifications={notifications}
              tab={activeTab}
              handleRequest={handleRequest}
              handleCancelRequest={handleCancelRequest}
              handleDownloadOrAccess={handleDownloadOrAccess}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourcesTable;
