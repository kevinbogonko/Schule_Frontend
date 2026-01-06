import { useState, useEffect } from "react";
import ReusableDiv from "../../ReusableDiv";
import TableComponent from "../../TableComponent";
import ReusableSelect from "../../ReusableSelect";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import { BsPencil, BsTrash } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import {
  formOptions,
  yearOptions,
  termOptions,
} from "../../../utils/CommonData";
import { useToast } from "../../Toast";
import api from "../../../hooks/api";
import ExamCRUD from "../../snippets/ExamCRUD";

const Exam = ({ syst_level }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [examsData, setExamsData] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [modalState, setModalState] = useState({
    addExam: false,
    editExam: false,
  });

  const setFormOptions =
    formOptions.find((option) => option.label === syst_level)?.options || [];

  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const columns = [
    { name: "EXAM NAME", uid: "exam_name", sortable: true },
    { name: "SCHEDULED AT", uid: "scheduled_at", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const handlePreSetExams = async () => {
    if (!selectedYear || !selectedTerm || !selectedForm) {
      showToast("Please select year, term and form first", "error", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/exam/addexam", {
        term: selectedTerm,
        form: selectedForm,
        year: selectedYear,
      });

      if ([200, 201, 204].includes(response.status)) {
        showToast("Pre-set exams added successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        fetchExams();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add pre-set exams",
        "error",
        { duration: 3000, position: "top-center" }
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    if (!selectedYear || !selectedTerm || !selectedForm) {
      setExamsData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/exam/exams", {
        term: selectedTerm,
        form: selectedForm,
        year: selectedYear,
      });
      setExamsData(response.data || []);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch exams",
        "error",
        { duration: 3000, position: "top-center" }
      );
      setExamsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    setLoading(true);
    try {
      const response = await api.post("/exam/deleteexam", { id: row });

      if ([200, 201, 204].includes(response.status)) {
        showToast("Exam deleted successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        fetchExams();
      }
    } catch (error) {
        console.log(error.response?.data?.message);
      showToast(
        error.response?.data?.message || "Failed to delete exam",
        "error",
        { duration: 3000, position: "top-center" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setSelectedTerm("");
    setSelectedForm("");
    setExamsData([]);
  };

  const handleTermChange = async (e) => {
    const term = e.target.value;
    setSelectedTerm(term);
    setSelectedForm("");

    if (term && selectedYear) {
      await fetchExams();
    } else {
      setExamsData([]);
    }
  };

  const handleFormChange = (e) => {
    const form = e.target.value;
    setSelectedForm(form);

    if (form && selectedYear && selectedTerm) {
      fetchExams();
    } else {
      setExamsData([]);
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
    if (selectedYear && selectedTerm && selectedForm) {
      fetchExams();
    }
  }, [selectedYear, selectedTerm, selectedForm]);

  return (
    <div className="p-0 md:p-0">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-500">
          Manage Exams
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
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

        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800 mb-2"
            tag="Manage Exams"
            icon={FaUsersGear}
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
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="term"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Term
                </label>
                <ReusableSelect
                  id="term"
                  placeholder="Select Term"
                  options={termOptions}
                  value={selectedTerm}
                  onChange={handleTermChange}
                  disabled={!selectedYear}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="form"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Form
                </label>
                <ReusableSelect
                  id="form"
                  placeholder="Select Form"
                  options={setFormOptions}
                  value={selectedForm}
                  onChange={handleFormChange}
                  disabled={!selectedTerm}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
        </div>

        <div className="w-full lg:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4">
            <TableComponent
              columns={columns}
              data={examsData}
              loading={loading}
              horizontalTableFlow
              showSelectAllCheckbox={false}
              striped
              responsive
              buttons={{
                addButton: {
                  show: true,
                  label: "Add Exam",
                  icon: <FiPlus className="w-4 h-4" />,
                  onClick: () => {
                    if (!selectedYear || !selectedTerm || !selectedForm) {
                      showToast(
                        "Please select year, term and form first",
                        "error",
                        {
                          duration: 3000,
                          position: "top-center",
                        }
                      );
                      return;
                    }
                    openModalWithData("addExam");
                  },
                },
                uploadButton: {
                  show: true,
                  label: "Pre-set Exam",
                  onClick: handlePreSetExams,
                  className: "mr-2",
                },
                actionButtons: {
                  show: true,
                  options: [
                    {
                      label: "Edit",
                      icon: <BsPencil className="w-4 h-4" />,
                      onClick: (row) => openModalWithData("editExam", row),
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
        </div>
      </div>

      <ExamCRUD
        modalState={modalState}
        setModalState={setModalState}
        selectedForm={selectedForm}
        selectedYear={selectedYear}
        selectedTerm={selectedTerm}
        syst_level={syst_level}
        rowData={rowData}
        refreshTable={fetchExams}
      />
    </div>
  );
};

export default Exam;
