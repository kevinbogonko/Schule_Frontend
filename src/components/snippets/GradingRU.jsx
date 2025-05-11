import React, { useState, useEffect } from 'react'
import { useToast } from '../Toast'
import ModalForm from '../ui/raw/ModalForm'
import ReusableInput from '../ui/ReusableInput'
import { FiUserPlus } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import api from '../../hooks/api'

const GradingRU = ({ 
  isOpen, 
  onClose, 
  loading, 
  initialData,
  selectedExam,
  selectedSubject 
}) => {

    const { showToast } = useToast()

    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        e_1: initialData?.E?.max || ''
    });

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData?.E?.max) {
            setFormData(prev => ({
                ...prev,
                e_1: initialData.E.max
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validate input is numeric and max 2 digits
        if (value === '' || (value.length <= 2 && /^\d+$/.test(value))) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async () => {
        // Validate input exists (can be from initial data or user input) and has exactly 2 digits
        if (!formData.e_1 || formData.e_1.toString().length !== 2) {
            setError('Please enter a valid 2-digit value');
            return;
        }

        try {
            const payload = {
                e_1: formData.e_1,
                exam: selectedExam,
                id: selectedSubject
            };

            const response = await api.put('grading/updategrading', payload);
            if(response.status === 200 || response.status === 201){
                showToast('Grading scale updated successfully', 'success', {
                    duration: 3000,
                    position : 'top-center'
                  })
                onClose();
            }
        } catch (err) {
            showToast('Failed to update grading scale', 'error', {
                duration: 3000,
                position : 'top-center'
            })
            setError(err.response?.data?.message || 'Failed to update grading scale');
        }
    };

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            title="Update Grading Scheme"
            icon={FiUserPlus}
            onSubmit={handleSubmit}
            size="lg"
            submitText={loading ? <FaSpinner className="animate-spin"/> : 'Update'}
            submitDisabled={loading}
        >
            <div>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
                <div className="mb-2">
                    <label htmlFor="e_1" className="block text-sm font-medium text-gray-700">
                        Grade E Max range Value (00-99) *
                    </label>
                    <ReusableInput 
                        type="number"
                        name="e_1" 
                        id="e_1" 
                        placeholder="Enter E Grade Max range Value (00-99)"
                        className="w-full mt-1" 
                        value={formData.e_1}
                        onChange={handleChange}
                        required
                        min="0"
                        max="99"
                        maxLength={2}
                        pattern="\d{2}"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Must be exactly 2 digits (00-99)
                    </p>
                </div>
            </div>
        </ModalForm>
    )
}

export default GradingRU