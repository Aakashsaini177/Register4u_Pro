import React, { useState, useRef } from "react";
import { useParams, Link, useLocation, Outlet } from "react-router-dom";
import { ArrowLeftIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { reportAPI } from "@/lib/api";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ReportLayout = () => {
  const { id } = useParams(); // Event ID
  const location = useLocation();
  const [exporting, setExporting] = useState(false);

  const tabs = [
    {
      name: "Room Category Summary",
      href: `/hotel/reports/${id}/room-category`,
      current: location.pathname.includes("room-category"),
    },
    {
      name: "Pax Wise Summary",
      href: `/hotel/reports/${id}/pax`,
      current: location.pathname.includes("pax"),
    },
    {
      name: "Hotel Wise Summary",
      href: `/hotel/reports/${id}/hotel`,
      current: location.pathname.includes("hotel"),
    },
    {
      name: "Date Wise Summary",
      href: `/hotel/reports/${id}/date`,
      current: location.pathname.includes("date"),
    },
    {
      name: "Contact Summary",
      href: `/hotel/reports/${id}/contact`,
      current: location.pathname.includes("contact"),
    },
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      const toastId = toast.loading("Generating Excel Report...");

      // Fetch all data in parallel
      const [catRes, paxRes, hotelRes, dateRes, contactRes] = await Promise.all(
        [
          reportAPI.getRoomCategorySummary(id),
          reportAPI.getPaxSummary(id),
          reportAPI.getHotelWiseSummary(id),
          reportAPI.getDateWiseSummary(id),
          reportAPI.getHotelContactSummary(id),
        ]
      );

      const wb = XLSX.utils.book_new();

      // 1. Room Category Summary Sheet
      if (catRes.data.success) {
        const { columns, data } = catRes.data;
        const wsData = [];

        // Header
        const headers = ["S.No", "Hotel Name"];
        columns.forEach((col) => headers.push(col.name));
        headers.push("Total Rooms", "Used Rooms", "Rooms In Hand");
        wsData.push(headers);

        // Rows
        data.forEach((row, idx) => {
          const rowData = [idx + 1, row.hotelName];
          columns.forEach((col) => {
            const catData = row.categories[col._id] || { total: 0, used: 0 };

            // Format based on report type
            if (id === "general") {
              // General Report: Show only Total Inventory
              // If 0, maybe show '0' or blank? showing '0' is safer.
              rowData.push(catData.total || 0);
            } else {
              // Event Report: Show Used / Total
              // If total is 0, show '-' for cleaner look, or '0 / 0'
              if (catData.total === 0) {
                rowData.push("-");
              } else {
                rowData.push(`${catData.used} / ${catData.total}`);
              }
            }
          });
          rowData.push(
            row.totalRooms,
            row.usedRooms,
            row.totalRooms - row.usedRooms
          );
          wsData.push(rowData);
        });

        // Add to workbook
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Category Summary");
      }

      // 2. Pax Wise Summary Sheet
      if (paxRes.data.success) {
        const { data } = paxRes.data;
        const wsData = [];
        // Determine max occupancy columns needed (e.g. 2 Pax, 3 Pax...)
        const allOccupancies = new Set();
        data.forEach((row) => {
          Object.keys(row.paxBreakdown).forEach((occ) =>
            allOccupancies.add(occ)
          );
        });
        const sortedOccs = Array.from(allOccupancies).sort((a, b) => a - b);

        const headers = [
          "S.No",
          "Hotel Name",
          ...sortedOccs.map((o) => `${o} Pax`),
          "Total Used",
        ];
        wsData.push(headers);

        data.forEach((row, idx) => {
          const rowData = [idx + 1, row.hotelName];
          sortedOccs.forEach((occ) => {
            rowData.push(row.paxBreakdown[occ] || 0);
          });
          rowData.push(row.totalUsed);
          wsData.push(rowData);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Pax Summary");
      }

      // 3. Hotel Wise Summary Sheet
      if (hotelRes.data.success) {
        const { data } = hotelRes.data;
        const ws = XLSX.utils.json_to_sheet(
          data.map((row, idx) => ({
            "S.No": idx + 1,
            "Hotel Name": row.hotelName,
            "Total Rooms": row.totalRooms,
            "Used Rooms": row.usedRooms,
            "Rooms In Hand": row.inHand,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Hotel Summary");
      }

      // 4. Date Wise Summary Sheet
      if (dateRes.data.success) {
        const { dates, data } = dateRes.data;
        const wsData = [];
        const headers = ["S.No", "Category", ...dates, "Total Used"];
        wsData.push(headers);

        data.forEach((row, idx) => {
          const rowData = [idx + 1, row.categoryName];
          dates.forEach((date) => {
            rowData.push(row.dates[date] || 0);
          });
          rowData.push(row.totalUsed);
          wsData.push(rowData);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Date Summary");
      }

      // 5. Contact Summary Sheet
      if (contactRes.data.success) {
        const { data } = contactRes.data;
        const ws = XLSX.utils.json_to_sheet(
          data.map((row, idx) => ({
            "S.No": idx + 1,
            "Hotel Name": row.hotelName,
            "Contact Person": row.contactPerson,
            "Mobile No": row.contactMobile,
            "Managed By": row.managedBy,
            "Manager Mobile": row.managedByMobile,
          }))
        );
        XLSX.utils.book_append_sheet(wb, ws, "Contact Summary");
      }

      // Download
      XLSX.writeFile(wb, `Hotel_Report_${id}.xlsx`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/hotel/reports`}>
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Reports</h1>
            <p className="text-sm text-gray-500">
              Comprehensive summaries for Event ID: {id}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
            ) : (
              <TableCellsIcon className="h-5 w-5 mr-2" />
            )}
            {exporting ? "Exporting..." : "Export Excel"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-8 overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.href}
              className={classNames(
                tab.current
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ReportLayout;
