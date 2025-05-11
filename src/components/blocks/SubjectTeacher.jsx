import React, { useState } from 'react';
import ReusableDiv from '../ReusableDiv';
import TableComponent from '../TableComponent';
import ReusableSelect from '../ReusableSelect';
import Dropdown from '../Dropdown';
import { FaUsersGear } from 'react-icons/fa6';
import { BsPencil } from "react-icons/bs";
import { MdDone } from 'react-icons/md';
import { formOptions, yearOptions } from '../../utils/CommonData';
import { useToast } from '../Toast';
import api from '../../hooks/api';
import Button from '../ui/raw/Button';
import SubjectTeacherRU from '../snippets/SubjectTeacherRU';

const SubjectTeacher = () => {
  const { showToast } = useToast();

  const [subTeacherData, setSubTeacherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [streams, setStreams] = useState([]);
  const [unassignedSubjects, setUnassignedSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [rowData, setRowData] = useState('');

  const [modalState, setModalState] = useState({
    editSubjectTeacher : false
  });

  const columns = [
    { name: "CODE.", uid: "code", sortable: true },
    { name: "SUBJECT", uid: "name", sortable: true },
    { name: "INSTRUCTOR", uid: "instructor", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const excludedColumns = [];

  const resetBelow = (field) => {
    switch (field) {
      case 'year':
        setSelectedForm('');
        setStreams([]);
        setSelectedStream('');
        setSubTeacherData([]);
        setUnassignedSubjects([]);
        setTeachers([]);
        break;
      case 'form':
        setStreams([]);
        setSelectedStream('');
        setSubTeacherData([]);
        setUnassignedSubjects([]);
        setTeachers([]);
        break;
      default:
        break;
    }
  };

  const fetchStreams = async (form, year) => {
    try {
      setLoading(true);
      const response = await api.post('/stream/getstreams', { form, year });
      const formattedStreams = response.data.map(s => ({
        value: s.id,
        label: s.stream_name
      }));
      setStreams(formattedStreams);
    } catch (err) {
        if(err.response?.data?.status === 404){
           showToast('No streams available. Please Add Stream.', 'error', {duration : 3000});
        }else if(err.response?.data?.status !== 404){
           showToast('Failed to fetch streams', 'error', {duration : 3000});
        }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectTeachers = async (stream) => {
    try {
      setLoading(true);
      const res = await api.post('/teacher/getsubjectteachers', {
        form: selectedForm,
        year: selectedYear,
        stream_id: stream
      });

      setSubTeacherData(res.data.assignedSubjects || []);
      setUnassignedSubjects(res.data.unassignedSubjects || []);

      if ((res.data.unassignedSubjects || []).length > 0) {
        const teacherRes = await api.post('/teacher/getteachers', {
          year: selectedYear
        });
        const formattedTeachers = teacherRes.data.map(t => ({
          value: t.id,
          label: `${t.title} ${t.fname} ${t.lname}`
        }));
        setTeachers(formattedTeachers);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      showToast('Error fetching subject teachers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStreamChange = async (e) => {
    const stream = e.target.value;
    setSelectedStream(stream);
    await fetchSubjectTeachers(stream);
  };

  const handleAssign = async () => {
    if (!selectedSubject || !selectedTeacher) {
      showToast('Select both subject and teacher', 'error', {duration : 3000});
      return;
    }

    try {
      setAssignLoading(true);
      await api.post('/teacher/addsubjectteacher', {
        form : selectedForm,
        stream_id: selectedStream,
        teacher_id: selectedTeacher,
        subject_id: selectedSubject.value,
        year: selectedYear
      });

      showToast('Teacher assigned successfully', 'success', {duration : 3000});
      await fetchSubjectTeachers(selectedStream);
      setSelectedSubject(null);
      setSelectedTeacher(null);
    } catch (err) {
      showToast('Assignment failed', 'error', {duration : 3000});
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className='my-4 flex flex-1 gap-2'>
      <div className='w-1/4 flex flex-col'>
        <ReusableDiv className="ring-1 h-fit bg-blue-100 mb-4" tag="Subject Teachers" icon={FaUsersGear}>
          <div className="flex flex-wrap pb-4">
            <div className="w-full flex flex-col mb-2">
              <label htmlFor="year">Year</label>
              <ReusableSelect
                id="year"
                placeholder="Select Year"
                options={yearOptions}
                value={selectedYear}
                onChange={(e) => {
                  const year = e.target.value;
                  setSelectedYear(year);
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
                value={selectedForm}
                onChange={async (e) => {
                  const form = e.target.value;
                  setSelectedForm(form);
                  resetBelow('form');
                  if (form && selectedYear) {
                    await fetchStreams(form, selectedYear);
                  }
                }}
                disabled={!selectedYear}
              />
            </div>

            <div className="w-full flex flex-col mb-2">
              <label htmlFor="stream">Stream</label>
              <ReusableSelect
                id="stream"
                placeholder="Select Stream"
                options={streams}
                value={selectedStream}
                onChange={handleStreamChange}
                disabled={!selectedYear || !selectedForm || streams.length === 0}
              />
            </div>
          </div>
        </ReusableDiv>

        {unassignedSubjects.length > 0 && (
          <ReusableDiv className="ring-1 h-fit bg-blue-100" tag="Assign Instructor" icon={FaUsersGear} collapsible={true}>
            <div className="flex flex-wrap pb-4">
              <div className="w-full flex flex-col mb-2">
                <ReusableSelect
                  id="subject"
                  placeholder="Select Subject"
                  options={unassignedSubjects}
                  value={selectedSubject?.value || ''}
                  onChange={(e) => {
                    const sub = unassignedSubjects.find(s => s.value === parseInt(e.target.value));
                    setSelectedSubject(sub || null);
                  }}
                />
              </div>
              <div className="w-full flex flex-col mb-2">
                <Dropdown
                  options={teachers}
                  value={selectedTeacher}
                  onChange={setSelectedTeacher}
                  placeholder={'Select Teacher'}
                  menuPlacement="auto"
                  searchable
                  clearable
                  className='z-50'
                />
                <Button
                  variant='primary'
                  icon={MdDone}
                  className='my-0.5 w-fit'
                  onClick={handleAssign}
                  loading={assignLoading}
                >
                  Assign
                </Button>
              </div>
            </div>
          </ReusableDiv>
        )}
      </div>

      <TableComponent
        columns={columns}
        data={subTeacherData}
        loading={loading}
        horizontalTableFlow={true}
        excludedColumns={excludedColumns}
        showSelectAllCheckbox={false}
        striped={true}
        buttons={{
          actionButtons: {
            show: true,
            options: [
              {
                label: "Edit",
                icon: <BsPencil className="w-4 h-4" />,
                onClick : (row) => {
                  setRowData(row)
                  setModalState(prev => ({editSubjectTeacher : true}))}
              }
            ]
          }
        }}
        borderColor="blue-200"
        rowColors={{
          default: "hover:bg-blue-50",
          selected: "bg-blue-100"
        }}
        defaultVisibleColumns={["code", "name", "instructor", "actions"]}
      />

      <SubjectTeacherRU
        modalState={modalState}
        setModalState={setModalState}
        selectedForm={selectedForm}
        rowData={rowData}
        teacherOptions={teachers}
        refreshTable={() => fetchSubjectTeachers(selectedStream)}
      />
    </div>
  );
};

export default SubjectTeacher;