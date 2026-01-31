import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventAPI } from "@/lib/api";
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
import { TableSkeleton, PageLoading } from "@/components/ui/Loading";
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

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, withMinimumLoading] = useMinimumLoading(600);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchEvents();
  }, [searchTerm]);

  const fetchEvents = async () => {
    await withMinimumLoading(async () => {
      const response = await eventAPI.getAll({ search: searchTerm });
      console.log("Events Response:", response.data);
      if (response.data.success) {
        setEvents(response.data.data || []);
        setInitialLoad(false);
      }
    }).catch((error) => {
      console.error("Events Error:", error);
      toast.error("Failed to fetch events");
      setInitialLoad(false);
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Event",
      message:
        "Are you sure you want to delete this event? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await eventAPI.delete(id);
      if (response.data.success) {
        toast.success("Event deleted successfully");
        fetchEvents();
      }
    } catch (error) {
      toast.error("Failed to delete event");
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your events
          </p>
        </div>
        <Link to="/event/add">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No events found</p>
              <Link to="/event/add">
                <Button className="mt-4">Add your first event</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.eventId ? (
                        <Badge variant="outline" className="font-mono">
                          {event.eventId}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">
                          #{event.id}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.eventName || event.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {formatDate(event.StartTime || event.date)}
                    </TableCell>
                    <TableCell>{event.location || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="success">
                        {event.status || "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/event/view/${event.id}`}>
                          <Button variant="ghost" size="icon">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/event/edit/${event.id}`}>
                          <Button variant="ghost" size="icon">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(event.id)}
                        >
                          <TrashIcon className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Event;
