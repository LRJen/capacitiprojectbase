// ✅ ManageResourcesTab.jsx
import React from 'react';

const ManageResourcesTab = ({
  editResourceId,
  resourceName,
  setResourceName,
  resourceDetails,
  setResourceDetails,
  resourceType,
  setResourceType,
  handleFileChange,
  file,
  contentUrl,
  handleUrlChange,
  handleAddResource,
  handleSaveEdit,
  handleClearForm,
  setEditResourceId,
  handleRecommendSearch,
  recommendSearch,
  setRecommendSearch,
  recommendations = [],
  handleAutoFill,
  filteredResources = [],
  searchTerm,
  setSearchTerm,
  paginatedResources = [],
  handleEditResource,
  handleDeleteResource,
  pageSize,
  resourcePage,
  setResourcePage,
  endResourceIndex,
}) => {
  return (
    <div className="manage-resources">
      <h2>{editResourceId ? 'Edit Resource' : 'Manage Resources'}</h2>
      <div className="admin-controls">
        <input type="text" value={resourceName} onChange={(e) => setResourceName(e.target.value)} placeholder="Resource Name" />
        <input type="text" value={resourceDetails} onChange={(e) => setResourceDetails(e.target.value)} placeholder="Description" />
        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
          <option value="pdf">PDF</option>
          <option value="training">Training</option>
          <option value="course">Course</option>
        </select>
        {resourceType === 'pdf' ? (
          <input type="file" onChange={handleFileChange} accept=".pdf" />
        ) : (
          <input type="text" value={contentUrl} onChange={handleUrlChange} placeholder="Enter URL" />
        )}
        <button onClick={editResourceId ? handleSaveEdit : handleAddResource}>
          {editResourceId ? 'Save Changes' : 'Add Resource'}
        </button>
        <button onClick={handleClearForm} className="clear-button">Clear Form</button>
        {editResourceId && <button onClick={() => setEditResourceId(null)}>Cancel Edit</button>}
      </div>

      <h3>Find Resources to Add</h3>
      <form onSubmit={handleRecommendSearch} className="recommend-search-form">
        <input
          type="text"
          value={recommendSearch}
          onChange={(e) => setRecommendSearch(e.target.value)}
          placeholder="Search for resource ideas..."
        />
        <button type="submit">Search</button>
      </form>

      {recommendations.length > 0 && (
        <div className="recommendations-list">
          <h4>Suggested Resources</h4>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>
                <a href={rec.link} target="_blank" rel="noopener noreferrer">{rec.title}</a>
                <p>{rec.snippet}</p>
                <button onClick={() => handleAutoFill(rec)}>Use This</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="resources-table">
        <h2>Resources ({filteredResources.length} total)</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search resources..."
        />
        <table>
          <thead>
            <tr><th>Title</th><th>Type</th><th>Status</th><th>Content</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {paginatedResources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.title}</td>
                <td>{resource.type}</td>
                <td>{resource.status}</td>
                <td>
                  {resource.type === 'pdf' ? (
                    <a href={resource.content} download>{resource.title}</a>
                  ) : (
                    <a href={resource.content} target="_blank" rel="noopener noreferrer">Access</a>
                  )}
                </td>
                <td>
                  <button onClick={() => handleEditResource(resource)}>Edit</button>
                  <button onClick={() => handleDeleteResource(resource.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredResources.length > pageSize && (
          <div className="pagination-controls">
            <button disabled={resourcePage === 1} onClick={() => setResourcePage((prev) => prev - 1)}>Previous</button>
            <span>Page {resourcePage} of {Math.ceil(filteredResources.length / pageSize)}</span>
            <button disabled={endResourceIndex >= filteredResources.length} onClick={() => setResourcePage((prev) => prev + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageResourcesTab;
