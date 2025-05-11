import React, { useState, useEffect } from "react";
import ModalForm from "../ui/raw/ModalForm";
import ReusableInput from "../ui/ReusableInput";
import ReusableTextarea from "../ReusableTextarea";
import { FiEdit2, FiUpload } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../Toast";
import ImageUploader from "./ImageUploader";
import api from "../../hooks/api";

const RUParticulars = ({
  modalState,
  setModalState,
  particulars,
  onUpdateSuccess,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [error, setError] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (modalState.editParticulars) {
        setIsLoadingData(true);
        setIsReady(false);

        const formattedData = {
          schoolname: particulars.schoolname || "",
          motto: particulars.motto || "",
          email: particulars.email || "",
          phone: particulars.phone.startsWith("+")
            ? particulars.phone
            : `+${particulars.phone}` || "",
          website: particulars.website || "",
          address: particulars.address || "",
        };

        setFormInitialValues(formattedData);

        // Small delay for better UX when opening modal
        await new Promise((resolve) => setTimeout(resolve, 300));

        setIsLoadingData(false);
        setIsReady(true);
      }
    };

    loadData();
  }, [modalState.editParticulars, particulars]);

  const handleClose = () => {
    setError("");
    setModalState((prev) => ({ ...prev, editParticulars: false }));
    setIsReady(false);
  };

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    setError("");

    // Small delay to show the loading state and ensure smooth UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const requiredFields = ["schoolname", "motto", "email", "phone"];
      const missing = requiredFields.filter(
        (field) => !formValues[field]?.trim()
      );

      if (missing.length > 0) {
        const message = `Missing required fields: ${missing.join(", ")}`;
        showToast(message, "error");
        setError(message);
        setIsSubmitting(false);
        return;
      }

      const res = await api.post("/particular/updateparticulars", formValues);

      if (res.status === 200 || res.status === 201) {
        // Small success delay before closing
        await new Promise((resolve) => setTimeout(resolve, 300));
        onUpdateSuccess({ ...particulars, ...formValues });
        handleClose();
        showToast("School details updated successfully", "success", {
          duration: 3000,
          position: "top-right",
        });
      } else {
        const errMsg = res.data?.message || "Failed to update particulars";
        showToast(errMsg, "error", { duration: 3000, position: "top-right" });
        setError(errMsg);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Server error occurred";
      showToast(errMsg, "error", { duration: 3000, position: "top-right" });
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Loading overlay when preparing modal data */}
      {modalState.editParticulars && !isReady && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Loading school details...
            </p>
          </div>
        </div>
      )}

      {/* Modal form - only rendered when data is ready */}
      {isReady && (
        <ModalForm
          isOpen={modalState.editParticulars}
          onClose={handleClose}
          title="Update School Details"
          icon={FiEdit2}
          onSubmit={handleSubmit}
          initialValues={formInitialValues}
          closeOnOutsideClick={false}
          size="lg"
          submitText={
            isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" /> Updating...
              </div>
            ) : (
              "Update"
            )
          }
          submitDisabled={isSubmitting}
        >
          {({ values, handleChange }) => (
            <>
              {isSubmitting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
                    <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Updating details...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="schoolname"
                      className="block text-sm font-medium text-gray-700"
                    >
                      School Name *
                    </label>
                    <ReusableInput
                      type="text"
                      name="schoolname"
                      id="schoolname"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onChange={handleChange}
                      value={values.schoolname}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="motto"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Motto *
                    </label>
                    <ReusableInput
                      type="text"
                      name="motto"
                      id="motto"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onChange={handleChange}
                      value={values.motto}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email *
                    </label>
                    <ReusableInput
                      type="email"
                      name="email"
                      id="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onChange={handleChange}
                      value={values.email}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone *
                    </label>
                    <ReusableInput
                      type="tel"
                      name="phone"
                      id="phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onChange={handleChange}
                      value={values.phone}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Website
                  </label>
                  <ReusableInput
                    type="url"
                    name="website"
                    id="website"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleChange}
                    value={values.website}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <ReusableTextarea
                    name="address"
                    id="address"
                    className="w-full border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    onChange={handleChange}
                    value={values.address}
                  />
                </div>
              </div>
            </>
          )}
        </ModalForm>
      )}

      {/* School logo upload Modal Form */}
      <ModalForm
        isOpen={modalState.editSchoolLogo}
        isForm={false}
        title="Upload School Logo"
        icon={FiUpload}
        submitText="Close"
        onClose={() =>
          setModalState((prev) => ({ ...prev, editSchoolLogo: false }))
        }
      >
        <ImageUploader folder="school_logo" />
      </ModalForm>
    </div>
  );
};

export default RUParticulars;
