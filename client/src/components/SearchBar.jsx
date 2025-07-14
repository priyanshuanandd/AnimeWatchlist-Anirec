// components/SearchBar.jsx
import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm, onSearch, onClear, loading }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center">
        <div className="relative flex w-full sm:w-auto flex-col sm:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for anime..."
            className="px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-base sm:text-lg placeholder-gray-400 transition-all duration-200"
          />
          <button
            onClick={onSearch}
            disabled={loading}
            className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-b-xl sm:rounded-r-xl sm:rounded-bl-none hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base sm:text-lg shadow-md hover:shadow-lg"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              '🔍 Search'
            )}
          </button>
        </div>

        {searchTerm && (
          <button
            onClick={onClear}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            Clear Search
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
