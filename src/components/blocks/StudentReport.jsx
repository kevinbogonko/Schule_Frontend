import React, { useState, useEffect } from 'react';
import ReusableDiv from '../ReusableDiv';
import ReusableSelect from '../ReusableSelect';
// import { FaUsersGear } from 'react-icons/fa6';
import { PiExam } from 'react-icons/pi';
import { TbReport } from 'react-icons/tb';
import { FaPlus, FaMinus, FaSpinner } from 'react-icons/fa';
import { MdDone } from 'react-icons/md';
import { formOptions, yearOptions, termOptions } from '../../utils/CommonData';
import { useToast } from '../Toast';
import ReusableInput from '../ui/ReusableInput';
import Dropdown from '../Dropdown';
import Button from '../ui/raw/Button';
import api from '../../hooks/api'
import { GrDocumentDownload } from 'react-icons/gr';

const StudentReport = () => {
    const { showToast } = useToast();
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedForm, setSelectedForm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [examOptions, setExamOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [error, setError] = useState('');
    const [examRows, setExamRows] = useState([{ exam: null, examAlias: '', outOf: '' }]);
    const [selectedFormula, setSelectedFormula] = useState('');
    const [isAddDisabled, setIsAddDisabled] = useState(true);
    const [pdfUrl, setPdfUrl] = useState(null);

    const getAvailableOptions = (currentIndex) => {
        const selectedExams = examRows
            .map((row, index) => index !== currentIndex ? row.exam : null)
            .filter(Boolean);

        return examOptions.filter(option => !selectedExams.includes(option.value));
    };

    const validateRow = (row) => {
        const isAliasValid = row.examAlias.trim().length >= 3;
        const isOutOfValid = /^([1-9][0-9]?|100)$/.test(row.outOf);
        return row.exam && isAliasValid && isOutOfValid;
    };

    useEffect(() => {
        const valid = examRows.every(validateRow);
        setIsAddDisabled(!valid);
        
        // Set average as default formula when there are multiple rows
        if (examRows.length > 1 && !selectedFormula) {
            setSelectedFormula('average');
        }
    }, [examRows, selectedFormula]);

    const addExamRow = () => {
        if (examRows.length < 3) {
            setExamRows([...examRows, { exam: null, examAlias: '', outOf: '' }]);
        }
    };

    const removeExamRow = () => {
        if (examRows.length > 1) {
            const newRows = examRows.slice(0, -1);
            setExamRows(newRows);
            if (newRows.length < 2) setSelectedFormula('');
        }
    };

    const handleExamChange = (index, value) => {
        const newRows = [...examRows];
        newRows[index].exam = value;
        setExamRows(newRows);
    };

    const handleInputChange = (index, field, value) => {
        const newRows = [...examRows];
        if (field === 'outOf') {
            if (!/^(100|[1-9][0-9]?)?$/.test(value)) {
                showToast('Out of value must be 1-100 and cannot start with 0', 'error', { duration: 2000 });
                return;
            }
        }
        newRows[index][field] = value;
        setExamRows(newRows);
    };

    const getFormulaOptions = () => {
        if (examRows.length === 2) {
            return [
                { value: 'average', label: 'Average' },
                { value: 'weighted1', label: 'Weighted : E1 + E2 = 100%' },
            ];
        } else if (examRows.length === 3) {
            return [
                { value: 'average', label: 'Average' },
                { value: 'weighted2', label: 'Weighted : E1 + E2 + E3 = 100%' },
                { value: 'weighted3', label: 'Weighted : .15E1 + .15E2 + .7E3 = 100%' },
            ];
        }
        return [];
    };

    const resetBelow = (field) => {
        if (field === 'year') {
            setSelectedForm('');
            setSelectedTerm('');
            setExamOptions([]);
            setSelectedFormula('');
            setExamRows([{ exam: null, examAlias: '', outOf: '' }]);
        }
        if (field === 'form') {
            setSelectedTerm('');
            setExamOptions([]);
            setSelectedFormula('');
            setExamRows([{ exam: null, examAlias: '', outOf: '' }]);
        }
        if (field === 'term') {
            setExamOptions([]);
            setSelectedFormula('');
            setExamRows([{ exam: null, examAlias: '', outOf: '' }]);
        }
    };

    const fetchPdf = async () => {
        try {
            setLoading(true);
            setError(null);

            const payload = {
                form: selectedForm,
                exams: {},
                formula: selectedFormula || 'self',
                yearValue : selectedYear
            };

            examRows.forEach((row, index) => {
                payload.exams[`exam_${index + 1}`] = {
                    alias: row.examAlias,
                    name: row.exam,
                    outof: row.outOf
                };
            });

            const response = await api.post('/pdfr/pdfr', payload, {
                responseType: 'blob'
            });
            
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPdfUrl(pdfUrl);
        } catch (err) {
            console.error('Error fetching PDF:', err);
            setError('Failed to load PDF. Please try again.');
            showToast('Failed to load PDF. Please try again.', 'error', { duration: 2000 });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFormula = async() => {
        try {
            setButtonLoading(true);
            await fetchPdf();
            showToast('Report generated successfully!', 'success', { duration: 3000 });
        } catch (error) {
            console.error('API Error:', error);
            showToast(error?.response?.data?.message || 'Failed to generate report', 'error', { duration: 2000 });
        } finally {
            setButtonLoading(false);
        }
    };

    useEffect(() => {
        const fetchExamOptions = async () => {
            if (selectedYear && selectedForm && selectedTerm) {
                setLoading(true);
                try {
                    const response = await api.post('/exam/exams', {
                        form: selectedForm,
                        term: selectedTerm,
                        year: selectedYear
                    });

                    if (response.data.length === 0) {
                        setExamOptions([]);
                        showToast('No exams found for selected combination', 'error', {
                            duration: 3000,
                            position: 'top-center'
                        });
                    } else {
                        setExamOptions(response.data.map(exam => ({
                            value: exam.exam_name,
                            label: exam.exam_name,
                            key: exam.id
                        })));
                    }
                } catch (err) {
                    setExamOptions([]);
                    showToast(err?.response?.data?.message || 'Failed to fetch exam options', 'error', {
                        duration: 3000,
                        position: 'top-center'
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchExamOptions();
    }, [selectedYear, selectedForm, selectedTerm]);

    return (
      <div className="p-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
          Exam Report Processing
        </h1>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Form Controls */}
          <div className="w-full lg:w-1/2">
            <ReusableDiv
              className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
              tag="Select Exam"
              icon={PiExam}
              collapsible={true}
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
                      yearOptions.find(
                        (option) => option.value === selectedYear
                      ) || undefined
                    }
                    onChange={(e) => {
                      const newVal = e.target.value;
                      resetBelow("year");
                      setSelectedYear(newVal);
                    }}
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
                    placeholder={
                      selectedYear ? "Select Form" : "Please select year first"
                    }
                    options={formOptions}
                    value={
                      selectedForm
                        ? formOptions.find((opt) => opt.value === selectedForm)
                        : undefined
                    }
                    onChange={(e) => {
                      const newVal = e.target.value;
                      resetBelow("form");
                      setSelectedForm(newVal);
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
                    placeholder={
                      selectedForm ? "Select Term" : "Please select form first"
                    }
                    options={termOptions}
                    value={
                      termOptions.find(
                        (option) => option.value === selectedTerm
                      ) || undefined
                    }
                    onChange={(e) => {
                      const newVal = e.target.value;
                      resetBelow("term");
                      setSelectedTerm(newVal);
                    }}
                    disabled={!selectedForm}
                    className="w-full"
                  />
                </div>
              </div>
            </ReusableDiv>
          </div>

          {/* Process Report Section */}
          <div className="w-full lg:w-1/2">
            <ReusableDiv
              className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
              tag="Process Report"
              icon={TbReport}
              collapsible={true}
            >
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <FaSpinner className="animate-spin text-2xl text-blue-600 dark:text-blue-400" />
                </div>
              ) : (
                <div className="flex flex-col space-y-3 pb-4">
                  <div className="flex flex-row items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                    <div className="w-2/5">Exam</div>
                    <div className="w-2/5">Exam Alias</div>
                    <div className="w-1/5">Out of %</div>
                  </div>

                  {examRows.map((row, index) => {
                    const isDisabled = examOptions.length === 0;
                    return (
                      <div
                        key={index}
                        className="flex flex-row items-center gap-2"
                      >
                        <div className="w-2/5">
                          <Dropdown
                            options={getAvailableOptions(index)}
                            value={row.exam}
                            onChange={(value) => handleExamChange(index, value)}
                            placeholder={
                              examRows.length === 1
                                ? "Select Exam"
                                : `Select Exam ${index + 1}`
                            }
                            menuPlacement="auto"
                            searchable
                            clearable
                            className="z-50"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="w-2/5">
                          <ReusableInput
                            type="text"
                            placeholder="Exam Alias"
                            value={row.examAlias}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "examAlias",
                                e.target.value
                              )
                            }
                            disabled={isDisabled}
                            className="w-full"
                          />
                        </div>
                        <div className="w-1/5">
                          <ReusableInput
                            type="number"
                            placeholder="Out of %"
                            value={row.outOf}
                            onChange={(e) =>
                              handleInputChange(index, "outOf", e.target.value)
                            }
                            disabled={isDisabled}
                            className="w-full"
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex flex-row gap-2">
                    {examRows.length < 3 && (
                      <Button
                        onClick={addExamRow}
                        variant="success"
                        className="my-0.5"
                        disabled={isAddDisabled}
                      >
                        <FaPlus size={12} /> Add Exam
                      </Button>
                    )}
                    {examRows.length > 1 && (
                      <Button
                        onClick={removeExamRow}
                        variant="danger"
                        className="my-0.5"
                      >
                        <FaMinus size={12} /> Remove Exam
                      </Button>
                    )}
                  </div>

                  <div
                    className={`mt-2 flex ${
                      examRows.length > 1
                        ? "flex-row items-center gap-4 justify-between"
                        : "justify-start"
                    }`}
                  >
                    {examRows.length > 1 && (
                      <div className="w-2/5">
                        <ReusableSelect
                          id="formula"
                          placeholder="Select Formula"
                          className="my-0.5 w-full"
                          options={getFormulaOptions()}
                          value={
                            getFormulaOptions().find(
                              (opt) => opt.value === selectedFormula
                            ) || undefined
                          }
                          onChange={(e) => setSelectedFormula(e.target.value)}
                          disabled={examOptions.length === 0}
                        />
                      </div>
                    )}
                    <Button
                      variant="primary"
                      icon={MdDone}
                      onClick={handleApplyFormula}
                      className="my-0.5"
                      loading={buttonLoading}
                      disabled={
                        isAddDisabled ||
                        examOptions.length === 0 ||
                        (examRows.length > 1 && !selectedFormula)
                      }
                    >
                      Apply Formula
                    </Button>
                  </div>
                </div>
              )}
            </ReusableDiv>
          </div>
        </div>

        {/* Report Viewer */}
        <div className="mt-4">
          <ReusableDiv
            icon={GrDocumentDownload}
            tag="Student Report"
            className="ml-0 mr-0 ring-1 bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md"
            collapsible={true}
          >
            {pdfUrl ? (
              <div
                className="flex flex-col h-full p-0"
                style={{ minHeight: "70vh" }}
              >
                <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  Student Report Form:
                </h2>
                <div className="flex-1 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                  <iframe
                    src={pdfUrl}
                    title="PDF Report"
                    width="100%"
                    height="100%"
                    className="min-h-[70vh]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                Configure and process exams to generate report
              </div>
            )}
          </ReusableDiv>
        </div>
      </div>
    );
};

export default StudentReport;