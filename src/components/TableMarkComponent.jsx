import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GoSearch } from "react-icons/go";
import { AiOutlineClear } from "react-icons/ai";
import { FaRegFileExcel, FaRegSave } from "react-icons/fa";
import * as XLSX from "xlsx";
import ReusableInput from "./ui/ReusableInput";
import Badge from "./Badge";
import Button from "./ui/raw/Button";

const TableMarkComponent = ({
  columns,
  data: initialData = [],
  subjectCode,
  loading = false,
  textColumns = [],
  numberColumns = [],
  onSubmit,
  onCancel,
  borderColor = "gray-200 dark:border-gray-700",
  rowColors = {
    default: "hover:bg-gray-50 dark:hover:bg-gray-800",
    selected: "bg-gray-100 dark:bg-gray-700",
  },
  markCalculation = "twoPaperAvg",
  gradingScale,
}) => {
  const [filterValue, setFilterValue] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: columns[0]?.uid || "id",
    direction: "ascending",
  });
  const [editedData, setEditedData] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    setShowButtons(!!subjectCode);
  }, [subjectCode]);

  const getBadgeColor = (grade) => {
    if (!grade || grade === "-") return "#9CA3AF";
    if (grade === "A") return "#FF9800";
    if (["A-", "B+", "B"].includes(grade)) return "#8BC34A";
    if (["B-", "C+", "C"].includes(grade)) return "#FFEB3B";
    if (["C-", "D+", "D"].includes(grade)) return "#FF9800";
    if (["D-", "E"].includes(grade)) return "#F44336";
    return "#9CA3AF";
  };

  const getGradeFromMark = useCallback(
    (mark) => {
      if (isNaN(mark)) return "-";
      for (const [grade, range] of Object.entries(gradingScale)) {
        if (mark >= range.min && mark <= range.max) {
          return grade;
        }
      }
      return "-";
    },
    [gradingScale]
  );

  const calculateMark = useCallback(
    (item) => {
      if (!markCalculation) {
        const firstPaper = numberColumns[0];
        return firstPaper ? parseFloat(item[firstPaper]) || 0 : 0;
      }

      const p1 = parseFloat(item[numberColumns[0]]) || 0;
      const p2 = parseFloat(item[numberColumns[1]]) || 0;
      const p3 = numberColumns[2] ? parseFloat(item[numberColumns[2]]) || 0 : 0;

      let calculatedMark = 0;
      switch (markCalculation) {
        case "twoPaperAvg":
          calculatedMark = Math.round((p1 + p2) / 2);
          break;
        case "threePaperAvg":
          calculatedMark = Math.round((p1 + p2 + p3) / 3);
          break;
        case "threePaperAvgAdd":
          calculatedMark = Math.round(((p1 + p2) / 160) * 60 + p3);
          break;
        case "threePaperAddAgr":
          calculatedMark = Math.round((p1 + p2 + p3) / 2);
          break;
        default:
          calculatedMark = 0;
      }
      return Math.min(99, Math.max(0, calculatedMark));
    },
    [markCalculation, numberColumns]
  );

  useEffect(() => {
    const formattedData = initialData.map((item) => {
      const withDefaults = {
        ...item,
        ...numberColumns.reduce((acc, col) => {
          acc[col] = item[col] !== undefined ? parseFloat(item[col]) || 0 : 0;
          return acc;
        }, {}),
      };
      const mark = calculateMark(withDefaults);
      return {
        ...withDefaults,
        mark,
        grade: getGradeFromMark(mark),
      };
    });
    setEditedData(formattedData);

    const newInputValues = {};
    formattedData.forEach((item) => {
      numberColumns.forEach((col) => {
        newInputValues[`${item.id}-${col}`] = item[col].toString();
      });
    });
    setInputValues(newInputValues);
  }, [initialData, numberColumns, calculateMark, getGradeFromMark]);

  const handleDataChange = useCallback(
    (id, columnKey, value) => {
      setEditedData((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updatedItem = { ...item, [columnKey]: value };
          const newMark = calculateMark(updatedItem);
          return {
            ...updatedItem,
            mark: newMark,
            grade: getGradeFromMark(newMark),
          };
        })
      );
    },
    [calculateMark, getGradeFromMark]
  );

  const handleNumberInputChange = useCallback(
    (id, columnKey, e) => {
      const rawValue = e.target.value;
      if (rawValue.length > 2) return;

      setInputValues((prev) => ({
        ...prev,
        [`${id}-${columnKey}`]: rawValue,
      }));

      if (rawValue === "" || !isNaN(rawValue)) {
        let numValue = rawValue === "" ? 0 : parseInt(rawValue, 10);
        numValue = Math.min(99, Math.max(0, numValue));
        handleDataChange(id, columnKey, numValue);
      }
    },
    [handleDataChange]
  );

  const handleNumberInputBlur = useCallback(
    (id, columnKey) => {
      const rawValue = inputValues[`${id}-${columnKey}`] || "0";
      let numValue = parseInt(rawValue, 10) || 0;
      numValue = Math.min(100, Math.max(0, numValue));

      setInputValues((prev) => ({
        ...prev,
        [`${id}-${columnKey}`]: numValue.toString(),
      }));
      handleDataChange(id, columnKey, numValue);
    },
    [handleDataChange, inputValues]
  );

  const getNumberInputValue = useCallback(
    (id, columnKey, cellValue) => {
      const key = `${id}-${columnKey}`;
      return inputValues[key] !== undefined
        ? inputValues[key]
        : (cellValue || "0").toString();
    },
    [inputValues]
  );

  const filteredItems = useMemo(() => {
    if (!filterValue) return editedData;
    return editedData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(filterValue.toLowerCase())
      )
    );
  }, [editedData, filterValue]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...paginatedItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paginatedItems, sortDescriptor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = editedData.map((item) => ({
      id: item.id,
      marks: numberColumns.reduce((acc, col) => {
        acc[col] = item[col] !== undefined ? item[col] : 0;
        acc[parseInt(subjectCode)] = item.mark;
        return acc;
      }, {}),
    }));
    onSubmit?.(formData);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      if (jsonData.length === 0) return;

      // Process the Excel data to match our table structure
      const processedData = jsonData.map((row) => {
        const newRow = { id: row.id || row.ID || row.Id || "" };

        // Extract marks from the Excel columns (like 101, 101_1, etc.)
        numberColumns.forEach((col) => {
          // Try to find matching columns in the Excel file (case insensitive)
          const excelCol = Object.keys(row).find(
            (key) =>
              key.toString().toLowerCase() === col.toString().toLowerCase()
          );
          newRow[col] = excelCol ? parseFloat(row[excelCol]) || 0 : 0;
        });

        // Copy text columns
        textColumns.forEach((col) => {
          const excelCol = Object.keys(row).find(
            (key) =>
              key.toString().toLowerCase() === col.toString().toLowerCase()
          );
          newRow[col] = excelCol ? row[excelCol] : "";
        });

        // Calculate mark and grade for the imported row
        const mark = calculateMark(newRow);
        return {
          ...newRow,
          mark,
          grade: getGradeFromMark(mark),
        };
      });

      // Update the editedData state with the imported data
      setEditedData((prev) => {
        // Create a map of existing data for quick lookup
        const existingDataMap = new Map(prev.map((item) => [item.id, item]));

        // Merge existing data with imported data
        const mergedData = processedData.map((importedItem) => {
          const existingItem = existingDataMap.get(importedItem.id);
          return existingItem
            ? { ...existingItem, ...importedItem }
            : importedItem;
        });

        // Add any existing items that weren't in the import
        prev.forEach((item) => {
          if (!processedData.some((impItem) => impItem.id === item.id)) {
            mergedData.push(item);
          }
        });

        return mergedData;
      });

      // Update input values
      const newInputValues = { ...inputValues };
      processedData.forEach((item) => {
        numberColumns.forEach((col) => {
          newInputValues[`${item.id}-${col}`] = item[col].toString();
        });
      });
      setInputValues(newInputValues);

      // Reset file input to allow re-importing the same file
      e.target.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  const renderCell = useCallback(
    (item, columnKey, index) => {
      const cellValue = item[columnKey];

      if (columnKey === "s/n") {
        return (
          <p className="text-sm dark:text-gray-300">
            {(page - 1) * rowsPerPage + index + 1}
          </p>
        );
      }

      if (columnKey === "mark") {
        return (
          <p className="text-sm font-semibold dark:text-white">
            {item.mark ?? 0}
          </p>
        );
      }

      if (columnKey === "grade") {
        return (
          <Badge bgColor={getBadgeColor(item.grade)}>{item.grade ?? "-"}</Badge>
        );
      }

      if (textColumns.includes(columnKey)) {
        return (
          <input
            type="text"
            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={cellValue || ""}
            onChange={(e) =>
              handleDataChange(item.id, columnKey, e.target.value)
            }
          />
        );
      } else if (numberColumns.includes(columnKey)) {
        return (
          <ReusableInput
            type="number"
            min="0"
            max="100"
            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={getNumberInputValue(item.id, columnKey, cellValue)}
            onChange={(e) => handleNumberInputChange(item.id, columnKey, e)}
            onBlur={() => handleNumberInputBlur(item.id, columnKey)}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) e.preventDefault();
            }}
          />
        );
      }

      return <p className="text-sm dark:text-gray-300">{cellValue}</p>;
    },
    [
      page,
      rowsPerPage,
      inputValues,
      handleDataChange,
      handleNumberInputChange,
      handleNumberInputBlur,
      getNumberInputValue,
      textColumns,
      numberColumns,
    ]
  );

  return (
    <div className="max-w-3xl flex-1">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-end">
          <div className="w-full sm:max-w-[44%]">
            <div className="relative flex items-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
              <div className="absolute left-3 text-gray-300 dark:text-gray-500">
                <GoSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 text-sm bg-transparent outline-none dark:text-white dark:placeholder-gray-400"
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  setPage(1);
                }}
              />
              {filterValue && (
                <button
                  className="absolute right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setFilterValue("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <label className="flex items-center text-sm text-gray-400 dark:text-gray-500 gap-1">
            Rows per page:
            <select
              className="text-sm border rounded px-1 py-0.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>

      <form id="marksForm" onSubmit={handleSubmit}>
        <div className="overflow-x-auto">
          <div
            className={`border border-${borderColor} rounded-md overflow-hidden min-w-max`}
          >
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-transparent">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                    S/N
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.uid}
                      className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      onClick={() => {
                        if (col.sortable) {
                          setSortDescriptor((prev) => ({
                            column: col.uid,
                            direction:
                              prev.direction === "ascending"
                                ? "descending"
                                : "ascending",
                          }));
                        }
                      }}
                    >
                      <div
                        className={`flex items-center ${
                          col.sortable ? "cursor-pointer" : ""
                        }`}
                      >
                        {col.name}
                        {col.sortable && sortDescriptor.column === col.uid && (
                          <span className="ml-1">
                            {sortDescriptor.direction === "ascending"
                              ? "↑"
                              : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="text-center px-4 py-6 text-sm text-gray-500 dark:text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : sortedItems.length > 0 ? (
                  sortedItems.map((item, index) => (
                    <tr key={item.id} className={rowColors.default}>
                      <td className="px-4 py-3">
                        {renderCell(item, "s/n", index)}
                      </td>
                      {columns.map((col) => (
                        <td key={`${item.id}-${col.uid}`} className="px-4 py-3">
                          {renderCell(item, col.uid, index)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="text-center px-4 py-6 text-sm text-gray-500 dark:text-gray-400"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </form>

      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredItems.length / rowsPerPage)}
          onPageChange={setPage}
        />
        {showButtons && (
          <div className="flex gap-2 flex-wrap justify-end">
            <Button
              variant="secondary"
              onClick={handleCancel}
              size="sm"
              icon={AiOutlineClear}
            >
              Reset
            </Button>

            <label className="my-4 px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelImport}
                className="hidden"
              />
              <FaRegFileExcel className="mr-1" />
              Import
            </label>

            <Button
              type="submit"
              variant="primary"
              form="marksForm"
              size="sm"
              icon={FaRegSave}
              loading={false}
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex gap-1">
    <button
      className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
    >
      Previous
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentPage === page
            ? "bg-black dark:bg-blue-600 text-white"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        }`}
        onClick={() => onPageChange(page)}
      >
        {page}
      </button>
    ))}
    <button
      className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Next
    </button>
  </div>
);

export default TableMarkComponent;
