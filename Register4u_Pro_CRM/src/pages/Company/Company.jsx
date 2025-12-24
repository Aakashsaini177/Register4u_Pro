import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { companyAPI } from "@/lib/api";
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
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, withMinimumLoading] = useMinimumLoading(600);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, [searchTerm]);

  const fetchCompanies = async () => {
    await withMinimumLoading(async () => {
      const response = await companyAPI.getAll();
      console.log("Companies Response:", response.data);

      if (response.data.success) {
        let data = response.data.data || [];
        if (searchTerm) {
          data = data.filter(
            (comp) =>
              comp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              comp.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              comp.GSIJN?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setCompanies(data);
        setInitialLoad(false);
      }
    }).catch((error) => {
      console.error("Companies Error:", error);
      toast.error("Failed to fetch companies");
      setInitialLoad(false);
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) {
      return;
    }

    try {
      const response = await companyAPI.delete(id);
      if (response.data.success) {
        toast.success("Company deleted successfully");
        fetchCompanies();
      } else {
        toast.error("Failed to delete company");
      }
    } catch (error) {
      toast.error("Failed to delete company");
    }
  };

  // Show full page loader on initial load
  if (loading && initialLoad) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Companies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your companies
          </p>
        </div>
        <Link to="/company/add">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Company
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search companies..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No companies found</p>
              <Link to="/company/add">
                <Button className="mt-4">Add your first company</Button>
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
                  {companies.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell className="font-medium">
                        {comp.companyId ? (
                          <Badge variant="outline" className="font-mono">
                            {comp.companyId}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">
                            #{comp.id}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{comp.name || "N/A"}</p>
                        <p className="text-sm text-gray-500">
                          {comp.city || ""}
                        </p>
                      </TableCell>
                      <TableCell>{comp.GSIJN || "N/A"}</TableCell>
                      <TableCell>{comp.company_type || "N/A"}</TableCell>
                      <TableCell>{formatDate(comp.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/company/view/${comp.id}`}>
                            <Button variant="ghost" size="icon">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/company/edit/${comp.id}`}>
                            <Button variant="ghost" size="icon">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(comp.id)}
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

export default Company;
