import React, { useState, useEffect } from "react";
import ModalForm from "../ui/raw/ModalForm";
import ReusableInput from "../ui/ReusableInput";
import {
  FiUserPlus,
  FiEdit2,
} from "react-icons/fi";
import ReusableSelect from "../ReusableSelect";
import api from "../../hooks/api";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../Toast";

const UserCRUD = ({ modalState, setModalState, rowData, refreshTable }) => {
  const { showToast } = useToast();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initialFormData = {
    user_id: "",
    firstname: "",
    lastname: "",
    password: "",
    confirmPassword: "",
    role: "",
  };

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "bursar", label: "Bursar" },
  ];

  // Fetch user data for edit modal
  useEffect(() => {
    if (modalState.editUser && rowData) {
      setIsLoading(true);
      api
        .post("/auth/user", { id: rowData })
        .then((res) => {
          setUserData(res.data);
          setEditFormData({
            username: res.data.username || "",
            password: "",
          });
        })
        .catch(() => {
          showToast("Failed to fetch user data", "error", {
            duration: 3000,
            position: "top-center",
          });
          setModalState((prev) => ({
            ...prev,
            editUser: false,
          }));
        })
        .finally(() => setIsLoading(false));
    }
  }, [modalState.editUser, rowData]);

  // Handle Add User
  const handleSubmit = async (formValues) => {
    if (
      !formValues.user_id ||
      !formValues.firstname ||
      !formValues.lastname ||
      !formValues.password ||
      !formValues.role
    ) {
      setError("Please fill in all required fields!");
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        user_id: formValues.user_id,
        firstname: formValues.firstname,
        lastname: formValues.lastname,
        phone: formValues.password,
        role: formValues.role,
      };

      const response = await api.post("/auth/register", payload);

      if (response.status === 200 || response.status === 201) {
        setModalState((prev) => ({ ...prev, addUser: false }));
        showToast("User Added Successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        refreshTable();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add user",
        "error",
        {
          duration: 3000,
          position: "top-center",
        }
      );
      setError(
        error.response?.data?.message || "Failed to add user. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update User
  const handleUpdate = async (formValues) => {
    if (!formValues.username) {
      setError("Username is required!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        id: rowData,
        username: formValues.username,
        ...(formValues.password && { password: formValues.password }),
      };

      const response = await api.post("/auth/updateuser", payload);

      if (response.status === 200 || response.status === 201) {
        setModalState((prev) => ({ ...prev, editUser: false }));
        showToast("User Updated Successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        refreshTable();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update user",
        "error",
        {
          duration: 3000,
          position: "top-center",
        }
      );
      setError(
        error.response?.data?.message ||
          "Failed to update user. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
            <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
              Loading User Data...
            </p>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <ModalForm
        isOpen={modalState.addUser}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, addUser: false }));
        }}
        title="Add User"
        icon={FiUserPlus}
        initialValues={initialFormData}
        onSubmit={handleSubmit}
        closeOnOutsideClick={false}
        size="lg"
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

            <div className="mb-4">
              <ReusableInput
                label="User ID *"
                type="text"
                name="user_id"
                value={values.user_id}
                onChange={handleChange}
                placeholder="Enter User ID"
                required
              />
            </div>
            <div className="mb-4">
              <ReusableInput
                label="First name *"
                type="text"
                name="firstname"
                value={values.firstname}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="mb-4">
              <ReusableInput
                label="Last name *"
                type="text"
                name="lastname"
                value={values.lastname}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="mb-4">
              <ReusableInput
                label="Password *"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

            <div className="mb-4">
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

            <div className="mb-4">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Role *
              </label>
              <ReusableSelect
                name="role"
                id="role"
                placeholder="Select Role"
                className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                options={roleOptions}
                value={values.role}
                onChange={(value) =>
                  handleChange({
                    target: { name: "role", value: value.target.value },
                  })
                }
                required
              />
            </div>
          </>
        )}
      </ModalForm>

      {/* Edit User Modal */}
      <ModalForm
        isOpen={modalState.editUser && !!editFormData && !isLoading}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, editUser: false }));
        }}
        title="Edit User"
        icon={FiEdit2}
        initialValues={editFormData || { username: "", password: "" }}
        onSubmit={handleUpdate}
        closeOnOutsideClick={false}
        size="lg"
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

            <div className="mb-4">
              <ReusableInput
                label="Username"
                type="text"
                name="username"
                value={values.username}
                onChange={handleChange}
                placeholder="Enter username"
                disabled
              />
            </div>

            <div className="mb-4">
              <ReusableInput
                label="New Password"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </div>
          </>
        )}
      </ModalForm>
    </>
  );
};

export default UserCRUD;
