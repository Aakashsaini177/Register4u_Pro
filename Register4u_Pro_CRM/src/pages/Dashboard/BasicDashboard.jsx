import React from "react";

const BasicDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Basic Dashboard Test
      </h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          ✅ Dashboard is loading successfully!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          This confirms that routing and authentication are working.
        </p>
      </div>
    </div>
  );
};

export default BasicDashboard;