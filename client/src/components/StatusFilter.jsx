// components/StatusFilter.jsx
import React from 'react';

const StatusFilter = ({ filterStatus, setFilterStatus }) => {
  const STATUS_OPTIONS = [
    { value: 'watching', label: 'Watching', emoji: '👀', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', emoji: '✅', color: 'bg-green-500' },
    { value: 'dropped', label: 'Dropped', emoji: '❌', color: 'bg-red-500' }
  ];

  return (
    <div className="flex justify-center mb-10">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-white/20">
        <div className="flex flex-wrap gap-2 justify-center">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                filterStatus === status.value
                  ? `${status.color} text-white shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-2">{status.emoji}</span>
              {status.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusFilter;
