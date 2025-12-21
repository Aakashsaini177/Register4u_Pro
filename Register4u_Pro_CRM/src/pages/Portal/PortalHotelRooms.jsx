import React, { useEffect, useState } from "react";
import PortalLayout from "./PortalLayout";
import { portalDashboardAPI } from "@/lib/portalApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

const PortalHotelRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await portalDashboardAPI.getHotelRooms();
        if (response.data.success) {
          setRooms(response.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Group rooms by category
  const groupedRooms = rooms.reduce((acc, room) => {
    const cat = room.categoryName || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(room);
    return acc;
  }, {});

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Room Status
            </h2>
            <p className="text-gray-500">View and manage room occupancy</p>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedRooms).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No rooms found.
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedRooms).map(([category, catRooms]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {catRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center cursor-pointer transition-all
                                        ${
                                          room.status === "occupied"
                                            ? "bg-red-50 border-red-200 text-red-700"
                                            : room.status === "available"
                                            ? "bg-green-50 border-green-200 text-green-700 hover:scale-105"
                                            : "bg-gray-50 border-gray-200 text-gray-700"
                                        }
                                    `}
                      >
                        <span className="text-xl font-bold">
                          {room.roomNumber}
                        </span>
                        <span className="text-xs uppercase mt-1 px-2 py-0.5 rounded-full bg-white/50">
                          {room.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default PortalHotelRooms;
