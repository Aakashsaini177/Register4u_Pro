import React, { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, Bed, Users } from "lucide-react";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { hotelAPI } from "../../lib/api";

const Hotel = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await hotelAPI.getAll();
      if (response.data.success) {
        setHotels(response.data.data || []);
      } else {
        toast.error("Failed to fetch hotels");
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast.error("Error fetching hotels");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/hotels/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Hotel deleted successfully");
        fetchHotels();
      } else {
        toast.error("Failed to delete hotel");
      }
    } catch (error) {
      console.error("Error deleting hotel:", error);
      toast.error("Error deleting hotel");
    }
  };

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || hotel.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hotels
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage hotel accommodations and room allotments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/hotel/reports")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ClipboardDocumentListIcon className="h-4 w-4" />
            Hotel Summary
          </Button>
          <Button
            onClick={() => navigate("/hotel/add")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Hotel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search hotels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{hotel.hotelName}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ID: {hotel.hotelId || `H${hotel.id}`}
                  </p>
                </div>
                <Badge
                  variant={hotel.status === "active" ? "default" : "secondary"}
                >
                  {hotel.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {hotel.contactPerson}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {hotel.contactNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {hotel.categories?.length || 0} Categories
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {hotel.hotelAddress}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/hotel/view/${hotel.id}`)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/hotel/edit/${hotel.id}`)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(hotel.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hotels found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first hotel."}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => navigate("/hotel/add")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Hotel
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Hotel;
