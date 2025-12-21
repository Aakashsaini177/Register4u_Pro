import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { reportAPI } from "@/lib/api";
import SummaryTable from "./Components/SummaryTable";
import { PageLoading } from "@/components/ui/Loading";

const DateSummary = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getDateWiseSummary(id);
      if (res.data.success) {
        transformData(res.data.dates, res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch Date Summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformData = (dates, rows) => {
    const tableCols = [
      {
        header: "Room Category",
        accessor: "categoryName",
        className: "sticky left-0 bg-gray-50",
      },
    ];

    dates.forEach((date) => {
      // Date is YYYY-MM-DD
      const [y, m, d] = date.split("-");
      const header = `${d}-${m}`; // formatted DD-MM

      tableCols.push({
        header: header,
        accessor: `date_${date}`,
        render: (row) => row.dates[date] || "-",
      });
    });

    tableCols.push({
      header: "Total",
      accessor: "totalUsed",
      cellClassName: "font-bold",
    });

    setColumns(tableCols);
    setData(rows);
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Date Wise Summary</h2>
        <p className="text-sm text-gray-500">Room usage trend over dates</p>
      </div>
      <SummaryTable columns={columns} data={data} />
    </div>
  );
};

export default DateSummary;
