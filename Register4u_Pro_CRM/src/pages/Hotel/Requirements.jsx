import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Calendar,
  User,
  Filter,
  ClipboardList,
  CheckCircle,
  AlertCircle,
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
import { useAuthStore } from "../../store/authStore";
import { requirementAPI, visitorAPI } from "../../lib/api";
import { toast } from "react-hot-toast";

const Requirements = () => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'Pending', 'Allotted'

  // New Requirement Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReq, setNewReq] = useState({
    visitorId: "",
    roomCategory: "Single",
    checkInDate: "",
    checkOutDate: "",
    priority: "Normal",
    remarks: "",
  });
  const [visitorName, setVisitorName] = useState(""); // Helper display

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await requirementAPI.getAll();
      if (response.data.success) {
        setRequirements(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching requirements:", error);
      toast.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorLookup = async (id) => {
    if (id.length < 3) return;
    try {
      const res = await visitorAPI.getById(id);
      if (res.data.success) {
        setVisitorName(res.data.data.name);
        // Also auto-fill eventId ideally, but for now we rely on backend extracting or we need to fetch eventId
        // The backend model requires eventId.
        // Assumption: We need to get eventId from visitor.
        setNewReq((prev) => ({ ...prev, eventId: res.data.data.eventId }));
      }
    } catch (err) {
      setVisitorName("Visitor not found");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newReq.eventId) {
      toast.error("Invalid Visitor or missing Event ID");
      return;
    }

    try {
      const res = await requirementAPI.create(newReq);
      if (res.data.success) {
        toast.success("Requirement added");
        setShowAddForm(false);
        setNewReq({
          visitorId: "",
          roomCategory: "Single",
          checkInDate: "",
          checkOutDate: "",
          priority: "Normal",
          remarks: "",
        });
        setVisitorName("");
        fetchRequirements();
      }
    } catch (err) {
      toast.error("Failed to add requirement");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Allotted":
        return "success";
      case "Cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredData = requirements.filter((req) => {
    const matchSearch = req.visitorId
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Accommodation Requirements
          </h1>
          <p className="text-gray-500">
            Manage accommodation requests separately from allotment
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" /> Add Request
        </Button>
      </div>

      {/* Add Form (Inline for simplicity) */}
      {showAddForm && (
        <Card className="bg-blue-50 dark:bg-gray-800 border-blue-200">
          <CardHeader>
            <CardTitle>New Accommodation Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreate}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="text-sm font-medium">Visitor ID</label>
                <Input
                  value={newReq.visitorId}
                  onChange={(e) =>
                    setNewReq({ ...newReq, visitorId: e.target.value })
                  }
                  onBlur={(e) => handleVisitorLookup(e.target.value)}
                  placeholder="Enter Visitor ID"
                  required
                />
                {visitorName && (
                  <span className="text-xs text-blue-600 font-bold">
                    {visitorName}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Room Category</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newReq.roomCategory}
                  onChange={(e) =>
                    setNewReq({ ...newReq, roomCategory: e.target.value })
                  }
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newReq.priority}
                  onChange={(e) =>
                    setNewReq({ ...newReq, priority: e.target.value })
                  }
                >
                  <option value="Normal">Normal</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Check In</label>
                <Input
                  type="date"
                  value={newReq.checkInDate}
                  onChange={(e) =>
                    setNewReq({ ...newReq, checkInDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Check Out</label>
                <Input
                  type="date"
                  value={newReq.checkOutDate}
                  onChange={(e) =>
                    setNewReq({ ...newReq, checkOutDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit">Submit Request</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Visitor ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "Pending", "Allotted", "Cancelled"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No requirements found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-medium">
                      {req.visitorId}
                    </TableCell>
                    <TableCell>{req.roomCategory}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(req.checkInDate).toLocaleDateString()} -{" "}
                      {new Date(req.checkOutDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.priority === "VIP" ? "destructive" : "secondary"
                        }
                      >
                        {req.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(req.status)}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* Future: Add 'Allot' button that redirects to RoomAllotment with params */}
                      {req.status === "Pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                        >
                          Allot Now
                        </Button>
                      )}
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

export default Requirements;
