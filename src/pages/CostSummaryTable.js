import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";

export default function CostSummaryTable({ monthWise, uniqueLocations }) {
  return (
    <div
      style={{
        width: "70%",
        margin: "20px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "white",
      }}
    >
      <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: 10 }}>
        Cost Summary Table
      </Typography>

      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Month</strong>
            </TableCell>
            {uniqueLocations.map((loc) => (
              <TableCell key={loc}>
                <strong>{loc}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {monthWise.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.Month}</TableCell>
              {uniqueLocations.map((loc) => (
                <TableCell key={loc}>
                  {row[loc] ? Number(row[loc]).toFixed(0) : 0}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
