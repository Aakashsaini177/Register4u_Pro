import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
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

const AddHotel = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearCategoryIndex, setClearCategoryIndex] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    hotelName: "",
    contactPerson: "",
    contactNumber: "",
    hotelAddress: "",
    status: "active",
  });

  const [categories, setCategories] = useState([
    {
      categoryName: "",
      occupancy: 1,
      numberOfRooms: 1,
      roomNumbers: [""],
    },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value,
    };

    setCategories(updatedCategories);
  };

  // Persistence for Hotel Form
  React.useEffect(() => {
    const savedHotel = sessionStorage.getItem("add_hotel_form");
    const savedCats = sessionStorage.getItem("add_hotel_cats");
    if (savedHotel)
      setFormData((prev) => ({ ...prev, ...JSON.parse(savedHotel) }));
    if (savedCats) setCategories(JSON.parse(savedCats));
  }, []);

  React.useEffect(() => {
    sessionStorage.setItem("add_hotel_form", JSON.stringify(formData));
    sessionStorage.setItem("add_hotel_cats", JSON.stringify(categories));
  }, [formData, categories]);

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        categoryName: "",
        occupancy: 1,
        numberOfRooms: 1,
        roomNumbers: [""],
      },
    ]);
  };

  const removeCategory = (index) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const handleRoomNumberChange = (categoryIndex, roomIndex, value) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].roomNumbers[roomIndex] = value;
    setCategories(updatedCategories);
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

    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].roomNumbers.push("");
    setCategories(updatedCategories);
  };

  const removeRoomNumber = (categoryIndex, roomIndex) => {
    const updatedCategories = [...categories];
    if (updatedCategories[categoryIndex].roomNumbers.length > 1) {
      updatedCategories[categoryIndex].roomNumbers.splice(roomIndex, 1);
      setCategories(updatedCategories);
    }
  };

  const clearAllRoomNumbers = (categoryIndex) => {
    setClearCategoryIndex(categoryIndex);
    setShowClearConfirm(true);
  };

  const handleClearConfirm = () => {
    if (clearCategoryIndex !== null) {
      const updatedCategories = [...categories];
      updatedCategories[clearCategoryIndex].roomNumbers = [];
      setCategories(updatedCategories);
      toast.success("All room numbers cleared");
    }
    setShowClearConfirm(false);
    setClearCategoryIndex(null);
  };

  const validateForm = () => {
    const errors = {};

    // Validate basic hotel info
    if (!formData.hotelName) errors.hotelName = "Hotel name is required";
    if (!formData.contactPerson)
      errors.contactPerson = "Contact person is required";
    if (!formData.contactNumber)
      errors.contactNumber = "Contact number is required";
    if (!formData.hotelAddress)
      errors.hotelAddress = "Hotel address is required";

    // Validate categories
    const categoryErrors = [];
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const catError = {};

      if (!category.categoryName)
        catError.categoryName = "Category name is required";
      if (!category.occupancy) catError.occupancy = "Occupancy is required";
      if (!category.numberOfRooms)
        catError.numberOfRooms = "Number of rooms is required";

      const validRoomNumbers = category.roomNumbers.filter(
        (room) => room.trim() !== ""
      );
      if (validRoomNumbers.length === 0) {
        catError.roomNumbers = "At least one room number is required";
      } else if (validRoomNumbers.length !== category.numberOfRooms) {
        catError.roomNumbers = `Room numbers (${validRoomNumbers.length}) should match "Number of Rooms" (${category.numberOfRooms})`;
      }

      if (Object.keys(catError).length > 0) {
        categoryErrors[i] = catError;
      }
    }

    if (categoryErrors.length > 0) errors.categories = categoryErrors;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
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

      const response = await fetch(`${API_BASE_URL}/hotels`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success("Hotel created successfully");
        sessionStorage.removeItem("add_hotel_form");
        sessionStorage.removeItem("add_hotel_cats");
        navigate("/hotel");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create hotel");
      }
    } catch (error) {
      console.error("Error creating hotel:", error);
      toast.error("Error creating hotel");
    } finally {
      setLoading(false);
    }
  };

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
            Add Hotel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new hotel with categories and rooms
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hotel Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
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
                  placeholder="Enter hotel name"
                  className={
                    formErrors.hotelName
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                  required
                />
                {formErrors.hotelName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {formErrors.hotelName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                  className={
                    formErrors.contactPerson
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                  required
                />
                {formErrors.contactPerson && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {formErrors.contactPerson}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  className={
                    formErrors.contactNumber
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                  required
                />
                {formErrors.contactNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {formErrors.contactNumber}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="hotelAddress">Hotel Address *</Label>
              <Textarea
                id="hotelAddress"
                name="hotelAddress"
                value={formData.hotelAddress}
                onChange={handleInputChange}
                placeholder="Enter hotel address"
                rows={3}
                className={
                  formErrors.hotelAddress
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }
                required
              />
              {formErrors.hotelAddress && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-500">⚠️</span>
                  {formErrors.hotelAddress}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
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
          </CardContent>
        </Card>

        {/* Categories and Rooms */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Categories & Rooms</CardTitle>
              <Button
                type="button"
                onClick={addCategory}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {categories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="border-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      Category {categoryIndex + 1}
                    </CardTitle>
                    {categories.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeCategory(categoryIndex)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Category Name *</Label>
                      <Input
                        value={category.categoryName}
                        onChange={(e) =>
                          handleCategoryChange(
                            categoryIndex,
                            "categoryName",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Single, Double, Suite"
                        className={
                          formErrors.categories?.[categoryIndex]?.categoryName
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                        required
                      />
                      {formErrors.categories?.[categoryIndex]?.categoryName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <span className="text-red-500">⚠️</span>
                          {formErrors.categories[categoryIndex].categoryName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Occupancy *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={category.occupancy}
                        onChange={(e) =>
                          handleCategoryChange(
                            categoryIndex,
                            "occupancy",
                            parseInt(e.target.value)
                          )
                        }
                        placeholder="Number of people"
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
                          handleCategoryChange(
                            categoryIndex,
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

                  {/* Room Numbers */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Room Numbers *</Label>
                      <div className="flex gap-2">
                        {category.roomNumbers.length > 0 && (
                          <Button
                            type="button"
                            onClick={() => clearAllRoomNumbers(categoryIndex)}
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                          >
                            🗑️ Clear All
                          </Button>
                        )}
                        <Button
                          type="button"
                          onClick={() => addRoomNumber(categoryIndex)}
                          variant="outline"
                          size="sm"
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
                              handleRoomNumberChange(
                                categoryIndex,
                                roomIndex,
                                e.target.value
                              )
                            }
                            placeholder="Room number"
                            required
                          />
                          {category.roomNumbers.length > 1 && (
                            <Button
                              type="button"
                              onClick={() =>
                                removeRoomNumber(categoryIndex, roomIndex)
                              }
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            {loading ? "Creating..." : "Create Hotel"}
          </Button>
        </div>
      </form>

      {/* Custom Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">🗑️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Clear All Room Numbers
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to clear all room numbers for this category?
              You'll need to regenerate them by changing the "Number of Rooms"
              field.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleClearConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddHotel;
