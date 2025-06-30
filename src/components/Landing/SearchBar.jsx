import { useState } from 'react';
import fetchRecommendations from '../recommendations';

const SearchBar = ({ setRecommendations, setShowPopup }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const recs = await fetchRecommendations(searchTerm);
      setRecommendations(recs);
      setShowPopup(true);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for resources..."
        className="search-input"
        aria-label="Search for resources"
      />
      <button type="submit" className="search-button">Search</button>
    </form>
  );
};

export default SearchBar;
