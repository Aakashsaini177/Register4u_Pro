import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { organizationAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { PageLoading, TableSkeleton } from "@/components/ui/Loading";
import { useMinimumLoading } from "@/hooks/useMinimumLoading";
import toast from "react-hot-toast";
import { useConfirm } from "@/hooks/useConfirm";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";

const Organization = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, withMinimumLoading] = useMinimumLoading(600);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchOrganizations();
  }, [searchTerm]);

  const fetchOrganizations = async () => {
    await withMinimumLoading(async () => {
      const response = await organizationAPI.getAll();
      console.log("Organizations Response:", response.data);

      if (response.data.success) {
        let data = response.data.data || [];
        if (searchTerm) {
          data = data.filter(
            (org) =>
              org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              org.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              org.GSIJN?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setOrganizations(data);
        setInitialLoad(false);
      }
    }).catch((error) => {
      console.error("Organizations Error:", error);
      toast.error("Failed to fetch organizations");
      setInitialLoad(false);
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Organization",
      message:
        "Are you sure you want to delete this organization? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await organizationAPI.delete(id);
      if (response.data.success) {
        toast.success("Organization deleted successfully");
        fetchOrganizations();
      } else {
        toast.error("Failed to delete organization");
      }
    } catch (error) {
      toast.error("Failed to delete organization");
    }
  };

  // Show full page loader on initial load
  if (loading && initialLoad) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100"></h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your companies
          </p>
        </div>
        <Link to="/organization/add">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Organization
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search organizations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : organizations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No organizations found</p>
              <Link to="/organization/add">
                <Button className="mt-4">Add your first organization</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">#{org.id}</TableCell>
                      <TableCell>
                        <p className="font-medium">{org.name || "N/A"}</p>
                        <p className="text-sm text-gray-500">
                          {org.city || ""}
                        </p>
                      </TableCell>
                      <TableCell>{org.GSIJN || "N/A"}</TableCell>
                      <TableCell>{org.org_type || "N/A"}</TableCell>
                      <TableCell>{formatDate(org.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/organization/view/${org.id}`}>
                            <Button variant="ghost" size="icon">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/organization/edit/${org.id}`}>
                            <Button variant="ghost" size="icon">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(org.id)}
                          >
                            <TrashIcon className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Organization;
