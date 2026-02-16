import React, { useState, useEffect } from "react";
import { useToast } from "../../ui/Toast";
import TableComponent from "../../ui/TableComponent";
import { FiPlus } from "react-icons/fi";
import { BsEye, BsPencil, BsTrash } from "react-icons/bs";
import ReusableDiv from "../../ui/ReusableDiv";
import ReusableSelect from "../../ui/ReusableSelect";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import api from "../../../hooks/api";
import {
  formOptions,
  yearOptions,
  termOptions,
  getColumns,
} from "../../../utils/CommonData";
import GradingRU from "../../snippets/GradingRU";

const Grading = ({ syst_level }) => {
  const { showToast } = useToast();

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedExamKey, setSelectedExamKey] = useState(null);
  const [gradingScales, setGradingScales] = useState([]);
  const [examOptions, setExamOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subjectScale, setSubjectScale] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Modal States
  const [modalState, setModalState] = useState({
    viewGradeMark: false,
    // updateGradeMark: false
  });

  const setFormOptions = formOptions.find((option) => option.label === syst_level)?.options || [];
  
  let isCBC;
  syst_level === "Secondary (8-4-4)" ? (isCBC = false) : (isCBC = true);

  const columns = getColumns(syst_level);

  const excludedColumns = [];
  const staticColumns = ["subject"];

  const resetBelow = (field) => {
    switch (field) {
      case "year":
        setSelectedForm(null);
        setSelectedTerm(null);
        setSelectedExam(null);
        setGradingScales([]);
        setExamOptions([]);
        break;
      case "form":
        setSelectedTerm(null);
        setSelectedExam(null);
        setGradingScales([]);
        setExamOptions([]);
        break;
      case "term":
        setSelectedExam(null);
        setGradingScales([]);
        setExamOptions([]);
        break;
      case "exam":
        setGradingScales([]);
        break;
      default:
        break;
    }
  };

  const handleEditClick = async (row) => {
    if (!selectedExam) return;

    setSelectedRowId(row);
    setUpdateLoading(true);

    try {
      const response = await api.post("grading/gradingscale", {
        form: selectedForm,
        subject: row,
        exam_id: selectedExam,
      });
      setSubjectScale(response.data);
      setModalState((prev) => ({ ...prev, viewGradeMark: true }));
    } catch (error) {
      // console.error("Error fetching subject scale:", error);
      showToast(
        error.response?.data?.message || "Error fetching grading scheme scale.",
        "error",
        {
          duration: 3000,
          position: "top-right",
        }
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const fetchGradingScales = async () => {
    if (selectedForm && selectedExam) {
      setLoading(true);
      try {
        const response = await api.post("grading/gradingscales", {
          form: selectedForm,
          exam: selectedExam,
        });
        setGradingScales(response.data);
      } catch (error) {
        // console.error("Error fetching grading scales:", error);
        showToast(
          error.response?.data?.message ||
            "Error fetching grading scheme scales.",
          "error",
          {
            duration: 3000,
            position: "top-right",
          }
        );
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchGradingScales();
  }, [selectedForm, selectedExam]);

  useEffect(() => {
    const fetchExamOptions = async () => {
      if (selectedForm && selectedTerm && selectedYear) {
        try {
          const response = await api.post("exam/exams", {
            form: selectedForm,
            term: selectedTerm,
            year: selectedYear,
          });
          setExamOptions(
            response.data.map((exam) => ({
              value: exam.id,
              label: exam.exam_name,
              key: exam.id,
            }))
          );
        } catch (error) {
          // console.error("Error fetching exam options:", error);
          showToast(
            error.response?.data?.message || "Error fetching exam options.",
            "error",
            {
              duration: 3000,
              position: "top-right",
            }
          );
        }
      }
    };
    fetchExamOptions();
  }, [selectedForm, selectedTerm, selectedYear]);
  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Manage Grading Scale
      </h1>

      <div className="flex flex-col lg:flex-row gap-2">
        {/* Controls Section */}
        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800 mb-2"
            tag="Manage Grading Scale"
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
                  value={
                    yearOptions.find((opt) => opt.value === selectedYear) ||
                    undefined
                  }
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    resetBelow("year");
                  }}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="form"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {isCBC ? "Grade" : "Form"}
                </label>
                <ReusableSelect
                  id="form"
                  placeholder={`Select ${isCBC ? "grade" : "form"}`}
                  options={setFormOptions}
                  value={
                    setFormOptions.find((opt) => opt.value === selectedForm) ||
                    undefined
                  }
                  onChange={(e) => {
                    setSelectedForm(e.target.value);
                    resetBelow("form");
                  }}
                  disabled={!selectedYear}
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
                  value={
                    termOptions.find((opt) => opt.value === selectedTerm) ||
                    undefined
                  }
                  onChange={(e) => {
                    setSelectedTerm(e.target.value);
                    resetBelow("term");
                  }}
                  disabled={!selectedForm}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="exam"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Exam
                </label>
                <ReusableSelect
                  id="exam"
                  placeholder="Select Exam"
                  options={examOptions}
                  value={
                    examOptions.find((opt) => opt.value === selectedExam) ||
                    undefined
                  }
                  onChange={(e) => {
                    setSelectedExam(e.target.value);
                    setSelectedExamKey(
                      examOptions.find(
                        (examOption) =>
                          examOption.value === String(e.target.value)
                      )?.key
                    );
                    resetBelow("exam");
                  }}
                  disabled={!selectedTerm}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
        </div>

        {/* Table Section */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4">
            <TableComponent
              columns={columns}
              data={gradingScales}
              loading={loading}
              excludedColumns={excludedColumns}
              staticColumns={staticColumns}
              staticColumnBg="bg-gray-50"
              showSelectAllCheckbox={false}
              buttons={{
                actionButtons: {
                  show: true,
                  options: [
                    {
                      label: "Edit",
                      icon:
                        updateLoading && selectedRowId ? (
                          <FaSpinner className="animate-spin w-4 h-4" />
                        ) : (
                          <BsPencil className="w-4 h-4" />
                        ),
                      onClick: handleEditClick,
                      disabled: updateLoading,
                    },
                  ],
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalState.viewGradeMark && (
        <GradingRU
          isOpen={modalState.viewGradeMark}
          onClose={() =>
            setModalState((prev) => ({ ...prev, viewGradeMark: false }))
          }
          refreshTable={fetchGradingScales}
          loading={updateLoading}
          selectedForm={selectedForm}
          selectedExamKey={selectedExam}
          selectedSubject={selectedRowId}
          initialData={subjectScale}
          isCBC={syst_level !== "Secondary (8-4-4)" ? true : false}
        />
      )}
    </div>
  );
};

export default Grading;
