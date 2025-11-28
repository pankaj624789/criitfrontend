// src/components/CostSummaryTable.js
import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";

const CostSummaryTable = ({ uniqueLocations, monthWise }) => {
  return (
    <div
      style={{
        width: "35%",
        maxHeight: 350,
        overflowY: "auto",
        padding: 10,
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "white",
      }}
    >
      <Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: 8 }}>
        Chart Data
      </Typography>

      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell><strong>Month</strong></TableCell>
            {uniqueLocations.map((loc) => (
              <TableCell key={loc}><strong>{loc}</strong></TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {monthWise.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.Month}</TableCell>
              {uniqueLocations.map((loc) => (
                <TableCell key={loc}>{row[loc] ? Number(row[loc]).toFixed(0) : 0}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CostSummaryTable;
