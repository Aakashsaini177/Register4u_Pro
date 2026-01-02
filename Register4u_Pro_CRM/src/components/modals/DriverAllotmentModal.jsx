import React, { useState, useEffect } from "react";
import { X, Car, Calendar, Clock, MessageSquare, Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { SERVER_BASE_URL } from "../../lib/api";

const DriverAllotmentModal = ({ isOpen, onClose, visitorData }) => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  
  const [formData, setFormData] = useState({
    visitorId: "",
    visitorName: "",
    visitorNumber: "",
    pickupDate: "",
    pickupTime: "",
    dropDate: "",
    dropTime: "",
    remarks: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
      // Auto-fill visitor data
      if (visitorData) {
        setFormData({
          visitorId: visitorData.visitorId || "",
          visitorName: visitorData.name || "",
          visitorNumber: visitorData.contact || "",
          pickupDate: "",
          pickupTime: "",
          dropDate: "",
          dropTime: "",
          remarks: "",
        });
      }
    }
  }, [isOpen, visitorData]);

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/v1/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDriver || !formData.visitorId || !formData.pickupDate || !formData.pickupTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/v1/drivers/allotments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          driverId: selectedDriver,
          visitorId: formData.visitorId,
          visitorName: formData.visitorName,
          visitorNumber: formData.visitorNumber,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime,
          dropDate: formData.dropDate,
          dropTime: formData.dropTime,
          remarks: formData.remarks,
        }),
      });

      if (response.ok) {
        toast.success("Driver allotted successfully!");
        onClose();
        // Reset form
        setFormData({
          visitorId: "",
          visitorName: "",
          visitorNumber: "",
          pickupDate: "",
          pickupTime: "",
          dropDate: "",
          dropTime: "",
          remarks: "",
        });
        setSelectedDriver("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to allot driver");
      }
    } catch (error) {
      console.error("Error allotting driver:", error);
      toast.error("Failed to allot driver");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  const selectedDriverData = drivers.find(d => d._id === selectedDriver);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Driver Allotment
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Visitor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visitor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="visitorId">Visitor ID *</Label>
                  <Input
                    id="visitorId"
                    value={formData.visitorId}
                    onChange={(e) => handleInputChange("visitorId", e.target.value)}
                    placeholder="Enter visitor ID"
                    required
                    readOnly={!!visitorData?.visitorId}
                    className={visitorData?.visitorId ? "bg-gray-100" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="visitorName">Visitor Name *</Label>
                  <Input
                    id="visitorName"
                    value={formData.visitorName}
                    onChange={(e) => handleInputChange("visitorName", e.target.value)}
                    placeholder="Enter visitor name"
                    required
                    readOnly={!!visitorData?.name}
                    className={visitorData?.name ? "bg-gray-100" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="visitorNumber">Contact Number</Label>
                  <Input
                    id="visitorNumber"
                    value={formData.visitorNumber}
                    onChange={(e) => handleInputChange("visitorNumber", e.target.value)}
                    placeholder="Enter contact number"
                    readOnly={!!visitorData?.contact}
                    className={visitorData?.contact ? "bg-gray-100" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Driver Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Driver Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="driver">Select Driver *</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver._id} value={driver._id}>
                        {driver.driverName} - {driver.vehicleNumber} ({driver.vehicleType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Driver Details Display */}
              {selectedDriverData && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Driver Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                      <span className="ml-2 font-medium">{selectedDriverData.contactNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Vehicle:</span>
                      <span className="ml-2 font-medium">{selectedDriverData.vehicleNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="ml-2 font-medium">{selectedDriverData.vehicleType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Seater:</span>
                      <span className="ml-2 font-medium">{selectedDriverData.seater}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pickup & Drop Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pickup & Drop Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupDate">Pickup Date *</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => handleInputChange("pickupDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pickupTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pickup Time *
                  </Label>
                  <Input
                    id="pickupTime"
                    type="time"
                    value={formData.pickupTime}
                    onChange={(e) => handleInputChange("pickupTime", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dropDate">Drop Date</Label>
                  <Input
                    id="dropDate"
                    type="date"
                    value={formData.dropDate}
                    onChange={(e) => handleInputChange("dropDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dropTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Drop Time
                  </Label>
                  <Input
                    id="dropTime"
                    type="time"
                    value={formData.dropTime}
                    onChange={(e) => handleInputChange("dropTime", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          <div>
            <Label htmlFor="remarks" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Remarks
            </Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="Enter any additional remarks..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Allotting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Allot Driver
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverAllotmentModal;