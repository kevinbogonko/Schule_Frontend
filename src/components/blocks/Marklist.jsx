import React, { useState, useEffect } from 'react'
import TableComponent from "../TableComponent"
import ReusableDiv from '../ReusableDiv'
import ReusableSelect from '../ReusableSelect'
import { FaUsersGear, FaSpinner } from "react-icons/fa6"
import api from '../../hooks/api'
import { formOptions, yearOptions, termOptions } from '../../utils/CommonData'

const Marklist = () => {
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedForm, setSelectedForm] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [examOptions, setExamOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState([
        { name: "ID", uid: "id", sortable: true },
        { name: "Name", uid: "name", sortable: true }
    ]);

    const staticColumns = ['name'];

    const resetBelow = (field) => {
        switch (field) {
            case 'year':
                setSelectedForm(null);
                setSelectedTerm(null);
                setSelectedExam(null);
                setStudentData([]);
                setExamOptions([]);
                break;
            case 'form':
                setSelectedTerm(null);
                setSelectedExam(null);
                setStudentData([]);
                setExamOptions([]);
                break;
            case 'term':
                setSelectedExam(null);
                setStudentData([]);
                setExamOptions([]);
                break;
            case 'exam':
                setStudentData([]);
                break;
            default:
                break;
        }
    };

    const fetchStudentData = async () => {
        if (selectedForm && selectedExam) {
            setLoading(true);
            try {
                const response = await api.post('exam/processmarks', {
                    form: selectedForm,
                    exam: selectedExam
                });
                console.log(response.data)
                // Generate dynamic columns from subjects
                if (response.data.length > 0) {
                    const firstStudent = response.data[0];
                    const subjectColumns = Object.keys(firstStudent.subjects).map(subject => ({
                        name: subject,
                        uid: subject,
                        sortable: true
                    }));
                    
                    // Add static columns and calculated columns
                    const newColumns = [
                        { name: "ID", uid: "id", sortable: true },
                        { name: "Name", uid: "name", sortable: true },
                        ...subjectColumns,
                        { name: "Marks", uid: "marks", sortable: true },
                        { name: "Points", uid: "points", sortable: true },
                        { name: "Rank", uid: "rank", sortable: true }
                    ];
                    
                    setColumns(newColumns);
                }
                
                setStudentData(response.data);
            } catch (error) {
                console.error('Error fetching student data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, [selectedForm, selectedExam]);

    useEffect(() => {
        const fetchExamOptions = async () => {
            if (selectedForm && selectedTerm && selectedYear) {
                try {
                    const response = await api.post('exam/exams', {
                        form: selectedForm,
                        term: selectedTerm,
                        year: selectedYear
                    });
                    setExamOptions(response.data.map(exam => ({
                        value: exam.exam_name,
                        label: exam.exam_name,
                        key: exam.id
                    })));
                } catch (error) {
                    console.error('Error fetching exam options:', error);
                }
            }
        };
        fetchExamOptions();
    }, [selectedForm, selectedTerm, selectedYear]);

    return (
        <div className="w-full my-4 flex flex-1 gap-2">
            <ReusableDiv className="w-1/4 ring-1 h-fit bg-blue-100" tag="Manage Student Marks" icon={FaUsersGear}>
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
                            value={examOptions.find(opt => opt.value === selectedExam) || undefined}
                            onChange={(e) => {
                                setSelectedExam(e.target.value);
                                resetBelow('exam');
                            }}
                            disabled={!selectedTerm}
                        />
                    </div>
                </div>
            </ReusableDiv>
            
            <TableComponent 
                columns={columns} 
                data={studentData.map(student => ({
                    ...student,
                    ...student.subjects
                }))}
                loading={loading}
                showSelectAllCheckbox={false}
                staticColumns={staticColumns}
                staticColumnBg='bg-gray-50'
            />
        </div>
    )
}

export default Marklist