import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Hotel,
  BedDouble,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { hotelAPI } from "../../lib/api";
import { toast } from "react-hot-toast";

const AllotHotel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, [date]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getInventoryStatus(date);
      if (response.data.success) {
        setInventory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory status");
    } finally {
      setLoading(false);
    }
  };

  const handleAllot = (hotelId) => {
    navigate(`/hotel/allotment/${hotelId}`);
  };

  // Calculate totals
  const totalRooms = inventory.reduce((sum, item) => sum + item.totalRooms, 0);
  const totalOccupied = inventory.reduce(
    (sum, item) => sum + item.occupiedRooms,
    0
  );
  const totalAvailable = inventory.reduce(
    (sum, item) => sum + item.availableRooms,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/hotel")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Hotels
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Allot Hotel Dashboard
          </h1>
          <p className="text-gray-500">
            Real-time inventory and allotment management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Date:</span>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Rooms
                </p>
                <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {totalRooms}
                </h3>
              </div>
              <BedDouble className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Available (In Hand)
                </p>
                <h3 className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {totalAvailable}
                </h3>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Occupied
                </p>
                <h3 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {totalOccupied}
                </h3>
              </div>
              <LogOut className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Inventory Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel Name</TableHead>
                <TableHead>Total Capacity</TableHead>
                <TableHead>Occupied</TableHead>
                <TableHead>Available (In Hand)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : inventory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No hotels found
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => (
                  <TableRow key={item.hotelId}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-base">
                          {item.hotelName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.customHotelId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-sm px-3 py-1 bg-gray-100"
                      >
                        {item.totalRooms}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-orange-600 font-bold">
                        {item.occupiedRooms}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-bold text-lg">
                        {item.availableRooms}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.availableRooms === 0 ? (
                        <Badge variant="destructive">Full</Badge>
                      ) : (
                        <Badge variant="success">Available</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        disabled={item.availableRooms === 0 && false} // Let them try check-out or view even if full? Better to allow functionality.
                        onClick={() => handleAllot(item.hotelId)}
                      >
                        Allot Hotel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllotHotel;
