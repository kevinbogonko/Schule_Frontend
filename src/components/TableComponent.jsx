import React, { useState, useMemo, useCallback, useEffect } from "react";
import { BsThreeDotsVertical, BsEye, BsPencil, BsTrash } from "react-icons/bs";
import { GoSearch } from "react-icons/go";
import { FiPlus, FiSun, FiMoon } from "react-icons/fi";

const TableComponent = ({
  columns,
  data: initialData = [],
  loading = false,
  excludedColumns = [],
  buttons = {
    addButton: {
      show: true,
      label: "Add New",
      icon: <FiPlus className="w-4 h-4" />,
    },
    actionButtons: {
      show: true,
      options: [
        { label: "View", icon: <BsEye className="w-4 h-4" /> },
        { label: "Edit", icon: <BsPencil className="w-4 h-4" /> },
        { label: "Delete", icon: <BsTrash className="w-4 h-4" /> },
      ],
    },
  },
  showSelectAllCheckbox = true,
  striped = false,
  borderColor = "gray-200",
  rowColors = {
    default: "hover:bg-gray-50 dark:hover:bg-gray-800",
    selected: "bg-gray-100 dark:bg-gray-700",
  },
  horizontalTableFlow = true,
  staticColumns = ["s/n"],
  staticColumnBg = "bg-white dark:bg-gray-900",
  staticColumnShadow = "shadow-[5px_0_5px_-5px_rgba(0,0,0,0.1)] dark:shadow-[5px_0_5px_-5px_rgba(255,255,255,0.1)]",
}) => {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: columns[0]?.uid || "id",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("darkMode") === "true" ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches &&
        localStorage.getItem("darkMode") !== "false")
    );
  });

  // Apply dark mode
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("transition-colors", "duration-500");

    if (darkMode) {
      html.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }

    const timer = setTimeout(() => {
      html.classList.remove("transition-colors", "duration-500");
    }, 500);

    return () => {
      clearTimeout(timer);
      html.classList.remove("transition-colors", "duration-500");
    };
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const formattedData = useMemo(() => {
    return initialData.map((item) => {
      const formattedItem = { ...item };
      Object.keys(item).forEach((key) => {
        if (
          typeof item[key] === "object" &&
          item[key] !== null &&
          "min" in item[key] &&
          "max" in item[key]
        ) {
          formattedItem[key] = `${item[key].min}-${item[key].max}`;
        }
      });
      return formattedItem;
    });
  }, [initialData]);

  const visibleColumns = useMemo(() => {
    return columns.filter((column) => !excludedColumns.includes(column.uid));
  }, [columns, excludedColumns]);

  const pages = Math.ceil(formattedData.length / rowsPerPage);
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredData = [...formattedData];
    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }
    return filteredData;
  }, [formattedData, filterValue, hasSearchFilter]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const toggleSelectRow = useCallback((id) => {
    setSelectedKeys((prev) => {
      const newKeys = new Set(prev);
      if (newKeys.has(id)) {
        newKeys.delete(id);
      } else {
        newKeys.add(id);
      }
      return newKeys;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedKeys.size === items.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(items.map((item) => item.id)));
    }
  }, [items, selectedKeys.size]);

  const renderCell = useCallback(
    (item, columnKey, index) => {
      const column = columns.find((col) => col.uid === columnKey);
      let cellValue = item[columnKey];

      if (column?.format && cellValue !== undefined) {
        cellValue = column.format(cellValue, item);
      }

      switch (columnKey) {
        case "s/n":
          return (
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {(page - 1) * rowsPerPage + index + 1}
            </p>
          );
        case "actions":
          if (!buttons.actionButtons?.show) return null;
          return (
            <div className="relative flex justify-end items-center">
              <button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionMenu(
                    openActionMenu === item.id ? null : item.id
                  );
                }}
              >
                <BsThreeDotsVertical className="text-gray-400 dark:text-gray-500 w-5 h-5" />
              </button>
              {openActionMenu === item.id && (
                <div className="absolute right-0 top-full z-20 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 mt-1">
                  <div className="py-1">
                    {buttons.actionButtons.options.map((button, idx) => (
                      <button
                        key={`${item.id}-${button.label}-${idx}`}
                        className="flex items-center w-full text-left px-4 py-2 gap-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          button.onClick?.(item.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        {button.icon} {button.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        case "checkbox":
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedKeys.has(item.id)}
                onChange={() => toggleSelectRow(item.id)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:checked:border-indigo-500"
              />
            </div>
          );
        default:
          return (
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {cellValue}
            </p>
          );
      }
    },
    [
      selectedKeys,
      openActionMenu,
      buttons.actionButtons,
      page,
      rowsPerPage,
      columns,
      toggleSelectRow,
    ]
  );

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((e) => {
    setFilterValue(e.target.value);
    setPage(1);
  }, []);

  const TopContent = useMemo(
    () => () =>
      (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-3 items-end">
            <div className="w-full sm:max-w-[44%]">
              <div className="relative flex items-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                <div className="absolute left-3 text-gray-300 dark:text-gray-500">
                  <GoSearch className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 text-sm bg-transparent outline-none dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  value={filterValue}
                  onChange={onSearchChange}
                  onFocus={(e) => e.target.select()}
                />
                {filterValue && (
                  <button
                    className="absolute right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    onClick={() => {
                      setFilterValue("");
                      document.querySelector('input[type="text"]')?.focus();
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* <button
                onClick={toggleDarkMode}
                className="p-1 rounded-full text-gray-600 dark:text-yellow-300 hover:text-gray-900 dark:hover:text-yellow-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center h-8 w-8 transition-all duration-500 transform hover:scale-110"
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <FiSun className="h-5 w-5 transition-transform duration-500" />
                ) : (
                  <FiMoon className="h-5 w-5 transition-transform duration-500" />
                )}
              </button> */}
              {buttons.addButton?.show && (
                <button
                  className={`bg-black dark:bg-indigo-600 text-white rounded-md px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors duration-300`}
                  onClick={() => buttons.addButton.onClick?.()}
                >
                  {buttons.addButton.label}
                  {buttons.addButton.icon}
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 dark:text-gray-500 text-sm">
              Total {formattedData.length} records
            </span>
            <label className="flex items-center text-gray-400 dark:text-gray-500 text-sm gap-1 mb-2">
              Rows per page:
              <select
                className="bg-transparent outline-none text-gray-400 dark:text-gray-500 text-sm border rounded px-1 py-0.5 dark:bg-gray-800 dark:border-gray-700"
                onChange={onRowsPerPageChange}
                value={rowsPerPage}
              >
                {[10, 25, 50].map((option) => (
                  <option key={`rows-option-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ),
    [
      filterValue,
      onSearchChange,
      onRowsPerPageChange,
      rowsPerPage,
      buttons.addButton,
      formattedData.length,
      darkMode,
      toggleDarkMode,
    ]
  );

  const BottomContent = useMemo(
    () => () =>
      (
        <div className="py-2 px-2 flex justify-between items-center">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={setPage}
            disabled={hasSearchFilter}
            darkMode={darkMode}
          />
          {showSelectAllCheckbox && (
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {selectedKeys.size === items.length && items.length > 0
                ? "All items selected"
                : `${selectedKeys.size} of ${items.length} selected`}
            </span>
          )}
        </div>
      ),
    [
      page,
      pages,
      hasSearchFilter,
      showSelectAllCheckbox,
      selectedKeys.size,
      items.length,
      darkMode,
    ]
  );

  const calculateStickyLeft = (columnKey, index) => {
    const baseColumns = [];
    if (showSelectAllCheckbox) baseColumns.push("checkbox");
    baseColumns.push("s/n");

    const allStaticColumns = [
      ...baseColumns,
      ...staticColumns.filter((col) => col !== "s/n"),
    ];
    const position = allStaticColumns.indexOf(columnKey);

    if (position === 0) return "left-0";
    if (position === 1) return "left-10";
    if (position === 2) return "left-20";
    return "left-0";
  };

  const allColumns = useMemo(() => {
    const cols = [];
    if (showSelectAllCheckbox) {
      cols.push({ uid: "checkbox", name: "", sortable: false });
    }
    cols.push({ uid: "s/n", name: "S/N", sortable: false });
    return [...cols, ...visibleColumns];
  }, [visibleColumns, showSelectAllCheckbox]);

  return (
    <div className="flex flex-col h-full flex-1 overflow-hidden">
      <TopContent />
      <div
        className={`border border-${borderColor} dark:border-gray-700 rounded-md overflow-hidden flex-1 flex flex-col bg-white dark:bg-gray-900 transition-colors duration-500`}
      >
        <div className="overflow-x-auto flex-1">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-transparent border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {allColumns.map((column, index) => (
                    <th
                      key={`header-${column.uid}`}
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                        column.uid === "actions" ? "text-center" : "text-left"
                      } ${
                        staticColumns.includes(column.uid) ||
                        column.uid === "s/n" ||
                        column.uid === "checkbox"
                          ? `sticky ${calculateStickyLeft(
                              column.uid,
                              index
                            )} ${staticColumnBg} ${staticColumnShadow} z-10`
                          : ""
                      }`}
                      onClick={() => {
                        if (column.sortable) {
                          setSortDescriptor({
                            column: column.uid,
                            direction:
                              sortDescriptor.direction === "ascending"
                                ? "descending"
                                : "ascending",
                          });
                        }
                      }}
                    >
                      <div
                        className={`flex items-center ${
                          column.sortable ? "cursor-pointer" : ""
                        }`}
                      >
                        {column.name}
                        {column.sortable && (
                          <span className="ml-1">
                            {sortDescriptor.column === column.uid &&
                              (sortDescriptor.direction === "ascending"
                                ? "↑"
                                : "↓")}
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
                      colSpan={allColumns.length}
                      className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : sortedItems.length > 0 ? (
                  sortedItems.map((item, index) => {
                    const rowId = item.id || `row-${index}`;
                    const rowColorClass = selectedKeys.has(rowId)
                      ? rowColors.selected
                      : rowColors.default;
                    const stripeClass =
                      striped && index % 2 === 0
                        ? "bg-gray-50 dark:bg-gray-800"
                        : "";

                    return (
                      <tr
                        key={rowId}
                        className={`${rowColorClass} ${stripeClass} transition-colors duration-300`}
                      >
                        {allColumns.map((column, colIndex) => (
                          <td
                            key={`cell-${rowId}-${column.uid}`}
                            className={`px-4 py-3 whitespace-nowrap ${
                              staticColumns.includes(column.uid) ||
                              column.uid === "s/n" ||
                              column.uid === "checkbox"
                                ? `sticky ${calculateStickyLeft(
                                    column.uid,
                                    colIndex
                                  )} ${staticColumnBg} ${staticColumnShadow} z-1 ${rowColorClass} ${stripeClass}`
                                : ""
                            }`}
                          >
                            {renderCell(item, column.uid, index)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={allColumns.length}
                      className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <BottomContent />
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled,
  darkMode,
}) => {
  return (
    <div className="flex gap-1">
      <button
        className={`px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 ${
          disabled ? "" : "hover:bg-gray-100 dark:hover:bg-gray-700"
        } text-gray-700 dark:text-gray-200 transition-colors duration-300`}
        disabled={currentPage === 1 || disabled}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={`page-${page}`}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === page
              ? "bg-black dark:bg-indigo-600 text-white"
              : `hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  disabled ? "opacity-50" : ""
                }`
          } transition-colors duration-300`}
          disabled={disabled}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className={`px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 ${
          disabled ? "" : "hover:bg-gray-100 dark:hover:bg-gray-700"
        } text-gray-700 dark:text-gray-200 transition-colors duration-300`}
        disabled={currentPage === totalPages || disabled}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default TableComponent;
