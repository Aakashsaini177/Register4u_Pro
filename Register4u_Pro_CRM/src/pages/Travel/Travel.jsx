import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plane,
  Train,
  Car,
  Bus,
  UserCheck,
  Download,
} from "lucide-react";
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
import TravelAllotmentModal from "./TravelAllotmentModal";
import { travelAPI } from "../../lib/api";

const Travel = () => {
  const [travelDetails, setTravelDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTravelBy, setFilterTravelBy] = useState("all");
  const [allotmentModal, setAllotmentModal] = useState({
    isOpen: false,
    travelDetail: null,
  });
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchTravelDetails();
  }, []);

  const fetchTravelDetails = async () => {
    try {
      const response = await fetch("http://localhost:4002/api/v1/travel", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTravelDetails(data.data || []);
      } else {
        toast.error("Failed to fetch travel details");
      }
    } catch (error) {
      console.error("Error fetching travel details:", error);
      toast.error("Error fetching travel details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this travel detail?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:4002/api/v1/travel/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Travel detail deleted successfully");
        fetchTravelDetails();
      } else {
        toast.error("Failed to delete travel detail");
      }
    } catch (error) {
      console.error("Error deleting travel detail:", error);
      toast.error("Error deleting travel detail");
    }
  };

  const handleAllotment = (travelDetail) => {
    setAllotmentModal({ isOpen: true, travelDetail });
  };

  const closeAllotmentModal = () => {
    setAllotmentModal({ isOpen: false, travelDetail: null });
  };

  const handleExport = async (type) => {
    const toastId = toast.loading(`Exporting ${type} List...`);
    try {
      const response = await travelAPI.exportReport({ type });

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Travel_${type}_List_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${type} List exported successfully`, { id: toastId });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report", { id: toastId });
    }
  };

  const getTravelIcon = (travelBy) => {
    switch (travelBy) {
      case "Flight":
        return <Plane className="h-4 w-4" />;
      case "Train":
        return <Train className="h-4 w-4" />;
      case "Car":
        return <Car className="h-4 w-4" />;
      case "Bus":
        return <Bus className="h-4 w-4" />;
      default:
        return <Plane className="h-4 w-4" />;
    }
  };

  const filteredTravelDetails = travelDetails.filter((detail) => {
    const matchesSearch =
      detail.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.visitorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.mobileNumber.includes(searchTerm);
    const matchesType = filterType === "all" || detail.type === filterType;
    const matchesTravelBy =
      filterTravelBy === "all" || detail.travelBy === filterTravelBy;
    return matchesSearch && matchesType && matchesTravelBy;
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
            Travel Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage visitor travel arrangements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport("arrival")}
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Arrival List
          </Button>
          <Button
            onClick={() => handleExport("departure")}
            variant="outline"
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Departure List
          </Button>
          <div className="w-px h-8 bg-gray-300 mx-2 hidden sm:block"></div>
          <Button onClick={() => navigate("/travel/arrival")} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Arrival
          </Button>
          <Button
            onClick={() => navigate("/travel/departure")}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Departure
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
                  placeholder="Search by visitor name, ID, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="arrival">Arrival</option>
                <option value="departure">Departure</option>
              </select>
              <select
                value={filterTravelBy}
                onChange={(e) => setFilterTravelBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Transport</option>
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Car">Car</option>
                <option value="Bus">Bus</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Details Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Travel Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Allotments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTravelDetails.map((detail) => (
                  <tr
                    key={detail.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {detail.visitorName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {detail.visitorId}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {detail.mobileNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTravelIcon(detail.travelBy)}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {detail.travelBy}
                          </div>
                          {detail.flightTrainNo && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {detail.flightTrainNo}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {detail.fromLocation} → {detail.toLocation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(detail.arrivalDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {detail.arrivalTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          detail.type === "arrival" ? "default" : "secondary"
                        }
                      >
                        {detail.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {detail.hotelAllotments &&
                        detail.hotelAllotments.length > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            🏨 Hotel:{" "}
                            {detail.hotelAllotments[0].hotel?.hotelName ||
                              "N/A"}{" "}
                            (Room:{" "}
                            {detail.hotelAllotments[0].room?.roomNumber ||
                              "N/A"}
                            )
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            No Hotel
                          </Badge>
                        )}
                        {detail.driverAllotments &&
                        detail.driverAllotments.length > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            🚗 Driver:{" "}
                            {detail.driverAllotments[0].driver?.driverName ||
                              "N/A"}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            No Driver
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAllotment(detail)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Allot Hotel/Driver"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/travel/view/${detail.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/travel/edit/${detail.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(detail.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredTravelDetails.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No travel details found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterType !== "all" || filterTravelBy !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding travel details for visitors."}
            </p>
            {!searchTerm &&
              filterType === "all" &&
              filterTravelBy === "all" && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate("/travel/arrival")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Arrival
                  </Button>
                  <Button
                    onClick={() => navigate("/travel/departure")}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Departure
                  </Button>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Allotment Modal */}
      <TravelAllotmentModal
        isOpen={allotmentModal.isOpen}
        onClose={closeAllotmentModal}
        travelDetail={allotmentModal.travelDetail}
      />
    </div>
  );
};

export default Travel;
