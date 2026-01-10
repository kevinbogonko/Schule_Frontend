import React, { useState, useEffect } from "react";
import ReusableDiv from "../../ui/ReusableDiv";
import TableComponent from "../../ui/TableComponent";
import ReusableSelect from "../../ui/ReusableSelect";
import { FaSpinner } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { BsPencil, BsTrash } from "react-icons/bs";
import { yearOptions, termOptions } from "../../../utils/CommonData";
import { useToast } from "../../ui/Toast";
import api from "../../../hooks/api";
import Button from "../../ui/Button";
import CRUDDayClusters from "./CRUDDayClusters";
import Alert from "../../ui/Alert";

const DayClusters = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [dayClusters, setDayClusters] = useState([]);
  const [modalState, setModalState] = useState({
    addCluster: false,
    editCluster: false,
  });
  const [rowData, setRowData] = useState(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const weekDaysOptions = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ];

  const utilitiesOptions = [
    { value: "MR", label: "Morning Remedial (MR)" },
    { value: "D", label: "Standard Day (D)" },
    { value: "ER", label: "Evening Remedial (ER)" },
  ];

  const columns = [
    // { name: "ID", uid: "id", sortable: true },
    { name: "DAY CLUSTER", uid: "day_cluster", sortable: true },
    { name: "DAYS", uid: "days", sortable: true },
    { name: "UTILITIES", uid: "utilities", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const formatClusterData = (data) => {
    return data.map((cluster, index) => ({
      id: cluster.id,
      sn: index + 1,
      day_cluster: cluster.cluster_name,
      days: Object.entries(cluster.days)
        .filter(([_, value]) => value === 1)
        .map(([day]) => day)
        .join(", "),
      utilities: Object.entries(cluster.utilities)
        .filter(([_, value]) => value === 1)
        .map(([util]) => util)
        .join(", "),
    }));
  };

  const handleTermChange = async (e) => {
    const term = e.target.value;
    setSelectedTerm(term);

    if (selectedYear && term) {
      try {
        setLoading(true);
        const response = await api.post("/timetable/getdayclusters", {
          year: Number(selectedYear),
          term: Number(term),
        });
        setDayClusters(formatClusterData(response.data));
      } catch (error) {
        showToast("Error fetching day clusters", "error", {
          duration: 3000,
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = async (row) => {
    try {
      setShowLoadingOverlay(true);
      const response = await api.post("/timetable/getdaycluster", {
        id: Number(row),
      });

      const clusterData = response.data;
      setRowData({
        ...row,
        ...clusterData,
        year: selectedYear,
        term: selectedTerm,
      });

      setTimeout(() => {
        setModalState((prev) => ({
          ...prev,
          editCluster: true,
        }));
        setShowLoadingOverlay(false);
      }, 300);
    } catch (error) {
      showToast("Error fetching cluster details", "error", {
        duration: 3000,
        position: "top-right",
      });
      setShowLoadingOverlay(false);
    }
  };

  const handleDeleteClick = async (row) => {
    if (!window.confirm("Are you sure you want to delete this day cluster?"))
      return;

    try {
      setLoading(true);
      await api.post(`/timetable/deletedaycluster/${Number(row)}`, {}, {headers : {
        'Content-Type' : 'application/json'
      }});
      showToast("Day Cluster Deleted Successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
      refreshTable();
    } catch (error) {
      showToast("Failed to delete day cluster", "error", {duration : 3000, position : "top-right"});
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setRowData({
      year: selectedYear,
      term: selectedTerm,
    });
    setModalState((prev) => ({ ...prev, addCluster: true }));
  };

  const refreshTable = async () => {
    if (selectedYear && selectedTerm) {
      try {
        setLoading(true);
        const response = await api.post("/timetable/getdayclusters", {
          year: Number(selectedYear),
          term: Number(selectedTerm),
        });
        setDayClusters(formatClusterData(response.data));
      } catch (error) {
        showToast("Error refreshing day clusters", "error", {
          duration: 3000,
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-0">
      <Alert
        message={
          "Note: MR = Morning Remedial, D = Standard Day Schedule, ER = Evening Remedial"
        }
        className="my-4"
      />

      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
            <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
              Loading Data...
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/4">
          <ReusableDiv className="ml-0 mr-0 mb-2 ring-1 h-fit bg-blue-100 dark:bg-gray-800">
            <div className="flex flex-col space-y-3 pb-4">
              <div className="w-full">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Year
                </label>
                <ReusableSelect
                  id="year"
                  placeholder="Select Year"
                  options={yearOptions}
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedTerm("");
                    setDayClusters([]);
                  }}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="term"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Term
                </label>
                <ReusableSelect
                  id="term"
                  placeholder="Select Term"
                  options={termOptions}
                  value={selectedTerm}
                  onChange={handleTermChange}
                  disabled={!selectedYear}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
        </div>

        <div className="w-full lg:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4">
            <TableComponent
              columns={columns}
              data={dayClusters}
              buttons={{
                addButton: {
                  show: !!selectedTerm,
                  label: "Add Cluster",
                  icon: <FiPlus className="w-4 h-4" />,
                  onClick: handleAddClick,
                },
                actionButtons: {
                  show: true,
                  options: [
                    {
                      label: "Edit",
                      icon: <BsPencil className="w-4 h-4" />,
                      onClick: (row) => {
                        handleEditClick(row)},
                    },
                    {
                      label: "Delete",
                      icon: <BsTrash className="w-4 h-4" />,
                      onClick: (row) => handleDeleteClick(row),
                    },
                  ],
                },
              }}
              loading={loading}
              horizontalTableFlow={true}
              showSelectAllCheckbox={false}
              striped={true}
              borderColor="blue-200 dark:border-gray-600"
              rowColors={{
                default: "hover:bg-blue-50 dark:hover:bg-gray-700",
                selected: "bg-blue-100 dark:bg-gray-700",
              }}
              mobileBreakpoint="sm"
            />
          </div>
        </div>
      </div>

      <CRUDDayClusters
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        weekDaysOptions={weekDaysOptions}
        utilitiesOptions={utilitiesOptions}
        refreshTable={refreshTable}
        showLoadingOverlay={showLoadingOverlay}
        setShowLoadingOverlay={setShowLoadingOverlay}
      />
    </div>
  );
};

export default DayClusters;
