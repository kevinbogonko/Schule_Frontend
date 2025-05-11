import React, { useState, useEffect } from "react";
import TableComponent from "../TableComponent";
import { FiPlus } from "react-icons/fi";
import { BsEye, BsPencil, BsTrash } from "react-icons/bs";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { FaSpinner} from "react-icons/fa";
import api from "../../hooks/api";
import { useToast } from "../Toast";
import { yearOptions } from "../../utils/CommonData";
import StaffCRUD from "../snippets/StaffCRUD";

const Staff = () => {
  const { showToast } = useToast();
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [rowData, setRowData] = useState("");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  // Modal States
  const [modalState, setModalState] = useState({
    addStaff: false,
    viewStaff: false,
    editStaff: false,
  });

  // Define your columns
  const columns = [
    { name: "STAFF NO.", uid: "id", sortable: true },
    { name: "NAME", uid: "name", sortable: true },
    { name: "PHONE", uid: "phone", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const excludedColumns = [];

  // Handle year change to fetch staff data
  useEffect(() => {
    if (selectedYear) {
      const payload = { year: selectedYear };

      setLoading(true);
      setShowLoadingOverlay(true);
      const fetchData = async () => {
        try {
          const response = await api.post("/teacher/getteachers", payload);
          const transformedData = response.data.map((staff) => ({
            ...staff,
            name: `${staff.title} ${staff.fname} ${staff.lname}`,
            status: "Active",
          }));
          setStaffData(transformedData);
        } catch (error) {
          setError(error.response?.data?.message);
          showToast(
            error.response?.data?.message || "Failed to fetch staff",
            "error"
          );
        } finally {
          setLoading(false);
          setShowLoadingOverlay(false);
        }
      };
      fetchData();
    }
  }, [selectedYear, modalState.editStaff, modalState.viewStaff]);

  const handleDelete = async (rowData) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;

    setLoading(true);
    setShowLoadingOverlay(true);
    try {
      const response = await api.post(`/teacher/deleteteacher/${rowData}`);
      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 204
      ) {
        showToast("Teacher Deleted Successfully", "success", {
          duration: 3000,
          position: "top-center",
        });

        // Remove the deleted staff member from the staffData array
        setStaffData((prevData) =>
          prevData.filter((staff) => staff.id !== rowData)
        );
      }
    } catch (error) {
      setError(error.response?.data?.message);
      showToast(
        error.response?.data?.message || "Failed to delete teacher",
        "error",
        {
          duration: 3000,
          position: "top-center",
        }
      );
    } finally {
      setLoading(false);
      setShowLoadingOverlay(false);
    }
  };

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Staff Management
      </h1>

      <div className="flex flex-col lg:flex-row gap-2">
        {/* Loading Overlay */}
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

        {/* Form Controls */}
        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 mb-2 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
            tag="Manage Teachers"
            icon={FaSpinner}
          >
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
                  value={
                    yearOptions.find(
                      (option) => option.value === selectedYear
                    ) || undefined
                  }
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
        </div>

        {/* Table Content */}
        <div className="w-full lg:w-3/4">
          <div
            className={`bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4 ${
              loading ? "opacity-75" : ""
            }`}
          >
            <TableComponent
              columns={columns}
              data={staffData}
              loading={loading}
              horizontalTableFlow={true}
              excludedColumns={excludedColumns}
              showSelectAllCheckbox={false}
              striped={true}
              buttons={{
                addButton: {
                  show: true,
                  label: "Add Teacher",
                  icon: <FiPlus className="w-4 h-4" />,
                  onClick: () =>
                    setModalState((prev) => ({ ...prev, addStaff: true })),
                },
                actionButtons: {
                  show: true,
                  options: [
                    {
                      label: "View",
                      icon: <BsEye className="w-4 h-4" />,
                      onClick: (row) => {
                        setRowData(row);
                        setModalState((prev) => ({ ...prev, viewStaff: true }));
                      },
                    },
                    {
                      label: "Edit",
                      icon: <BsPencil className="w-4 h-4" />,
                      onClick: (row) => {
                        setRowData(row);
                        setModalState((prev) => ({ ...prev, editStaff: true }));
                      },
                    },
                    {
                      label: "Delete",
                      icon: <BsTrash className="w-4 h-4" />,
                      onClick: (row) => handleDelete(row),
                    },
                  ],
                },
              }}
              borderColor="blue-200 dark:border-gray-600"
              rowColors={{
                default: "hover:bg-blue-50 dark:hover:bg-gray-700",
                selected: "bg-blue-100 dark:bg-gray-700",
              }}
              defaultVisibleColumns={["name", "id", "phone", "actions"]}
              mobileBreakpoint="sm"
            />
          </div>
        </div>
      </div>

      <StaffCRUD
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        refreshTable={() => {
          const payload = { year: selectedYear };
          api.post("/teacher/getteachers", payload).then((response) => {
            const transformedData = response.data.map((staff) => ({
              ...staff,
              name: `${staff.title} ${staff.fname} ${staff.lname}`,
              status: "Active",
            }));
            setStaffData(transformedData);
          });
        }}
      />
    </div>
  );
};

export default Staff;
