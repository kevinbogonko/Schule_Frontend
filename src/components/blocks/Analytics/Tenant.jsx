import React, { useState, useEffect } from "react";
import TableComponent from "../../ui/TableComponent";
import { FiPlus } from "react-icons/fi";
import { BsPencil, BsTrash } from "react-icons/bs";
import ReusableDiv from "../../ui/ReusableDiv";
import Dropdown from "../../ui/Dropdown";
import { FaSpinner } from "react-icons/fa";
import api from "../../../hooks/api";
import { useToast } from "../../ui/Toast";
import TenantCRUD from "../../snippets/TenantCRUD";
import Button from "../../ui/Button";
import { categoryOptions, statusOptions } from "../../../utils/CommonData";

const Tenant = () => {
  const { showToast } = useToast();
  const [tenantData, setTenantData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rowData, setRowData] = useState("");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  // Modal States
  const [modalState, setModalState] = useState({
    addTenant: false,
    editTenant: false,
  });

  // Define your columns
  const columns = [
    { name: "SCHOOL NAME", uid: "school_name", sortable: true },
    { name: "CATEGORY", uid: "category", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const excludedColumns = [];

  // Fetch tenants based on filters
  const handleFetchTenants = async () => {
    const payload = {
      category: category,
      status: status,
    };

    setLoading(true);
    setShowLoadingOverlay(true);
    try {
      const response = await api.post("/tenant/gettenants", payload);
      // Format the response data to match our table structure
      const formattedData = response.data.map((tenant, index) => ({
        id: tenant.id,
        school_name: tenant.name,
        category: tenant.category,
        status: tenant.status,
        schema_name : tenant.schema_name
      }));
      setTenantData(formattedData);
    } catch (error) {
      setError(error.response?.data?.message);
      showToast(
        error.response?.data?.message || "Failed to fetch tenants",
        "error",
        { duration: 3000, position: "top-right" },
      );
    } finally {
      setLoading(false);
      setShowLoadingOverlay(false);
    }
  };

  // Delete tenant functionality
  const handleDeleteTenant = async (row) => {
    if (!window.confirm("Are you sure you want to delete this tenant?")) {
      return;
    }

    try {
      const tenantId = tenantData.find(tenant => tenant?.id === row)?.schema_name
      setShowLoadingOverlay(true);
      await api.post(`/tenant/deletetenant/${tenantId}`);

      showToast("Tenant deleted successfully", "success", {
        duration: 3000,
        position: "top-right",
      });

      // Refresh the table data after deletion
      handleFetchTenants();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete tenant",
        "error",
        { duration: 3000, position: "top-right" },
      );
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  // Handle add tenant
  const handleAddTenant = () => {
    setModalState((prev) => ({ ...prev, addTenant: true }));
  };

  // Handle edit tenant
  const handleEditTenant = (row) => {
    setRowData(row);
    setModalState((prev) => ({ ...prev, editTenant: true }));
  };

  // Refresh table function for modals
  const refreshTable = () => {
    handleFetchTenants();
  };

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Tenant Management
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
            tag="Manage Tenants"
            icon={FaSpinner}
          >
            <div className="flex flex-col space-y-3 pb-4">
              <div className="w-full">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Category
                </label>
                <Dropdown
                  id="category"
                  placeholder="Select Category"
                  options={categoryOptions}
                  value={category}
                  onChange={(value) => setCategory(value)}
                  className="w-full"
                  clearable={true}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Status
                </label>
                <Dropdown
                  id="status"
                  placeholder="Select Status"
                  options={statusOptions}
                  value={status}
                  onChange={(value) => setStatus(value)}
                  className="w-full"
                  clearable={true}
                />
              </div>
              <Button
                onClick={handleFetchTenants}
                className="w-full"
                disabled={!category && !status}
              >
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
              data={tenantData}
              loading={loading}
              horizontalTableFlow={true}
              excludedColumns={excludedColumns}
              showSelectAllCheckbox={false}
              striped={true}
              buttons={{
                addButton: {
                  show: true,
                  label: "Add Tenant",
                  icon: <FiPlus className="w-4 h-4" />,
                  onClick: handleAddTenant,
                },
                actionButtons: {
                  show: true,
                  options: [
                    {
                      label: "Edit",
                      icon: <BsPencil className="w-4 h-4" />,
                      onClick: (row) => handleEditTenant(row),
                    },
                    {
                      label: "Delete",
                      icon: <BsTrash className="w-4 h-4" />,
                      onClick: (row) => handleDeleteTenant(row),
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
                "school_name",
                "category",
                "status",
                "actions",
              ]}
              mobileBreakpoint="sm"
            />
          </div>
        </div>
      </div>

      <TenantCRUD
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        refreshTable={refreshTable}
      />
    </div>
  );
};

export default Tenant;
