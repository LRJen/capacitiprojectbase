import React from 'react';

const Pagination = ({ totalItems, currentPage, setPage, pageSize }) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1}>Prev</button>
      {[...Array(totalPages)].map((_, i) => (
        <button key={i} onClick={() => setPage(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
    </div>
  );
};

export default Pagination;
