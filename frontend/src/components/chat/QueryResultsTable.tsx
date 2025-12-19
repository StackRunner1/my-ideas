/**
 * QueryResultsTable Component
 *
 * Displays query results in a table format with pagination.
 */

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface QueryResultsTableProps {
  results: Array<Record<string, any>>;
  maxRows?: number;
}

export function QueryResultsTable({
  results,
  maxRows = 10,
}: QueryResultsTableProps) {
  const [showAll, setShowAll] = useState(false);

  if (!results || results.length === 0) {
    return (
      <div className="rounded border border-dashed p-4 text-center text-sm text-muted-foreground">
        No results to display
      </div>
    );
  }

  // Get column names from first result
  const columns = Object.keys(results[0]);

  // Limit rows if not showing all
  const displayedResults = showAll ? results : results.slice(0, maxRows);
  const hasMore = results.length > maxRows;

  return (
    <div className="space-y-2">
      <div className="rounded border">
        <Table>
          <caption className="sr-only">
            Query results showing {results.length} row
            {results.length !== 1 ? "s" : ""}
          </caption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedResults.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((column) => (
                  <TableCell key={column} className="font-mono text-xs">
                    {formatValue(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasMore && !showAll && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setShowAll(true)}>
            Show all {results.length} rows
          </Button>
        </div>
      )}

      {showAll && hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setShowAll(false)}>
            Show less
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {results.length} row{results.length !== 1 ? "s" : ""} returned
      </div>
    </div>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
