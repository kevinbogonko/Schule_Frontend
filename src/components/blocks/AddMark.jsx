import React, { useState, useEffect } from 'react';
import ReusableDiv from '../ReusableDiv';
import ReusableSelect from '../ReusableSelect';
import { FaUsersGear } from 'react-icons/fa6';
import { GrDocumentConfig } from 'react-icons/gr';
import { MdDone } from 'react-icons/md';
import api from '../../hooks/api';
import TableMarkComponent from '../TableMarkComponent';
import { formOptions, yearOptions, termOptions, paperOptions, formulaOptions } from '../../utils/CommonData';
import { useToast } from '../Toast';
import ReusableInput from '../ui/ReusableInput';
import Button from '../ui/raw/Button';
import { motion, AnimatePresence } from 'framer-motion';

const AddMark = () => {
  const { showToast } = useToast();
  const [studentData, setStudentData] = useState([]);
  const [optimisticData, setOptimisticData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examOptions, setExamOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [gradingScale, setGradingScale] = useState({
    E: { min: 0, max: 29 },
    'D-': { min: 30, max: 34 },
    D: { min: 35, max: 39 },
    'D+': { min: 40, max: 44 },
    'C-': { min: 45, max: 49 },
    C: { min: 50, max: 54 },
    'C+': { min: 55, max: 59 },
    'B-': { min: 60, max: 64 },
    B: { min: 65, max: 69 },
    'B+': { min: 70, max: 74 },
    'A-': { min: 75, max: 79 },
    A: { min: 80, max: 100 },
  });

  // Dynamic paper config state
  const [papers, setPapers] = useState(2);
  const [calculationMethod, setCalculationMethod] = useState('threePaperAvgAdd');
  const [isUpdatingPaperSetup, setIsUpdatingPaperSetup] = useState(false);
  const showPapers = true;

  const resetBelow = (level) => {
    if (level === 'year') {
      setSelectedForm('');
      setSelectedTerm('');
      setSelectedExam('');
      setSelectedSubject('');
      setExamOptions([]);
      setSubjectOptions([]);
      setStudentData([]);
    } else if (level === 'form') {
      setSelectedTerm('');
      setSelectedExam('');
      setSelectedSubject('');
      setExamOptions([]);
      setSubjectOptions([]);
      setStudentData([]);
    } else if (level === 'term') {
      setSelectedExam('');
      setSelectedSubject('');
      setExamOptions([]);
      setSubjectOptions([]);
      setStudentData([]);
    } else if (level === 'exam') {
      setSelectedSubject('');
      setSubjectOptions([]);
      setStudentData([]);
    } else if (level === 'subject') {
      setStudentData([]);
    }
  };

  useEffect(() => {
    const fetchExams = async () => {
      if (selectedForm && selectedTerm) {
        const payload = {
          form: selectedForm,
          term: selectedTerm,
          year: selectedYear
        };

        try {
          const response = await api.post('/exam/exams', payload);
          setExamOptions(response.data.map(exam => ({
            value: exam.exam_name,
            label: exam.exam_name
          })));
        } catch (err) {
          resetBelow('term');
          showToast(err.response?.data?.message || 'Failed to fetch exams', 'error');
        }
      }
    };
    fetchExams();
  }, [selectedTerm]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (selectedForm && selectedExam) {
        const payload = {
          form: selectedForm,
          exam: selectedExam
        };

        try {
          const response = await api.post('/exam/examsubject', payload);
          setSubjectOptions(response.data.map(subject => ({
            value: subject.id,
            label: subject.id + " " + subject.name
          })));
        } catch (err) {
          resetBelow('exam');
          showToast(err.response?.data?.message || 'Failed to fetch subjects', 'error');
        }
      }
    };
    fetchSubjects();
  }, [selectedExam]);

  useEffect(() => {
    const fetchGradingScale = async () => {
      if (selectedForm && selectedExam && selectedSubject) {
        try {
          const response = await api.post('grading/gradingscale', {
            form: selectedForm,
            exam: selectedExam,
            subject: selectedSubject
          });
          setGradingScale(response.data);
        } catch (error) {
          showToast('Failed to fetch grading scale, using default', 'warning');
        }
      }
    };
    fetchGradingScale();
  }, [selectedSubject]);

  const fetchStudents = async () => {
    if (selectedForm && selectedExam && selectedSubject) {
      setIsRefreshing(true);
      const paperSetupPayload = {
        form: selectedForm,
        exam: selectedExam,
        subject: selectedSubject
      };

      try {
        const setupResponse = await api.post('/exam/papersetup', paperSetupPayload);
        const papersValue = setupResponse.data[0]?.papers || 1;
        setPapers(papersValue);

        if (papersValue === 2) {
          setCalculationMethod('twoPaperAvg');
        } else {
          setCalculationMethod(setupResponse.data[0]?.formula || 'threePaperAvg');
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to fetch paper setup', 'error');
      }

      try {
        const response = await api.post('/exam/subjectmarks', paperSetupPayload);

        const transformed = response.data.map((s) => {
          const student = {
            ...s,
            name: `${s.fname} ${s.lname}`,
            status: 'Active'
          };

          if (selectedForm === '1' || selectedForm === '2') {
            student[selectedSubject] = s[selectedSubject] || 0;
            student.mark = student[selectedSubject];
          } else {
            student[selectedSubject] = s[selectedSubject] || 0;
            student[`${selectedSubject}_1`] = s[`${selectedSubject}_1`] || 0;
            student[`${selectedSubject}_2`] = s[`${selectedSubject}_2`] || 0;
            student[`${selectedSubject}_3`] = s[`${selectedSubject}_3`] || 0;
            student.mark = showPapers ? calculateMark(student) : student[selectedSubject];
          }

          return student;
        });

        setStudentData(transformed);
      } catch (err) {
          console.log(err);
        showToast(err.response?.data?.message || 'Failed to fetch student data', 'error');
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setOptimisticData(null);
        }, 300); // Small delay for smoother transition
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedSubject]);

  useEffect(() => {
    if (papers === 2) {
      setCalculationMethod('twoPaperAvg');
    } else if (papers === 3) {
      setCalculationMethod('threePaperAvg');
    }
  }, [papers]);

  const handleUpdatePaperSetup = async () => {
    if (!selectedSubject || !selectedExam) {
      showToast('Please select subject and exam first', 'error', {duration : 3000});
      return;
    }
  
    setIsUpdatingPaperSetup(true);
    
    try {
      const formData = {
        id: selectedSubject,
        exam: selectedExam,
        results: {
          papers: papers
        }
      };
  
      if (papers === 3 && calculationMethod) {
        formData.results.formula = calculationMethod;
      }

      await api.put('exam/updatepapersetup', formData);
      showToast('Paper setup updated successfully', 'success', {duration :3000});
      
      // Show loading state before refresh
      setIsRefreshing(true);
      setTimeout(() => {
        fetchStudents();
      }, 500); // Delay refresh slightly
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update paper setup', 'error', {duration :3000});
    } finally {
      setIsUpdatingPaperSetup(false);
    }
  };

  const calculateMark = (item) => {
    if (selectedForm === '1' || selectedForm === '2') {
      return item[selectedSubject] || 0;
    }

    if (!showPapers) {
      return item[selectedSubject] || 0;
    }

    const p1 = parseFloat(item[`${selectedSubject}_1`]) || 0;
    const p2 = parseFloat(item[`${selectedSubject}_2`]) || 0;
    const p3 = parseFloat(item[`${selectedSubject}_3`]) || 0;

    if (papers === 1) return p1;
    if (papers === 2) return Math.round((p1 + p2) / 2);
    if (papers === 3) {
      return calculationMethod === 'threePaperAvgAdd'
        ? Math.round(((p1 + p2) / 160 * 60 + p3))
        : calculationMethod === 'threePaperAddAgr'
        ? Math.round((p1 + p2 + p3) / 2)
        : Math.round((p1 + p2 + p3) / 3)
    }
    return 0;
  };

  const getColumns = () => {
    const baseColumns = [
      { uid: "id", name: "Reg No.", sortable: true },
      { uid: "name", name: "Name", sortable: true }
    ];

    if (selectedForm === '1' || selectedForm === '2') {
      return [
        ...baseColumns,
        { uid: selectedSubject, name: selectedSubject, sortable: true },
        { uid: "mark", name: "Mark", sortable: true },
        { uid: "grade", name: "Grade", sortable: true }
      ];
    } else {
      if (showPapers) {
        const paperColumns = [];
        if (papers >= 1) paperColumns.push({ uid: `${selectedSubject}_1`, name: "Paper 1", sortable: true });
        if (papers >= 2) paperColumns.push({ uid: `${selectedSubject}_2`, name: "Paper 2", sortable: true });
        if (papers >= 3) paperColumns.push({ uid: `${selectedSubject}_3`, name: "Paper 3", sortable: true });

        return [
          ...baseColumns,
          ...paperColumns,
          { uid: "mark", name: "Mark", sortable: true },
          { uid: "grade", name: "Grade", sortable: true }
        ];
      } else {
        return [
          ...baseColumns,
          { uid: selectedSubject, name: selectedSubject, sortable: true },
          { uid: "mark", name: "Mark", sortable: true },
          { uid: "grade", name: "Grade", sortable: true }
        ];
      }
    }
  };

  const getNumberColumns = () => {
    if (selectedForm === '1' || selectedForm === '2') {
      return [selectedSubject];
    } else {
      if (showPapers) {
        const cols = [];
        if (papers >= 1) cols.push(`${selectedSubject}_1`);
        if (papers >= 2) cols.push(`${selectedSubject}_2`);
        if (papers >= 3) cols.push(`${selectedSubject}_3`);
        return cols;
      } else {
        return [selectedSubject];
      }
    }
  };

  const getMarkCalculation = () => {
    if (selectedForm === '1' || selectedForm === '2') return null;
    if (!showPapers) return null;
    if (papers === 2) return 'twoPaperAvg';
    if (papers === 3) return calculationMethod;
    return null;
  };

  const handleSubmit = async (data) => {
    try {
      // Optimistic update - show changes immediately
      setOptimisticData(data);
      
      const payload = {
        exam_name: selectedExam,
        results: data
      };
      
      await api.put('/exam/updatemarks', payload);
      showToast('Marks saved successfully', 'success', {duration : 3000});
      
      // Smooth refresh with slight delay
      setIsRefreshing(true);
      setTimeout(() => {
        fetchStudents();
      }, 500);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticData(null);
      showToast('Failed to save marks', 'error', {duration : 3000});
    }
  };

  const handleCancel = async () => {
    if (selectedForm && selectedExam && selectedSubject) {
      setIsRefreshing(true);
      setTimeout(() => {
        fetchStudents();
      }, 300);
    }
  };

  // Get the data to display (either optimistic or real data)
  const displayData = optimisticData 
    ? studentData.map(student => ({
        ...student,
        ...optimisticData[student.id]
      }))
    : studentData;

  return (
    <div className="my-4 flex flex-1 gap-2">
      <div className='w-1/4 flex flex-col'>
        <ReusableDiv className="ring-1 h-fit bg-blue-100" tag="Manage Students" icon={FaUsersGear}>
          <div className="flex flex-wrap pb-4">
            <div className="w-full flex flex-col mb-2">
              <label htmlFor="year">Year</label>
              <ReusableSelect
                id="year"
                placeholder="Select Year"
                options={yearOptions}
                value={yearOptions.find(opt => opt.value === selectedYear) || undefined}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  resetBelow('year');
                }}
              />
            </div>
            <div className="w-full flex flex-col mb-2">
              <label htmlFor="form">Form</label>
              <ReusableSelect
                id="form"
                placeholder="Select Form"
                options={formOptions}
                value={formOptions.find(opt => opt.value === selectedForm) || undefined}
                onChange={(e) => {
                  setSelectedForm(e.target.value);
                  resetBelow('form');
                }}
                disabled={!selectedYear}
              />
            </div>
            <div className="w-full flex flex-col mb-2">
              <label htmlFor="term">Term</label>
              <ReusableSelect
                id="term"
                placeholder="Select Term"
                options={termOptions}
                value={termOptions.find(opt => opt.value === selectedTerm) || undefined}
                onChange={(e) => {
                  setSelectedTerm(e.target.value);
                  resetBelow('term');
                }}
                disabled={!selectedForm}
              />
            </div>
            <div className="w-full flex flex-col mb-2">
              <label htmlFor="exam">Exam</label>
              <ReusableSelect
                id="exam"
                placeholder="Select Exam"
                options={examOptions}
                value={selectedExam}
                onChange={(e) => {
                  setSelectedExam(e.target.value);
                  resetBelow('exam');
                }}
                disabled={!selectedTerm}
              />
            </div>
            <div className="w-full flex flex-col mb-2">
              <label htmlFor="subject">Subject</label>
              <ReusableSelect
                id="subject"
                placeholder="Select Subject"
                options={subjectOptions}
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  resetBelow('subject');
                }}
                disabled={!selectedExam}
              />
            </div>
          </div>
        </ReusableDiv>

        {studentData.length > 0 && (selectedForm === '3' || selectedForm === '4') && (
          <ReusableDiv className='mt-4 ring-1 h-fit bg-blue-100' tag="Paper Setup" icon={GrDocumentConfig} collapsible={true}>
            <div>
              <ReusableInput
                type='text'
                disabled={true}
                placeholder='Subject Code'
                value={selectedSubject}
                className='mb-2'
              />
              <ReusableSelect
                id="paper_subject"
                placeholder="Select Papers"
                className='w-full mb-2'
                options={paperOptions}
                value={papers}
                onChange={(e) => setPapers(parseInt(e.target.value))}
              />
              {papers === 3 && (
                <>
                  <ReusableSelect
                    id="formula"
                    placeholder="Select Formula"
                    className='w-full mb-2'
                    options={formulaOptions}
                    value={calculationMethod}
                    onChange={(e) => setCalculationMethod(e.target.value)}
                  />
              </>

              )}
            </div>
            <Button 
              variant='primary' 
              icon={MdDone}
              onClick={handleUpdatePaperSetup}
              loading={isUpdatingPaperSetup}
            >
              Apply
            </Button>
          </ReusableDiv>
        )}
      </div>

      <div className="relative flex-1">
        {isRefreshing && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="animate-pulse bg-white bg-opacity-70 p-4 rounded-lg">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSubject + selectedExam}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TableMarkComponent
              columns={getColumns()}
              data={displayData}
              subjectCode={selectedSubject}
              loading={loading}
              numberColumns={getNumberColumns()}
              markCalculation={getMarkCalculation()}
              gradingScale={gradingScale}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AddMark;