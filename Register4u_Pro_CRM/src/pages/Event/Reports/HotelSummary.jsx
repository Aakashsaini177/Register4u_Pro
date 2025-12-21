import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { reportAPI } from "@/lib/api";
import SummaryTable from "./Components/SummaryTable";
import { PageLoading } from "@/components/ui/Loading";

const HotelSummary = () => {
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
      const res = await reportAPI.getHotelWiseSummary(id);
      if (res.data.success) {
        transformData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch Hotel Summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformData = (rows) => {
    const cols = [
      {
        header: "S.No",
        accessor: "sNo",
        className: "w-16 sticky left-0 bg-gray-50",
      },
      {
        header: "Hotel Name",
        accessor: "hotelName",
        className: "sticky left-16 bg-gray-50",
      },
      {
        header: "Total Rooms",
        accessor: "totalRooms",
        footerAccessor: "total",
      },
      { header: "Used Rooms", accessor: "usedRooms", footerAccessor: "used" },
      {
        header: "Rooms In Hand",
        accessor: "inHand",
        footerAccessor: "inHand",
        render: (row) => (
          <span
            className={
              row.inHand > 0 ? "text-green-600 font-bold" : "text-red-500"
            }
          >
            {row.inHand}
          </span>
        ),
      },
    ];

    let total = 0,
      used = 0,
      inHand = 0;
    const processed = rows.map((row, idx) => {
      total += row.totalRooms;
      used += row.usedRooms;
      inHand += row.inHand;
      return { ...row, sNo: idx + 1 };
    });

    const footers = [
      {
        label: "Total Rooms",
        className: "bg-blue-100 text-blue-900",
        total,
        used,
        inHand,
      }, // In Hand logically might separate?
      // Actually for Hotel Summary, the image 3 shows Grand Totals at bottom.
      // Rows: Total Rooms (Sum), Used (Sum), In Hand (Sum)?
      // Actually Image 3 shows rows... My impl shows Columns.
      // My table: Column Total | Column Used | Column In Hand.
      // So Footer Row 1: Total of Total Rooms | Total of Used | Total of In Hand.
      // This fits standard footer.
      // Let's just do one summary row or the 3-colored-rows style if appropriate.
      // Since my columns are distinct metrics, a single "Grand Total" footer row is enough to sum them all up.
      // BUT to match the "Design Language", I will add the colored rows logic if I want to emphasize.
      // Actually, for this specific table, a single row summing up Total/Used/InHand is best.

      // Wait, if I use the 3-row style:
      // Row 1 (Blue) 'Total Rooms': Shows Sump of Total Rooms col... and what for Used Rooms col?
      // It's confusing.
      // Better: ONE Footer row that sums up each column.
      {
        label: "Grand Total",
        className: "bg-gray-100 text-gray-900",
        total: total,
        used: used,
        inHand: inHand,
      },
    ];

    setColumns(cols);
    setData(processed);
    setFooterRows(footers);
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Hotel Wise Summary
        </h2>
        <p className="text-sm text-gray-500">Overall room usage per hotel</p>
      </div>
      <SummaryTable columns={columns} data={data} footerRow={footerRows} />
    </div>
  );
};

export default HotelSummary;
