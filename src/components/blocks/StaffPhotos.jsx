import React, { useState, useEffect } from 'react';
import TableComponent from "../TableComponent";
import { FiPlus } from "react-icons/fi";
import { BsEye, BsPencil, BsTrash } from "react-icons/bs";
import ReusableDiv from '../ReusableDiv';
import ReusableSelect from '../ReusableSelect';
import { FaUsersGear } from 'react-icons/fa6';
import api from '../../hooks/api';
import { useToast } from '../Toast';
import { yearOptions } from '../../utils/CommonData';
import StaffCRUD from '../snippets/StaffCRUD';
import RUStaffPhoto from '../snippets/RUStaffPhoto';

const StaffPhotos = () => {
  const { showToast } = useToast();
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [rowData, setRowData] = useState("");

  // Modal States
  const [modalState, setModalState] = useState({
    viewStaffPhoto: false,
    editStaffPhoto: false,
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
      const fetchData = async () => {
        try {
          const response = await api.post("/teacher/getteachers", payload);
          const transformedData = response.data.map((staff) => ({
            ...staff,
            name: `${staff.fname} ${staff.lname}`,
            status: "Active",
          }));
          setStaffData(transformedData);
          setLoading(false);
        } catch (error) {
          setError(error.response?.data?.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedYear, modalState.editStaffPhoto, modalState.viewStaffPhoto]);


  return (
    <div className="my-4 flex flex-1 gap-2">
      <ReusableDiv
        className="ring-1 w-1/4 h-fit bg-blue-100"
        tag="Manage Teachers"
        icon={FaUsersGear}
      >
        <div className="flex flex-wrap pb-4">
          <div className="w-full flex flex-col mb-2">
            <label htmlFor="year">Year</label>
            <ReusableSelect
              id="year"
              placeholder="Select Year"
              options={yearOptions}
              value={
                yearOptions.find((option) => option.value === selectedYear) ||
                undefined
              }
              onChange={(e) => setSelectedYear(e.target.value)}
            />
          </div>
        </div>
      </ReusableDiv>

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
            show: false,
          },
          actionButtons: {
            show: true,
            options: [
              {
                label: "View",
                icon: <BsEye className="w-4 h-4" />,
                onClick: (row) => {
                  setRowData(row);
                  setModalState((prev) => ({ ...prev, viewStaffPhoto: true }));
                },
              },
              {
                label: "Edit",
                icon: <BsPencil className="w-4 h-4" />,
                onClick: (row) => {
                  setRowData(row);
                  setModalState((prev) => ({ ...prev, editStaffPhoto: true }));
                },
              },
            ],
          },
        }}
        borderColor="blue-200"
        rowColors={{
          default: "hover:bg-blue-50",
          selected: "bg-blue-100",
        }}
        defaultVisibleColumns={["name", "id", "status", "actions"]}
      />

      <RUStaffPhoto
        modalState={modalState}
        setModalState={setModalState}
        selectedYear={selectedYear}
        rowData={rowData}
        refreshTable={() => {
          const payload = { year: selectedYear };
          api.post("/teacher/getteachers", payload).then((response) => {
            const transformedData = response.data.map((staff) => ({
              ...staff,
              name: `${staff.fname} ${staff.lname}`,
              status: "Active",
            }));
            setStaffData(transformedData);
          });
        }}
      />
    </div>
  );
};

export default StaffPhotos;