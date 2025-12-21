import React from "react";

// Shared Table Component for Excel-like Reports
const SummaryTable = ({ columns, data, footerRow }) => {
  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 ${
                  col.className || ""
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${
                      col.cellClassName || ""
                    }`}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-4 text-sm text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
        {/* Footer Rows for Summaries (Total, Used, In Hand) */}
        {footerRow && Array.isArray(footerRow) && (
          <tfoot className="font-bold">
            {footerRow.map((fRow, fIdx) => (
              <tr key={fIdx} className={fRow.className || "bg-gray-100"}>
                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-3 py-3.5 text-sm border-t-2 border-gray-300 ${
                      fRow.cellClassName || ""
                    } ${col.cellClassName || ""}`}
                  >
                    {/* Use footerLabel property to place the Label, otherwise standard accessor */}
                    {col.footerLabel
                      ? fRow.label
                      : col.footerAccessor
                      ? fRow[col.footerAccessor]
                      : col.renderFooter
                      ? col.renderFooter(fRow)
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default SummaryTable;
