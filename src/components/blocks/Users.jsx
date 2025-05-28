import React, { useState } from "react";
import Button from "../ui/raw/Button";
import Dropdown from "../Dropdown";
import TableComponent from "../TableComponent";
import ReusableDiv from "../ReusableDiv";
import UsersCRUD from "../snippets/UsersCRUD";
import { BsEye, BsPencil, BsTrash, BsPlus } from "react-icons/bs";

const Users = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "",
  });
  const [rowData, setRowData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("teacher");
  const [userData, setUserData] = useState([
    // Sample data - replace with your actual data
    {
      id: 1,
      name: "John Doe",
      username: "johndoe",
      role: "teacher",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      username: "janesmith",
      role: "student",
      status: "inactive",
    },
  ]);

  const columns = [
    { header: "USER ID", accessor: "id" },
    { header: "NAME", accessor: "name" },
    { header: "USERNAME", accessor: "username" },
    { header: "ROLE", accessor: "role" },
    { header: "STATUS", accessor: "status" },
  ];

  const openModalWithData = (type, row) => {
    setRowData(row);
    setModalState({
      isOpen: true,
      type: type,
    });
  };

  const handleDelete = (row) => {
    // Implement delete logic here
    setUserData(userData.filter((user) => user.id !== row.id));
  };

  const handleAddUser = () => {
    setModalState({
      isOpen: true,
      type: "addUser",
    });
  };

  const handleUserTypeChange = (selectedType) => {
    setUserType(selectedType);
    // You might want to filter userData here based on the selected type
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button
          onClick={handleAddUser}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <BsPlus className="mr-2" /> Add User
        </Button>
      </div>

      <ReusableDiv>
        <div className="mb-4">
          <Dropdown
            options={[
              { value: "teacher", label: "Teacher" },
              { value: "student", label: "Student" },
            ]}
            selectedValue={userType}
            onChange={handleUserTypeChange}
            label="Select User Type"
          />
        </div>

        <TableComponent
          columns={columns}
          data={userData.filter((user) => user.role === userType)}
          loading={loading}
          horizontalTableFlow
          showSelectAllCheckbox={false}
          striped
          responsive
          buttons={{
            addButton: {
              show: false,
            },
            actionButtons: {
              show: true,
              options: [
                {
                  label: "Change Password",
                  icon: <BsEye className="w-4 h-4" />,
                  onClick: (row) => openModalWithData("changePassword", row),
                },
                {
                  label: "Change Status",
                  icon: <BsPencil className="w-4 h-4" />,
                  onClick: (row) => openModalWithData("changeStatus", row),
                },
                {
                  label: "Delete User",
                  icon: <BsTrash className="w-4 h-4" />,
                  onClick: (row) => {
                    setRowData(row);
                    handleDelete(row);
                  },
                },
              ],
            },
          }}
          borderColor="blue-200"
          rowColors={{
            default: "hover:bg-blue-50 dark:hover:bg-blue-900",
            selected: "bg-blue-100 dark:bg-blue-800",
          }}
          mobileBreakpoint="sm"
        />
      </ReusableDiv>

      <UsersCRUD
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        onSuccess={() => {
          // Implement refresh logic after CRUD operations
          setModalState({ isOpen: false, type: "" });
        }}
      />
    </div>
  );
};

export default Users;
