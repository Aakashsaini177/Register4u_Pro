import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Bed, Users } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { API_BASE_URL } from "../../lib/api";

const EditHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    hotelName: "",
    contactPerson: "",
    contactNumber: "",
    hotelAddress: "",
    status: "active",
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (id) {
      fetchHotelDetails();
    }
  }, [id]);

  const fetchHotelDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const hotel = data.data;

        setFormData({
          hotelName: hotel.hotelName,
          contactPerson: hotel.contactPerson,
          contactNumber: hotel.contactNumber,
          hotelAddress: hotel.hotelAddress,
          status: hotel.status,
        });

        if (hotel.categories && hotel.categories.length > 0) {
          setCategories(
            hotel.categories.map((category) => ({
              id: category.id,
              categoryName: category.categoryName,
              occupancy: category.occupancy,
              numberOfRooms: category.numberOfRooms,
              roomNumbers: category.rooms
                ? category.rooms.map((room) => room.roomNumber)
                : [],
            }))
          );
        }
      } else {
        toast.error("Failed to fetch hotel details");
        navigate("/hotel");
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      toast.error("Error fetching hotel details");
      navigate("/hotel");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        id: Date.now(),
        categoryName: "",
        occupancy: 1,
        numberOfRooms: 1,
        roomNumbers: [""],
      },
    ]);
  };

  const removeCategory = (index) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCategory = (index, field, value) => {
    setCategories((prev) =>
      prev.map((category, i) => {
        if (i === index) {
          return { ...category, [field]: value };
        }
        return category;
      })
    );
  };

  const addRoomNumber = (categoryIndex) => {
    const category = categories[categoryIndex];
    const currentRoomCount = category.roomNumbers.length;
    const maxRooms = category.numberOfRooms || 0;

    if (currentRoomCount >= maxRooms) {
      toast.error(
        `Cannot add more rooms. Maximum ${maxRooms} rooms allowed for this category. Please increase "Number of Rooms" first.`
      );
      return;
    }

    setCategories((prev) =>
      prev.map((category, i) =>
        i === categoryIndex
          ? { ...category, roomNumbers: [...category.roomNumbers, ""] }
          : category
      )
    );
  };

  const removeRoomNumber = (categoryIndex, roomIndex) => {
    setCategories((prev) =>
      prev.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              roomNumbers: category.roomNumbers.filter(
                (_, ri) => ri !== roomIndex
              ),
            }
          : category
      )
    );
  };

  const updateRoomNumber = (categoryIndex, roomIndex, value) => {
    setCategories((prev) =>
      prev.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              roomNumbers: category.roomNumbers.map((room, ri) =>
                ri === roomIndex ? value : room
              ),
            }
          : category
      )
    );
  };

  const clearAllRoomNumbers = (categoryIndex) => {
    if (window.confirm("Are you sure you want to clear all room numbers?")) {
      setCategories((prev) =>
        prev.map((category, i) =>
          i === categoryIndex ? { ...category, roomNumbers: [] } : category
        )
      );
      toast.success("All room numbers cleared");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (
        !formData.hotelName ||
        !formData.contactPerson ||
        !formData.contactNumber ||
        !formData.hotelAddress
      ) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Validate categories
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        if (
          !category.categoryName ||
          !category.occupancy ||
          !category.numberOfRooms
        ) {
          toast.error(`Please fill in all fields for category ${i + 1}`);
          setLoading(false);
          return;
        }

        // Validate room numbers count
        const validRoomNumbers = category.roomNumbers.filter(
          (room) => room.trim() !== ""
        );
        if (validRoomNumbers.length !== category.numberOfRooms) {
          toast.error(
            `Category ${i + 1}: Number of room numbers (${
              validRoomNumbers.length
            }) should match "Number of Rooms" (${category.numberOfRooms})`
          );
          setLoading(false);
          return;
        }
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        categories: categories.map((category) => ({
          ...category,
          roomNumbers: category.roomNumbers.filter(
            (room) => room.trim() !== ""
          ),
        })),
      };

      const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success("Hotel updated successfully");
        navigate("/hotel");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update hotel");
      }
    } catch (error) {
      console.error("Error updating hotel:", error);
      toast.error("Error updating hotel");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/hotel")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Hotel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update hotel information and room categories
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Hotel Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hotelName">Hotel Name *</Label>
                <Input
                  id="hotelName"
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="hotelAddress">Hotel Address *</Label>
              <Textarea
                id="hotelAddress"
                name="hotelAddress"
                value={formData.hotelAddress}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Room Categories
              </CardTitle>
              <Button
                type="button"
                onClick={addCategory}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category, index) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Category {index + 1}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCategory(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label>Category Name *</Label>
                    <Input
                      value={category.categoryName}
                      onChange={(e) =>
                        updateCategory(index, "categoryName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Occupancy *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={category.occupancy}
                      onChange={(e) =>
                        updateCategory(
                          index,
                          "occupancy",
                          parseInt(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Number of Rooms *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={category.numberOfRooms}
                      onChange={(e) =>
                        updateCategory(
                          index,
                          "numberOfRooms",
                          parseInt(e.target.value)
                        )
                      }
                      placeholder="Enter number (e.g., 10, 50, 100)"
                      required
                    />
                    <div className="mt-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>
                          Added:{" "}
                          {
                            category.roomNumbers.filter(
                              (room) => room.trim() !== ""
                            ).length
                          }{" "}
                          / {category.numberOfRooms || 0}
                        </span>
                        <span>
                          {Math.round(
                            (category.roomNumbers.filter(
                              (room) => room.trim() !== ""
                            ).length /
                              (category.numberOfRooms || 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            category.roomNumbers.filter(
                              (room) => room.trim() !== ""
                            ).length === category.numberOfRooms
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (category.roomNumbers.filter(
                                (room) => room.trim() !== ""
                              ).length /
                                (category.numberOfRooms || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        💡 Use "Add Room" button to manually add room numbers
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Room Numbers</Label>
                    <div className="flex gap-2">
                      {category.roomNumbers.length > 0 && (
                        <Button
                          type="button"
                          onClick={() => clearAllRoomNumbers(index)}
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                        >
                          🗑️ Clear All
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addRoomNumber(index)}
                        disabled={
                          category.roomNumbers.length >=
                          (category.numberOfRooms || 0)
                        }
                        className={`${
                          category.roomNumbers.length >=
                          (category.numberOfRooms || 0)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Room ({category.roomNumbers.length}/
                        {category.numberOfRooms || 0})
                      </Button>
                    </div>
                  </div>
                  {category.roomNumbers.length >=
                    (category.numberOfRooms || 0) && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                      ⚠️ Maximum rooms reached. Increase "Number of Rooms" to
                      add more.
                    </p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {category.roomNumbers.map((roomNumber, roomIndex) => (
                      <div key={roomIndex} className="flex gap-1">
                        <Input
                          value={roomNumber}
                          onChange={(e) =>
                            updateRoomNumber(index, roomIndex, e.target.value)
                          }
                          placeholder="Room number"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRoomNumber(index, roomIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No categories added yet. Click "Add Category" to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/hotel")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Updating..." : "Update Hotel"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditHotel;
