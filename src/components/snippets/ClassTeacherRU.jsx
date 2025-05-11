import React, { useEffect, useState } from 'react';
import ModalForm from '../ui/raw/ModalForm';
import ReusableSelect from '../ReusableSelect';
import { FiEdit2 } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { useToast } from '../Toast';
import api from '../../hooks/api';

const ClassTeacherRU = ({ modalState, setModalState, teacherOptions, rowData, selectedForm, refreshTable }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [error, setError] = useState('');
  const { showToast } = useToast();

  // Fetch teacher_id when dialog is about to open
  useEffect(() => {
    const fetchTeacher = async () => {
      if (modalState.editClassTeacher && rowData) {
        setIsLoading(true);
        try {
          const res = await api.post('/teacher/getclassteacher', {
            form: selectedForm,
            id: rowData,
          });
          setTeacherId(res.data.teacher_id);
        } catch (err) {
          setError('Failed to fetch teacher');
        }
        setIsLoading(false);
      }
    };
    fetchTeacher();
  }, [modalState.editClassTeacher, rowData, selectedForm]);

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.put(`/teacher/updateclassteacher/${parseInt(rowData)}`, {
        form: selectedForm,
        teacher_id: teacherId,
      });
      showToast('Class teacher updated successfully', 'success', {duration : 3000});
      setModalState(prev => ({ ...prev, editClassTeacher: false }));
      refreshTable(); // refresh data after update
    } catch (err) {
      setError('Update failed. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <ModalForm
        isOpen={modalState.editClassTeacher && !isLoading}
        onClose={() => {
          setError('');
          setTeacherId('');
          setModalState(prev => ({ ...prev, editClassTeacher: false }));
        }}
        title="Update Class Teacher"
        icon={FiEdit2}
        initialValues={{ teacher: teacherId }}
        onSubmit={handleSubmit}
        closeOnOutsideClick={false}
        size="lg"
        submitText={isSubmitting ? <FaSpinner className="animate-spin" /> : 'Submit'}
        submitDisabled={isSubmitting}
      >
        {({ values, handleChange, setFieldValue }) => (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="text-center py-6">
                <FaSpinner className="animate-spin inline mr-2" />
                Loading...
              </div>
            ) : (
              <div>
                <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">
                  Teacher *
                </label>
                <ReusableSelect
                  name="teacher"
                  id="teacher"
                  options={teacherOptions}
                  placeholder="Select Teacher"
                  className="w-full"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  required
                />
              </div>
            )}
          </>
        )}
      </ModalForm>
    </div>
  );
};

export default ClassTeacherRU;