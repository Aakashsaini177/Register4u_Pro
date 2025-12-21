import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { reportAPI } from "@/lib/api";
import SummaryTable from "./Components/SummaryTable";
import { PageLoading } from "@/components/ui/Loading";

const RoomCategorySummary = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [footerRows, setFooterRows] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getRoomCategorySummary(id);
      if (res.data.success) {
        // Transform backend response to Table format
        // Backend returns: { columns: [Cat1, Cat2], data: [Hotel1, Hotel2] }
        transformData(res.data.columns, res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch Category Summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformData = (backendCols, backendRows) => {
    // 1. Static Columns: S.No, Hotel Name
    const tableCols = [
      {
        header: "S.No",
        accessor: "sNo",
        className: "w-16 sticky left-0 bg-gray-50",
      },
      {
        header: "Hotel Name",
        accessor: "hotelName",
        className: "sticky left-16 bg-gray-50",
        footerLabel: true, // Show Total Label here
      },
    ];

    // Initialize Footer Data Maps
    const totalMap = {};
    const usedMap = {};
    const inHandMap = {};

    let grandTotalRooms = 0;
    let grandUsedRooms = 0;

    // 2. Dynamic Category Columns
    backendCols.forEach((cat) => {
      // Initialize footer counters for this category
      totalMap[`cat_${cat._id}`] = 0;
      usedMap[`cat_${cat._id}`] = 0;
      inHandMap[`cat_${cat._id}`] = 0;

      tableCols.push({
        header: cat.name,
        accessor: `cat_${cat._id}`, // Virtual accessor
        className: "text-center", // Header Align
        cellClassName: "text-center", // Body/Footer Align
        footerAccessor: `cat_${cat._id}`, // For footer mapping
        render: (row) => {
          const catData = row.categories[cat._id];
          if (!catData) return "-";

          // For General Summary, just show Total
          if (id === "general") {
            return (
              <div className="text-center font-medium text-gray-900">
                {catData.total}
              </div>
            );
          }

          // Excel Style: Used / Total
          return (
            <div className="text-center">
              <span className="font-bold text-gray-900">{catData.used}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-sm">{catData.total}</span>
            </div>
          );
        },
        // Custom render for footer checking to show just one number based on row type
        renderFooter: (fRow) => fRow[`cat_${cat._id}`],
      });
    });

    // 3. Right Columns: Stats
    tableCols.push(
      {
        header: "Total Rooms",
        accessor: "totalRooms",
        footerAccessor: "totalRooms",
        className: "text-center",
        cellClassName: "text-center font-bold",
      },
      {
        header: "Used Room",
        accessor: "usedRooms",
        footerAccessor: "usedRooms",
        className: "text-center",
        cellClassName: "text-center font-bold",
      },
      {
        header: "Rooms In Hand",
        accessor: "inHand",
        footerAccessor: "inHand",
        className: "text-center",
        cellClassName: "text-center font-bold",
      }
    );

    // Process Rows to add S.No and calculate totals
    const processedRows = backendRows.map((row, idx) => {
      // Update Column Totals
      backendCols.forEach((cat) => {
        const catData = row.categories && row.categories[cat._id];
        if (catData) {
          totalMap[`cat_${cat._id}`] += catData.total || 0;
          usedMap[`cat_${cat._id}`] += catData.used || 0;
          inHandMap[`cat_${cat._id}`] +=
            (catData.total || 0) - (catData.used || 0);
        }
      });
      grandTotalRooms += row.totalRooms || 0;
      grandUsedRooms += row.usedRooms || 0;

      return { ...row, sNo: idx + 1, inHand: row.totalRooms - row.usedRooms };
    });

    // Construct Footer Rows
    const footers = [
      {
        label: "Total Rooms",
        className: "bg-blue-100 text-blue-900",
        ...totalMap,
        totalRooms: grandTotalRooms,
      },
      {
        label: "Used Room",
        className: "bg-red-100 text-red-900",
        ...usedMap,
        usedRooms: grandUsedRooms,
      },
      {
        label: "Rooms In Hand",
        className: "bg-green-100 text-green-900",
        ...inHandMap,
        inHand: grandTotalRooms - grandUsedRooms,
      },
    ];

    setColumns(tableCols);
    setData(processedRows);
    setFooterRows(footers);
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Room Category Wise Summary
        </h2>
        <p className="text-sm text-gray-500">
          Breakdown of rooms by categories (Double, Deluxe, etc.)
        </p>
      </div>
      <SummaryTable columns={columns} data={data} footerRow={footerRows} />
    </div>
  );
};

export default RoomCategorySummary;
