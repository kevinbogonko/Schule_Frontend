import React, { useState, useEffect } from "react";
import ModalForm from "../../ui/raw/ModalForm";
import ReusableInput from "../../ui/ReusableInput";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import api from "../../../hooks/api";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../../Toast";
import Button from "../../ui/raw/Button";
import Checkbox from "../../Checkbox";

const CRUDDayClusters = ({
  modalState,
  setModalState,
  rowData,
  weekDaysOptions = [],
  utilitiesOptions = [],
  refreshTable,
  showLoadingOverlay,
  setShowLoadingOverlay,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initialFormData = {
    cluster_name: "",
    days: {},
    utilities: {},
  };

  const [formValues, setFormValues] = useState(initialFormData);

  const isFormValid = () => {
    return (
      formValues.cluster_name.trim() !== "" &&
      Object.values(formValues.days).some((day) => day === 1) &&
      Object.values(formValues.utilities).some((util) => util === 1)
    );
  };

  useEffect(() => {
    if (modalState.editCluster && rowData) {
      setShowLoadingOverlay(true);

      // Initialize days object with all days set to 0
      const daysObj = {};
      weekDaysOptions.forEach((day) => {
        daysObj[day.value] = rowData.days?.[day.value] || 0;
      });

      // Initialize utilities object with all utilities set to 0
      const utilitiesObj = {};
      utilitiesOptions.forEach((util) => {
        utilitiesObj[util.value] = rowData.utilities?.[util.value] || 0;
      });

      setFormValues({
        cluster_name: rowData.cluster_name || rowData.day_cluster || "",
        days: daysObj,
        utilities: utilitiesObj,
      });

      setTimeout(() => {
        setShowLoadingOverlay(false);
      }, 300);
    } else if (modalState.addCluster) {
      // Initialize with all days and utilities set to 0
      const daysObj = {};
      weekDaysOptions.forEach((day) => {
        daysObj[day.value] = 0;
      });

      const utilitiesObj = {};
      utilitiesOptions.forEach((util) => {
        utilitiesObj[util.value] = 0;
      });

      setFormValues({
        ...initialFormData,
        days: daysObj,
        utilities: utilitiesObj,
      });
    }
  }, [modalState, rowData]);

  const validateForm = () => {
    if (!formValues.cluster_name.trim()) {
      setError("Cluster name is required!");
      return false;
    }
    if (!Object.values(formValues.days).some((day) => day === 1)) {
      setError("Please select at least one day!");
      return false;
    }
    if (!Object.values(formValues.utilities).some((util) => util === 1)) {
      setError("Please select at least one utility!");
      return false;
    }
    return true;
  };

  const handleDayChange = (day, isChecked) => {
    setFormValues((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: isChecked ? 1 : 0,
      },
    }));
  };

  const handleUtilityChange = (utility, isChecked) => {
    setFormValues((prev) => ({
      ...prev,
      utilities: {
        ...prev.utilities,
        [utility]: isChecked ? 1 : 0,
      },
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    // Safely handle event object
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");
    setShowLoadingOverlay(true);

    try {
      const payload = {
        year: Number(rowData?.year),
        term: Number(rowData?.term),
        cluster_name: formValues.cluster_name,
        days: formValues.days,
        utilities: formValues.utilities,
      };

      const response = await api.post("/timetable/adddaycluster", payload);

      if (response.status === 200 || response.status === 201) {
        showToast("Day Cluster Added Successfully", "success", {
          duration: 3000,
          position: "top-right",
        });
        setModalState((prev) => ({ ...prev, addCluster: false }));
        refreshTable();
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to add day cluster";
      setError(errorMsg);
      showToast(errorMsg, "error", { duration: 3000, position: "top-right" });
    } finally {
      setIsSubmitting(false);
      setShowLoadingOverlay(false);
    }
  };

  const handleUpdate = async (e) => {
    // Safely handle event object
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");
    setShowLoadingOverlay(true);

    try {
      const payload = {
        year: Number(rowData?.year),
        term: Number(rowData?.term),
        cluster_name: formValues.cluster_name,
        days: formValues.days,
        utilities: formValues.utilities,
      };

      const response = await api.put(
        `/timetable/updatedaycluster/${rowData?.id}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        showToast("Day Cluster Updated Successfully", "success", {
          duration: 3000,
          position: "top-right",
        });
        setModalState((prev) => ({ ...prev, editCluster: false }));
        refreshTable();
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update day cluster";
      setError(errorMsg);
      showToast(errorMsg, "error", { duration: 3000, position: "top-right" });
    } finally {
      setIsSubmitting(false);
      setShowLoadingOverlay(false);
    }
  };

  const resetForm = () => {
    const daysObj = {};
    weekDaysOptions.forEach((day) => {
      daysObj[day.value] = 0;
    });

    const utilitiesObj = {};
    utilitiesOptions.forEach((util) => {
      utilitiesObj[util.value] = 0;
    });

    setFormValues({
      cluster_name: "",
      days: daysObj,
      utilities: utilitiesObj,
    });
    setError("");
  };

  return (
    <>
      {/* Add Cluster Modal */}
      <ModalForm
        isOpen={modalState.addCluster}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, addCluster: false }));
        }}
        title="Add Day Cluster"
        icon={FiPlus}
        isForm={true}
        onSubmit={handleSubmit}
        closeOnOutsideClick={false}
        size="md"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Submit"
        }
        submitDisabled={isSubmitting || !isFormValid()}
        footerButtons={[
          <Button
            key="clear"
            variant="secondary"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Clear
          </Button>,
        ]}
      >
        <div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cluster Name *
              </label>
              <ReusableInput
                name="cluster_name"
                value={formValues.cluster_name}
                onChange={handleInputChange}
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Days of Week *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {weekDaysOptions.map((day) => (
                  <Checkbox
                    key={day.value}
                    label={day.label}
                    checked={formValues.days[day.value] === 1}
                    onChange={(e) =>
                      handleDayChange(day.value, e.target.checked)
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Utilities *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {utilitiesOptions.map((utility) => (
                  <Checkbox
                    key={utility.value}
                    label={utility.label}
                    checked={formValues.utilities[utility.value] === 1}
                    onChange={(e) =>
                      handleUtilityChange(utility.value, e.target.checked)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Edit Cluster Modal */}
      <ModalForm
        isOpen={modalState.editCluster}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, editCluster: false }));
        }}
        title="Edit Day Cluster"
        icon={FiEdit2}
        isForm={true}
        onSubmit={handleUpdate}
        closeOnOutsideClick={false}
        size="md"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Update"
        }
        submitDisabled={isSubmitting || !isFormValid()}
      >
        <div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cluster Name *
              </label>
              <ReusableInput
                name="cluster_name"
                value={formValues.cluster_name}
                onChange={handleInputChange}
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Days of Week *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {weekDaysOptions.map((day) => (
                  <Checkbox
                    key={day.value}
                    label={day.label}
                    checked={formValues.days[day.value] === 1}
                    onChange={(e) =>
                      handleDayChange(day.value, e.target.checked)
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Utilities *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {utilitiesOptions.map((utility) => (
                  <Checkbox
                    key={utility.value}
                    label={utility.label}
                    checked={formValues.utilities[utility.value] === 1}
                    onChange={(e) =>
                      handleUtilityChange(utility.value, e.target.checked)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ModalForm>
    </>
  );
};

export default CRUDDayClusters;
