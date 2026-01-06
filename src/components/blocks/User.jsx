import React, { useState, useEffect } from "react";
import TableComponent from "../TableComponent";
import { FiPlus } from "react-icons/fi";
import { BsEye, BsPencil, BsTrash } from "react-icons/bs";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { FaSpinner } from "react-icons/fa";
import api from "../../hooks/api";
import { useToast } from "../Toast";
import UserCRUD from "../snippets/UserCRUD";
import Button from "../ui/raw/Button";

const User = () => {
  const { showToast } = useToast();
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rowData, setRowData] = useState("");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [userType, setUserType] = useState("");
  const [statusFilter, setStatusFilter] = useState(1);

  // Modal States
  const [modalState, setModalState] = useState({
    addUser: false,
    editUser: false,
  });

  // Define your columns
  const columns = [
    // { name: "S/N", uid: "s_n", sortable: true },
    { name: "USER ID", uid: "user_id", sortable: true },
    { name: "NAME", uid: "fullname", sortable: true },
    { name: "USERNAME", uid: "username", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const excludedColumns = [];

  // Handle user type and status filter change to fetch user data
  const handleFetchUsers = async () => {
    const payload = {
      is_active: statusFilter,
      role: userType,
    };

    setLoading(true);
    setShowLoadingOverlay(true);
    try {
      const response = await api.post("/auth/users", payload);
      const transformedData = response.data.map((user, index) => ({
        ...user,
        s_n: index + 1,
        name: `${user.title} ${user.fname} ${user.lname}`,
        status: "Active",
      }));
      setStaffData(transformedData);
    } catch (error) {
      setError(error.response?.data?.message);
      showToast(
        error.response?.data?.message || "Failed to fetch users",
        "error",
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setLoading(false);
      setShowLoadingOverlay(false);
    }
  };

  // Delete user functionality
  const handleDeleteUser = async (row) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setShowLoadingOverlay(true);
      await api.post("/auth/deleteuser", {
        id: row,
      });
      
      showToast("User deleted successfully", "success", {duration: 3000, position : 'top-right'});
      
      // Refresh the table data after deletion
      handleFetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      showToast(
        error.response?.data?.message || "Failed to delete user",
        "error",
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  // Fetch users when component mounts or filters change
  useEffect(() => {
    if (userType) {
      handleFetchUsers();
    }
  }, [userType, statusFilter]);

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        User Management
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
            tag="Manage Users"
            icon={FaSpinner}
          >
            <div className="flex flex-col space-y-3 pb-4">
              <div className="w-full">
                <label
                  htmlFor="userType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Users
                </label>
                <ReusableSelect
                  id="userType"
                  placeholder="Select User Type"
                  options={[
                    { value: "student", label: "Students" },
                    { value: "teacher", label: "Teachers" },
                    { value: "admin", label: "Admins" },
                  ]}
                  value={
                    [
                      { value: "student", label: "Students" },
                      { value: "teacher", label: "Teachers" },
                      { value: "admin", label: "Admins" },
                    ].find((option) => option.value === userType) || undefined
                  }
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Status
                </label>
                <ReusableSelect
                  id="status"
                  placeholder="Select Status"
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                    { value: "2", label: "All" },
                  ]}
                  value={
                    [
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                      { value: "2", label: "All" },
                    ].find((option) => option.value === statusFilter) || {
                      value: "1",
                      label: "Active",
                    }
                  }
                  onChange={(e) => setStatusFilter(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <Button onClick={handleFetchUsers} className="w-ful">
                {" "}
                Go
              </Button>
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
                  show: userType === "admin",
                  label: "Add User",
                  icon: <FiPlus className="w-4 h-4" />,
                  onClick: () =>
                    setModalState((prev) => ({ ...prev, addUser: true })),
                },
                actionButtons: {
                  show: true,
                  options:
                    userType === "admin"
                      ? [
                          {
                            label: "Edit",
                            icon: <BsPencil className="w-4 h-4" />,
                            onClick: (row) => {
                              setRowData(row);
                              setModalState((prev) => ({
                                ...prev,
                                editUser: true,
                              }));
                            },
                          },
                          {
                            label: "Delete",
                            icon: <BsTrash className="w-4 h-4" />,
                            onClick: (row) => handleDeleteUser(row),
                          },
                        ]
                      : [
                          {
                            label: "Edit",
                            icon: <BsPencil className="w-4 h-4" />,
                            onClick: (row) => {
                              setRowData(row);
                              setModalState((prev) => ({
                                ...prev,
                                editUser: true,
                              }));
                            },
                          },
                        ],
                },
              }}
              borderColor="blue-200 dark:border-gray-600"
              rowColors={{
                default: "hover:bg-blue-50 dark:hover:bg-gray-700",
                selected: "bg-blue-100 dark:bg-gray-700",
              }}
              defaultVisibleColumns={[
                // "s_n",
                "user_id",
                "fullname",
                "username",
                "actions",
              ]}
              mobileBreakpoint="sm"
            />
          </div>
        </div>
      </div>

      <UserCRUD
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        refreshTable={handleFetchUsers}
      />
    </div>
  );
};

export default User;