import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inviteAPI, categoryAPI, companyAPI, visitorAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { formatDate, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";
import { useConfirm } from "@/hooks/useConfirm";

const Invites = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Visitor View State
  const [viewVisitorsOpen, setViewVisitorsOpen] = useState(false);
  const [selectedInviteVisitors, setSelectedInviteVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await inviteAPI.getAll();
      if (response.data.success) {
        setInvites(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load invites");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchInvites();
  };

  const handleViewVisitors = async (invite) => {
    if (!invite.usedCount || invite.usedCount === 0) {
      toast.error("No visitors have used this invite yet.");
      return;
    }

    setLoadingVisitors(true);
    setViewVisitorsOpen(true);
    setSelectedInviteVisitors([]);

    try {
      // Use the new inviteCode filter we added to backend
      const response = await visitorAPI.getAll({ inviteCode: invite.code });
      if (response.data.success) {
        setSelectedInviteVisitors(response.data.data);
      } else {
        toast.error("Failed to load visitors");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching visitor details");
    } finally {
      setLoadingVisitors(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Invite",
      message:
        "Are you sure you want to delete this invite? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await inviteAPI.delete(id);
      toast.success("Invite deleted");
      fetchInvites();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const copyToClipboard = (code) => {
    const url = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied: " + url);
  };

  const filteredInvites = invites.filter(
    (inv) =>
      inv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      "" ||
      inv.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.contact?.includes(searchQuery) ||
      ""
  );

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-blue-600">
            Admin
          </Link>{" "}
          / <span className="text-gray-900 font-medium">Invites</span> / List
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Invites{" "}
          <span className="text-sm font-normal text-gray-500">
            Showing {filteredInvites.length} entries
          </span>
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            title="Refresh Data"
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            onClick={() => (window.location.href = "/invites/add")}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <PlusIcon className="h-5 w-5 mr-1" /> Add invite
          </Button>
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Max</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Visitors</TableHead>
                <TableHead>Valid until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvites.map((invite) => (
                <TableRow key={invite._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {invite.name || "-"}
                  </TableCell>
                  <TableCell>{invite.contact || "-"}</TableCell>
                  <TableCell className="font-mono text-gray-600">
                    {invite.code}
                  </TableCell>
                  <TableCell>{invite.maxUses || 1}</TableCell>
                  <TableCell>{invite.usedCount || 0}</TableCell>
                  <TableCell>
                    <span
                      onClick={() => handleViewVisitors(invite)}
                      className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {invite.usedCount || 0} items
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDateTime(invite.validUntil)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold
                      ${
                        invite.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : ""
                      }
                      ${
                        invite.status === "EXPIRED"
                          ? "bg-red-100 text-red-700"
                          : ""
                      }
                      ${
                        invite.status === "USED"
                          ? "bg-orange-100 text-orange-700"
                          : ""
                      }
                    `}
                    >
                      {invite.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {invite.prefillData?.category?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={() => copyToClipboard(invite.code)}
                        className="text-purple-600 flex items-center gap-1 hover:text-purple-800"
                      >
                        <LinkIcon className="h-4 w-4" /> Link
                      </button>
                      <button
                        onClick={() => navigate(`/invites/edit/${invite._id}`)}
                        className="text-blue-600 flex items-center gap-1 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(invite._id)}
                        className="text-red-500 flex items-center gap-1 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvites.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    No invites found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Visitors Dialog */}
      <Dialog
        isOpen={viewVisitorsOpen}
        onClose={() => setViewVisitorsOpen(false)}
      >
        <DialogHeader onClose={() => setViewVisitorsOpen(false)}>
          <DialogTitle>Visitors using Invite</DialogTitle>
        </DialogHeader>
        <DialogContent className="max-h-[85vh] overflow-y-auto w-full max-w-3xl">
          {loadingVisitors ? (
            <div className="p-8 text-center text-gray-500">
              Loading visitors...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Used At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInviteVisitors.map((visitor) => (
                  <TableRow key={visitor._id}>
                    <TableCell className="font-mono">
                      {visitor.visitorId}
                    </TableCell>
                    <TableCell>{visitor.name}</TableCell>
                    <TableCell>{formatDateTime(visitor.createdAt)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          visitor.status === "checked-in"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {visitor.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {selectedInviteVisitors.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500 py-4"
                    >
                      No visitors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invites;
