import React, { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";

const TestDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...");
        const response = await dashboardAPI.getDashboard();
        console.log("Dashboard response:", response);
        
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Test Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">Total Visitors</h3>
          <p className="text-2xl font-bold">{dashboardData?.visitorsCount || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">Total Rooms</h3>
          <p className="text-2xl font-bold">{dashboardData?.totalRoomsCount || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">Occupied Rooms</h3>
          <p className="text-2xl font-bold">{dashboardData?.occupiedRoomsCount || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">Occupancy Rate</h3>
          <p className="text-2xl font-bold">{dashboardData?.occupancyPercentage || 0}%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Raw Data (for debugging)</h3>
        <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
          {JSON.stringify(dashboardData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestDashboard;