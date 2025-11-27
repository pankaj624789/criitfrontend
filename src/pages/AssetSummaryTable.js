// src/pages/AssetSummaryTable.js
import React from "react";

/**
 * AssetSummaryTable
 * Expects `summary` prop as an array of objects:
 * [{ department, DesktopLaptop, Laptop, Printer }, ...]
 */
const AssetSummaryTable = ({ summary = [] }) => {
  // safe number parser (handles strings, null, undefined)
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const totalDesktopLaptop = summary.reduce(
    (t, r) => t + toNum(r.DesktopLaptop),
    0
  );
  const totalLaptop = summary.reduce((t, r) => t + toNum(r.Laptop), 0);
  const totalPrinter = summary.reduce((t, r) => t + toNum(r.Printer), 0);

  return (
    <div
      style={{
        background: "#5bcdf0ff",
        width: "70%",
        padding: 6,
        borderRadius: 10,
        boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        marginTop: 30,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
        }}
      >
        <thead>
          <tr style={{ background: "#d4aa00", color: "#fff" }}>
            <th style={{ padding: 10 }}>Department</th>
            <th>Desktop & Laptop</th>
            <th>Laptop</th>
            <th>Printer</th>
          </tr>
        </thead>

        <tbody>
          {summary.map((row, i) => (
            <tr
              key={i}
              style={{
                background: i % 2 === 0 ? "#f8f8f8" : "#f5ceceff",
              }}
            >
              <td style={{ padding: 6, textAlign: "left" }}>
                {row.department}
              </td>
              <td>{toNum(row.DesktopLaptop)}</td>
              <td>{toNum(row.Laptop)}</td>
              <td>{toNum(row.Printer)}</td>
            </tr>
          ))}

          <tr style={{ background: "#ffd966", fontWeight: "bold" }}>
            <td style={{ padding: 8 }}>Total</td>
            <td style={{ padding: 8 }}>{totalDesktopLaptop}</td>
            <td style={{ padding: 8 }}>{totalLaptop}</td>
            <td style={{ padding: 8 }}>{totalPrinter}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AssetSummaryTable;

