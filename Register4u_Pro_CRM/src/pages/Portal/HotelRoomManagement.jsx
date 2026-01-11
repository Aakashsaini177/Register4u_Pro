import React, { useState, useEffect } from "react";
import PortalLayout from "./PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { portalDashboardAPI } from "@/lib/portalApi";
import toast from "react-hot-toast";
import {
  HomeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  XMarkIcon,
  TagIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

// Category Modal Component
const CategoryModal = ({ isOpen, onClose, onSuccess, editCategory = null }) => {
  const [formData, setFormData] = useState({
    categoryName: "",
    occupancy: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editCategory) {
      setFormData({
        categoryName: editCategory.categoryName || "",
        occupancy: editCategory.occupancy || 1,
      });
    } else {
      setFormData({
        categoryName: "",
        occupancy: 1,
      });
    }
  }, [editCategory, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editCategory) {
        await portalDashboardAPI.updateHotelCategory(editCategory.id, formData);
        toast.success("Category updated successfully!");
      } else {
        await portalDashboardAPI.addHotelCategory(formData);
        toast.success("Category added successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to save category";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editCategory ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              placeholder="e.g., Deluxe, Suite, Standard"
              required
            />
          </div>

          <div>
            <Label htmlFor="occupancy">Occupancy (Persons)</Label>
            <Input
              id="occupancy"
              type="number"
              min="1"
              max="10"
              value={formData.occupancy}
              onChange={(e) => setFormData({ ...formData, occupancy: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : editCategory ? "Update Category" : "Add Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Room Modal Component
const RoomModal = ({ isOpen, onClose, onSuccess, editRoom = null, categories = [] }) => {
  const [formData, setFormData] = useState({
    roomNumber: "",
    categoryId: "",
    capacity: 1,
    price: "",
    amenities: "",
    status: "available",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editRoom) {
      setFormData({
        roomNumber: editRoom.roomNumber || "",
        categoryId: editRoom.categoryId || "",
        capacity: editRoom.capacity || 1,
        price: editRoom.price || "",
        amenities: editRoom.amenities || "",
        status: editRoom.status || "available",
      });
    } else {
      setFormData({
        roomNumber: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        capacity: 1,
        price: "",
        amenities: "",
        status: "available",
      });
    }
  }, [editRoom, isOpen, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editRoom) {
        await portalDashboardAPI.updateHotelRoom(editRoom.id, formData);
        toast.success("Room updated successfully!");
      } else {
        await portalDashboardAPI.addHotelRoom(formData);
        toast.success("Room added successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to save room";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editRoom ? "Edit Room" : "Add New Room"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g., 101, A-201"
              required
            />
          </div>

          <div>
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName} (Max {category.occupancy} persons)
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="capacity">Capacity (Persons)</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="10"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Price per Night (₹)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 2500"
            />
          </div>

          <div>
            <Label htmlFor="amenities">Amenities</Label>
            <Input
              id="amenities"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="e.g., AC, TV, WiFi, Balcony"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : editRoom ? "Update Room" : "Add Room"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HotelRoomManagement = () => {
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editRoom, setEditRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, roomsResponse] = await Promise.all([
        portalDashboardAPI.getHotelCategories(),
        portalDashboardAPI.getHotelRooms(),
      ]);
      setCategories(categoriesResponse.data.data || []);
      setRooms(roomsResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await portalDashboardAPI.deleteHotelCategory(categoryId);
        toast.success("Category deleted successfully!");
        fetchData();
      } catch (error) {
        const message = error.response?.data?.message || "Failed to delete category";
        toast.error(message);
      }
    }
  };

  const handleAddRoom = () => {
    if (categories.length === 0) {
      toast.error("Please add at least one category first");
      return;
    }
    setEditRoom(null);
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    setEditRoom(room);
    setShowRoomModal(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await portalDashboardAPI.deleteHotelRoom(roomId);
        toast.success("Room deleted successfully!");
        fetchData();
      } catch (error) {
        const message = error.response?.data?.message || "Failed to delete room";
        toast.error(message);
      }
    }
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "occupied":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "maintenance":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "reserved":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roomStats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === "available").length,
    occupied: rooms.filter(r => r.status === "occupied").length,
    maintenance: rooms.filter(r => r.status === "maintenance").length,
  };

  if (loading) {
    return (
      <PortalLayout title="Room Management">
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Room Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Room Management</h1>
            <p className="text-muted-foreground">Manage your hotel categories and rooms</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <TagIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Categories</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{categories.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Rooms</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{roomStats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Available</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{roomStats.available}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <UserIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Occupied</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{roomStats.occupied}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "categories"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "rooms"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Rooms ({rooms.length})
          </button>
        </div>

        {/* Search and Add Button */}
        <Card className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={activeTab === "categories" ? handleAddCategory : handleAddRoom}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add {activeTab === "categories" ? "Category" : "Room"}
            </Button>
          </div>
        </Card>

        {/* Content */}
        {activeTab === "categories" ? (
          <Card>
            <CardHeader>
              <CardTitle>Categories ({filteredCategories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                  <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No categories found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first category"}
                  </p>
                  <Button onClick={handleAddCategory}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            {category.categoryName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Max {category.occupancy} person{category.occupancy > 1 ? 's' : ''}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {category.numberOfRooms} rooms
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="flex-1"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Rooms ({filteredRooms.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRooms.length === 0 ? (
                <div className="text-center py-8">
                  <HomeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No rooms found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search terms" : categories.length === 0 ? "Please add categories first" : "Get started by adding your first room"}
                  </p>
                  {categories.length > 0 && (
                    <Button onClick={handleAddRoom}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Room
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            Room {room.roomNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {room.categoryName} • {room.capacity} person{room.capacity > 1 ? 's' : ''}
                          </p>
                        </div>
                        <Badge className={getStatusColor(room.status)}>
                          {room.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {room.price && (
                          <p className="text-sm text-foreground">
                            <span className="font-medium">Price:</span> ₹{room.price}/night
                          </p>
                        )}
                        {room.amenities && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Amenities:</span> {room.amenities}
                          </p>
                        )}
                        {room.currentGuest && (
                          <div className="text-sm">
                            <p className="text-foreground">
                              <span className="font-medium">Guest:</span> {room.currentGuest}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {room.checkIn} to {room.checkOut}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRoom(room)}
                          className="flex-1"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleModalSuccess}
        editCategory={editCategory}
      />

      <RoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        onSuccess={handleModalSuccess}
        editRoom={editRoom}
        categories={categories}
      />
    </PortalLayout>
  );
};

export default HotelRoomManagement;