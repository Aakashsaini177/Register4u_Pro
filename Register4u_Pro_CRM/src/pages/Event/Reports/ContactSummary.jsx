import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { reportAPI } from "@/lib/api";
import SummaryTable from "./Components/SummaryTable";
import { PageLoading } from "@/components/ui/Loading";

const ContactSummary = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  // Static columns for Contact Summary
  const columns = [
    {
      header: "Hotel Name",
      accessor: "hotelName",
      className: "sticky left-0 bg-gray-50",
    },
    { header: "Contact Person", accessor: "contactPerson" },
    { header: "Mobile", accessor: "contactMobile" },
    { header: "Managed By", accessor: "managedBy" },
    { header: "Manager Mobile", accessor: "managedByMobile" },
  ];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getHotelContactSummary(id);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch Contact Summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Hotel Contact Directory
        </h2>
        <p className="text-sm text-gray-500">
          Key contacts for enlisted hotels
        </p>
      </div>
      <SummaryTable columns={columns} data={data} />
    </div>
  );
};

export default ContactSummary;
