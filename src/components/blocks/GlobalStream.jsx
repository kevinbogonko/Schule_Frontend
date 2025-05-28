import React, { useState, useEffect } from "react";
import TableComponent from "../TableComponent";
import { FaSpinner } from "react-icons/fa6";
import { BsPencil, BsTrash } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { useToast } from "../Toast";
import api from "../../hooks/api";
import GlobalStreamCRUD from "../snippets/GlobalStreamCRUD";

const GlobalStream = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [modalState, setModalState] = useState({
    addStream: false,
    editStream: false,
  });
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [streamOptions, setStreamOptions] = useState([]);

  const columns = [
    { name: "STREAM", uid: "stream_name", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const fetchStreamNames = async () => {
    try {
      setShowLoadingOverlay(true);
      const response = await api.get("/stream/getstreamnames");
      setStreamOptions(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch streams",
        "error",
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setTimeout(() => {
        setShowLoadingOverlay(false);
      }, 300);
    }
  };

  const handleDelete = async (rowData) => {
    if (!window.confirm("Are you sure you want to delete this stream?")) return;
    setLoading(true);
    try {
      await api.post(`/stream/deletestreamname/${rowData}`, {}, {
        headers:{
            'Content-Type' : 'application/json'
        }
      });
      showToast("Stream deleted successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
      fetchStreamNames();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete stream",
        "error",
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setLoading(false);
    }
  };

  const openModalWithData = (modalType, row = null) => {
    setShowLoadingOverlay(true);
    setRowData(row);
    setTimeout(() => {
      setModalState((prev) => ({ ...prev, [modalType]: true }));
      setShowLoadingOverlay(false);
    }, 300);
  };

  useEffect(() => {
    fetchStreamNames();
  }, []);

  return (
    <div className="p-0 md:p-0">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
          Manage Stream Names
        </h1>
      </div>

      {(showLoadingOverlay || loading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
            <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
              Loading ...
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4">
        <TableComponent
          columns={columns}
          data={streamOptions}
          loading={loading}
          horizontalTableFlow
          showSelectAllCheckbox={false}
          striped
          responsive
          buttons={{
            addButton: {
              show: true,
              label: "Add",
              icon: <FiPlus className="w-4 h-4" />,
              onClick: () => openModalWithData("addStream"),
            },
            actionButtons: {
              show: true,
              options: [
                {
                  label: "Edit",
                  icon: <BsPencil className="w-4 h-4" />,
                  onClick: (row) => openModalWithData("editStream", row),
                },
                {
                  label: "Delete",
                  icon: <BsTrash className="w-4 h-4" />,
                  onClick: (row) => handleDelete(row),
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
      </div>

      <GlobalStreamCRUD
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        refreshTable={fetchStreamNames}
      />
    </div>
  );
};

export default GlobalStream;
