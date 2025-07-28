import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery, filter, setFilter }) => (
  <div className="search-container">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search resources..."
      className="search-input"
    />
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
);
export default SearchBar;
