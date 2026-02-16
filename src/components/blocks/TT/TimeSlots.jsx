import { useState, useEffect } from "react";
import ReusableDiv from "../../ui/ReusableDiv";
import ReusableSelect from "../../ui/ReusableSelect";
import { MdDone } from "react-icons/md";
import { yearOptions, termOptions } from "../../../utils/CommonData";
import api from "../../../hooks/api";
import Checkbox from "../../ui/Checkbox";
import Button from "../../ui/Button";
import ReusableInput from "../../ui/ReusableInput";
import { useToast } from "../../ui/Toast";
import TimeInput from "../../ui/TimeInput";
import { FaMinus, FaPlus, FaSpinner } from "react-icons/fa";
import TableComponent from "../../ui/TableComponent";
import { BsPencil, BsEye } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import TimeSlotRU from "./TimeSlotRU";

const TimeSlots = (syst_level) => {
  let isCBC;
  syst_level === "Secondary (8-4-4)" ? (isCBC = false) : (isCBC = true);

  const { showToast } = useToast();
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [dayClusters, setDayClusters] = useState([]);
  const [selectedDayCluster, setSelectedDayCluster] = useState("");
  const [clusterData, setClusterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    editTimeSlot: false,
    viewTimeSlot: false,
  });
  const [selectedUtility, setSelectedUtility] = useState("");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [rowData, setRowData] = useState(null);

  const columns = [
    { name: "UTILITY", uid: "utility", sortable: true },
    { name: "DAYS", uid: "days", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

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

        const formattedClusters = response.data.map((cluster) => ({
          value: cluster.id,
          label: cluster.cluster_name,
        }));

        setDayClusters(formattedClusters);
        setLoading(false);
      } catch (error) {
        showToast("Failed to fetch day clusters", "error");
        setLoading(false);
      }
    }
  };

  const handleDayClusterChange = async (e) => {
    const clusterId = e.target.value;
    setSelectedDayCluster(clusterId);

    if (selectedYear && selectedTerm && clusterId) {
      try {
        setLoading(true);
        const response = await api.post("/timetable/getdayclusters", {
          year: Number(selectedYear),
          term: Number(selectedTerm),
        });

        const selectedCluster = response.data.find(
          (cluster) => cluster.id === Number(clusterId)
        );

        if (selectedCluster) {
          const formattedData = [];
          let idCounter = 1;

          for (const [utility, value] of Object.entries(
            selectedCluster.utilities
          )) {
            if (value === 1) {
              const activeDays = [];
              for (const [day, dayValue] of Object.entries(
                selectedCluster.days
              )) {
                if (dayValue === 1) {
                  activeDays.push(day);
                }
              }

              formattedData.push({
                id: idCounter++,
                utility: utility,
                days: activeDays.join(", "),
                utilityValue: utility,
                daysArray: activeDays,
              });
            }
          }

          setClusterData(formattedData);
        }
        setLoading(false);
      } catch (error) {
        showToast("Failed to fetch cluster data", "error");
        setLoading(false);
      }
    }
  };

  const handleEditClick = async (rowId) => {
    const row = clusterData.find((item) => item.id === rowId);
    if (!row) return;

    setSelectedUtility(row.utilityValue);
    setRowData(row);
    setShowLoadingOverlay(true);

    try {
      const utility = row.utilityValue.toLowerCase();
      const response = await api.post("/timetable/gettimeslots", {
        year: Number(selectedYear),
        term: Number(selectedTerm),
        utility,
      });

      setRowData({
        ...row,
        timeSlots: response.data,
      });

      setTimeout(() => {
        setShowLoadingOverlay(false);
        setModalState({ ...modalState, editTimeSlot: true });
      }, 300);
    } catch (error) {
      console.log(error);
      showToast("Failed to fetch time slot data", "error");
      setShowLoadingOverlay(false);
    }
  };

  const handlePreview = async (rowId) => {
    const row = clusterData.find((item) => item.id === rowId);
    if (!row) return;

    setSelectedUtility(row.utilityValue);
    setRowData(row);
    setShowLoadingOverlay(true);

    try {
      const utility = row.utilityValue.toLowerCase();
      const response = await api.post("/timetable/gettimeslots", {
        year: Number(selectedYear),
        term: Number(selectedTerm),
        utility,
      });

      setRowData({
        ...row,
        timeSlots: response.data,
      });

      setTimeout(() => {
        setShowLoadingOverlay(false);
        setModalState({ ...modalState, viewTimeSlot: true });
      }, 300);
    } catch (error) {
      showToast("Failed to fetch time slot data", "error");
      setShowLoadingOverlay(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Timeslots
      </h1>
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
      <div className="flex my-2 gap-4">
        <div className="w-full lg:w-1/4">
          <ReusableDiv className="ml-0 mr-0 mb-2 ring-1 h-fit dark:bg-gray-800">
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

              <div className="w-full">
                <label
                  htmlFor="day_cluster"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Day Cluster
                </label>
                <ReusableSelect
                  id="day_cluster"
                  placeholder="Select Day Cluster"
                  options={dayClusters}
                  value={selectedDayCluster}
                  onChange={handleDayClusterChange}
                  disabled={!selectedTerm}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
        </div>
        <div className="w-full lg:w-3/4">
          <TableComponent
            columns={columns}
            data={clusterData}
            loading={loading}
            buttons={{
              addButton: {
                show: false,
                label: "Add Cluster",
                icon: <FiPlus className="w-4 h-4" />,
              },
              actionButtons: {
                show: true,
                options: [
                  {
                    label: "Configure",
                    icon: <BsPencil className="w-4 h-4" />,
                    onClick: (rowId) => handleEditClick(rowId),
                  },
                  {
                    label: "Preview",
                    icon: <BsEye className="w-4 h-4" />,
                    onClick: (rowId) => handlePreview(rowId),
                  },
                ],
              },
            }}
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
      <TimeSlotRU
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        showLoadingOverlay={showLoadingOverlay}
        setShowLoadingOverlay={setShowLoadingOverlay}
        selectedYear={selectedYear}
        selectedTerm={selectedTerm}
        selectedUtility={selectedUtility}
        isCBC
      />
    </div>
  );
};

export default TimeSlots;
