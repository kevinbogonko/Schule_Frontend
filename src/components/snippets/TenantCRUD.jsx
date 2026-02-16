import React, { useState, useEffect } from "react";
import ModalForm from "../ui/ModalForm";
import ReusableInput from "../ui/ReusableInput";
import Dropdown from "../ui/Dropdown";
import { FiUserPlus, FiEdit2, FiCalendar } from "react-icons/fi";
import api from "../../hooks/api";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../ui/Toast";
import ReusableDiv from "../ui/ReusableDiv";
import {
  periodOptions,
  moduleOptions,
  categoryOptions,
} from "../../utils/CommonData";

const TenantCRUD = ({ modalState, setModalState, rowData, refreshTable }) => {
  const { showToast } = useToast();
  const [tenantData, setTenantData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Initial form data for add modal
  const initialFormData = {
    name: "",
    schema_name: "",
    motto: "",
    address: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    category: "",
    analytics: false,
    timetabling: false,
    finance: false,
    ai: false,
  };

  // Fetch tenant data for edit modal
  useEffect(() => {
    if (modalState.editTenant && rowData) {
      setIsLoading(true);
      console.log({ id: rowData});
      api
        .post("/tenant/gettenant", { id: rowData})
        .then((res) => {
          const tenant = res.data;
          setTenantData(tenant);

          // Prepare form data from API response
          const modules = tenant.modules || {};
          const expiry = tenant.modules_expiry || {};

          setEditFormData({
            name: tenant.name || "",
            schema_name: tenant.schema_name || "",
            category: tenant.category || "",
            motto: tenant.motto || "",
            phone: tenant.phone || "",
            address: tenant.address || "",
            email: tenant.email || "",
            password: "",
            analytics: modules.analytics || false,
            timetabling: modules.timetabling || false,
            finance: modules.finance || false,
            ai: modules.ai || false,
            analytics_from: expiry.analytics_from || "",
            analytics_to: expiry.analytics_to || "",
            analytics_period: expiry.analytics_period || "",
            timetabling_from: expiry.timetabling_from || "",
            timetabling_to: expiry.timetabling_to || "",
            timetabling_period: expiry.timetabling_period || "",
            finance_from: expiry.finance_from || "",
            finance_to: expiry.finance_to || "",
            finance_period: expiry.finance_period || "",
            ai_from: expiry.ai_from || "",
            ai_to: expiry.ai_to || "",
            ai_period: expiry.ai_period || "",
          });
        })
        .catch(() => {
          showToast("Failed to fetch tenant data", "error", {
            duration: 3000,
            position: "top-center",
          });
          setModalState((prev) => ({
            ...prev,
            editTenant: false,
          }));
        })
        .finally(() => setIsLoading(false));
    }
  }, [modalState.editTenant, rowData]);

  // Calculate to date based on from date and period
  const calculateToDate = (fromDate, period) => {
    if (!fromDate || !period) return "";

    const from = new Date(fromDate);
    const months = parseInt(period);

    if (isNaN(months)) return "";

    const toDate = new Date(from);
    toDate.setMonth(toDate.getMonth() + months);

    return toDate.toISOString().split("T")[0];
  };

  // Handle Add Tenant
  const handleSubmit = async (formValues) => {
    // Validate required fields
    const requiredFields = [
      "name",
      "schema_name",
      "category",
      "email",
      "phone",
      "password",
    ];
    for (const field of requiredFields) {
      if (!formValues[field]?.trim()) {
        setError(`Please fill in ${field.replace("_", " ")} field!`);
        return;
      }
    }

    if (formValues.password !== formValues.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Validate at least one module is selected
    const selectedModules = [
      "analytics",
      "timetabling",
      "finance",
      "ai",
    ].filter((module) => formValues[module]);

    if (selectedModules.length === 0) {
      setError("Please select at least one module!");
      return;
    }

    // Validate module expiry dates for selected modules
    for (const module of selectedModules) {
      const fromDate = formValues[`${module}_from`];
      const toDate = formValues[`${module}_to`];

      if (!fromDate || !toDate) {
        setError(`Please set dates for ${module} module!`);
        return;
      }

      if (new Date(toDate) <= new Date(fromDate)) {
        setError(`${module} module: To date must be greater than From date!`);
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Prepare modules object
      const modules = {
        analytics: formValues.analytics || false,
        timetabling: formValues.timetabling || false,
        finance: formValues.finance || false,
        ai: formValues.ai || false,
      };

      // Prepare modules expiry object
      const modulesExpiry = {};
      ["analytics", "timetabling", "finance", "ai"].forEach((module) => {
        if (formValues[module]) {
          modulesExpiry[module] = formValues[`${module}_to`];
          modulesExpiry[`${module}_from`] = formValues[`${module}_from`];
          modulesExpiry[`${module}_period`] = formValues[`${module}_period`];
        }
      });

      const payload = {
        tenant: {
          name: formValues.name.trim(),
          schema_name: formValues.schema_name.trim(),
          category: formValues.category,
          modules: modules,
          modules_expiry: modulesExpiry,
          motto: formValues.motto.trim(),
          phone: formValues.phone.trim(),
          address: formValues.address.trim(),
          email: formValues.email.trim(),
          password: formValues.password,
        },
      };

      const response = await api.post("/tenant/addtenant", payload);

      if (response.status === 200 || response.status === 201) {
        setModalState((prev) => ({ ...prev, addTenant: false }));
        showToast(
          `Tenant Added Successfully. Admin username : ${response.data?.admin_user}`,
          "success",
          {
            // duration: 3000,
            position: "top-center",
          },
        );
        refreshTable();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add tenant",
        "error",
        {
          duration: 3000,
          position: "top-center",
        },
      );
      setError(
        error.response?.data?.message ||
          "Failed to add tenant. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Tenant
  const handleUpdate = async (formValues) => {
    // Validate required fields
    const requiredFields = ["name", "category"];
    for (const field of requiredFields) {
      if (!formValues[field]?.trim()) {
        setError(`Please fill in ${field.replace("_", " ")} field!`);
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Prepare modules object
      const modules = {
        analytics: formValues.analytics || false,
        timetabling: formValues.timetabling || false,
        finance: formValues.finance || false,
        ai: formValues.ai || false,
      };

      // Prepare modules expiry object
      const modulesExpiry = {};
      ["analytics", "timetabling", "finance", "ai"].forEach((module) => {
        if (formValues[module]) {
          modulesExpiry[module] = formValues[`${module}_to`];
          modulesExpiry[`${module}_from`] = formValues[`${module}_from`];
          modulesExpiry[`${module}_period`] = formValues[`${module}_period`];
        }
      });

      const payload = {
          id: rowData,
          name: formValues.name.trim(),
          schema_name: formValues.schema_name.trim(),
          category: formValues.category,
          modules: modules,
          modules_expiry: modulesExpiry
      };

      const response = await api.post("/tenant/updatetenant", payload);

      if (response.status === 200 || response.status === 201) {
        setModalState((prev) => ({ ...prev, editTenant: false }));
        showToast(
          `Tenant Updated Successfully.`,
          "success",
          {
            duration: 3000,
            position: "top-center",
          },
        );
        refreshTable();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update tenant",
        "error",
        {
          duration: 3000,
          position: "top-center",
        },
      );
      setError(
        error.response?.data?.message ||
          "Failed to update tenant. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render module date selectors
  const renderModuleDateSelectors = (values, handleChange, module) => {
    if (!values[module]) return null;

    return (
      <ReusableDiv
        className="ml-0 mr-0 mb-4 ring-1 ring-gray-200 dark:ring-gray-700"
        tag={module.charAt(0).toUpperCase() + module.slice(1)}
        icon={FiCalendar}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <ReusableInput
              label="From Date"
              type="date"
              name={`${module}_from`}
              value={values[`${module}_from`] || ""}
              onChange={(e) => {
                handleChange(e);
                // If period is selected, calculate to date
                if (values[`${module}_period`]) {
                  const toDate = calculateToDate(
                    e.target.value,
                    values[`${module}_period`],
                  );
                  const toEvent = {
                    target: {
                      name: `${module}_to`,
                      value: toDate,
                    },
                  };
                  handleChange(toEvent);
                }
              }}
              required
            />
          </div>

          <div>
            {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Period
            </label> */}
            <Dropdown
              placeholder="Select Period"
              options={periodOptions}
              value={values[`${module}_period`] || ""}
              onChange={(value) => {
                const periodEvent = {
                  target: {
                    name: `${module}_period`,
                    value: value,
                  },
                };
                handleChange(periodEvent);

                // Calculate to date if from date exists
                if (values[`${module}_from`]) {
                  const toDate = calculateToDate(
                    values[`${module}_from`],
                    value,
                  );
                  const toEvent = {
                    target: {
                      name: `${module}_to`,
                      value: toDate,
                    },
                  };
                  handleChange(toEvent);
                }
              }}
              className="w-full"
              clearable={true}
            />
          </div>

          <div>
            <ReusableInput
              label="To Date"
              type="date"
              name={`${module}_to`}
              value={values[`${module}_to`] || ""}
              onChange={handleChange}
              min={values[`${module}_from`] || ""}
              required
            />
          </div>
        </div>
      </ReusableDiv>
    );
  };

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
            <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
              Loading Tenant Data...
            </p>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      <ModalForm
        isOpen={modalState.addTenant}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, addTenant: false }));
        }}
        title="Add Tenant"
        icon={FiUserPlus}
        initialValues={initialFormData}
        onSubmit={handleSubmit}
        closeOnOutsideClick={false}
        size="xl"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Submit"
        }
        submitDisabled={isSubmitting}
      >
        {({ values, handleChange }) => (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <ReusableInput
                label="School Name *"
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Enter school name"
                required
              />

              <ReusableInput
                label="Schema Name *"
                type="text"
                name="schema_name"
                value={values.schema_name}
                onChange={handleChange}
                placeholder="Enter schema name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <Dropdown
                placeholder="Select Category"
                options={categoryOptions}
                value={values.category}
                onChange={(value) => {
                  handleChange({
                    target: { name: "category", value },
                  });
                }}
                className="w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modules *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moduleOptions.map((module) => (
                  <label
                    key={module.value}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={values[module.value] || false}
                      onChange={(e) => {
                        handleChange({
                          target: {
                            name: module.value,
                            value: e.target.checked,
                          },
                        });

                        // Initialize dates when module is selected
                        if (e.target.checked) {
                          const today = new Date().toISOString().split("T")[0];
                          const fromEvent = {
                            target: {
                              name: `${module.value}_from`,
                              value: today,
                            },
                          };
                          handleChange(fromEvent);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {module.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Module Date Selectors */}
            {renderModuleDateSelectors(values, handleChange, "analytics")}
            {renderModuleDateSelectors(values, handleChange, "timetabling")}
            {renderModuleDateSelectors(values, handleChange, "finance")}
            {renderModuleDateSelectors(values, handleChange, "ai")}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <ReusableInput
                label="Motto"
                type="text"
                name="motto"
                value={values.motto}
                onChange={handleChange}
                placeholder="Enter school motto"
              />

              <ReusableInput
                label="Address"
                type="text"
                name="address"
                value={values.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <ReusableInput
                label="Email *"
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />

              <ReusableInput
                label="Phone *"
                type="tel"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <ReusableInput
                label="Password *"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />

              <ReusableInput
                label="Confirm Password *"
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </div>
          </>
        )}
      </ModalForm>

      {/* Edit Tenant Modal */}
      <ModalForm
        isOpen={modalState.editTenant && !!editFormData && !isLoading}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, editTenant: false }));
        }}
        title="Edit Tenant"
        icon={FiEdit2}
        initialValues={editFormData || {}}
        onSubmit={handleUpdate}
        closeOnOutsideClick={false}
        size="xl"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Update"
        }
        submitDisabled={isSubmitting}
      >
        {({ values, handleChange }) => (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <ReusableInput
                label="School Name *"
                type="text"
                name="name"
                value={values.name || ""}
                onChange={handleChange}
                placeholder="Enter school name"
                required
              />

              <ReusableInput
                label="Schema Name"
                type="text"
                name="schema_name"
                value={values.schema_name || ""}
                onChange={handleChange}
                placeholder="Enter schema name"
                disabled
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <Dropdown
                placeholder="Select Category"
                options={categoryOptions}
                value={values.category || ""}
                onChange={(value) => {
                  handleChange({
                    target: { name: "category", value },
                  });
                }}
                className="w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modules
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moduleOptions.map((module) => (
                  <label
                    key={module.value}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={values[module.value] || false}
                      onChange={(e) => {
                        handleChange({
                          target: {
                            name: module.value,
                            value: e.target.checked,
                          },
                        });
                      }}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {module.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Module Date Selectors for Edit */}
            {renderModuleDateSelectors(values, handleChange, "analytics")}
            {renderModuleDateSelectors(values, handleChange, "timetabling")}
            {renderModuleDateSelectors(values, handleChange, "finance")}
            {renderModuleDateSelectors(values, handleChange, "ai")}
          </>
        )}
      </ModalForm>
    </>
  );
};

export default TenantCRUD;
