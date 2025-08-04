import React from 'react';

const SearchBar = ({ searchQuery, setSearchQuery, filter, setFilter }) => (
  <div className="search-container">
    <div className="search-left">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search resources..."
        className="search-input"
      />
    </div>
    <div className="search-right">
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="type-filter"
      >
        <option value="all">All</option>
        <option value="pdf">PDF</option>
        <option value="training">Training</option>
        <option value="course">Course</option>
      </select>
    </div>
  </div>
);

export default SearchBar;
