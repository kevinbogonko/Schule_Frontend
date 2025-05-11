import React, {useState, useEffect} from 'react'
import ModalForm from '../ui/raw/ModalForm';
import ReusableInput from '../ui/ReusableInput'
import { FiUserPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ReusableSelect from '../ReusableSelect'
import api from '../../hooks/api'
import {FaSpinner} from 'react-icons/fa'
import { useToast } from '../Toast'
import Button from '../ui/raw/Button';
import { sexOptions, titleOptions, yearOptions } from '../../utils/CommonData'

const StaffCRUD = ({modalState, setModalState, rowData, refreshTable, onDelete}) => {
    const { showToast } = useToast()
    const [staffData, setStaffData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [editFormData, setEditFormData] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const initialFormData = {
        id: '',
        title: '',
        fname: '',
        mname: '',
        lname: '',
        sex: '',
        year: '',
        phone: '',
        email: '',
    }

    const fetchStaffData = async () => {
        setIsLoading(true)
        try {
            const response = await api.post('/teacher/getteacher', {
                teacher_id: rowData
            })
            setStaffData(response.data)
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to fetch teacher data', 'error', {
                duration: 3000,
                position: 'top-center'
            })
            setModalState(prev => ({...prev, viewStaff: false}))
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch staff data when view modal opens
    useEffect(() => {
        if (modalState.viewStaff && rowData) {
            fetchStaffData()
        }
    }, [modalState.viewStaff, rowData])

    // Set edit form data when edit modal opens
    useEffect(() => {
        if (modalState.editStaff && staffData) {
            setEditFormData({
                ...staffData,
                phone: staffData.phone ? `+${staffData.phone}` : ''
            })
        }
    }, [modalState.editStaff, staffData])

    const validateForm = (formValues) => {
        if (!formValues.id || !formValues.title || !formValues.fname || 
            !formValues.lname || !formValues.sex || !formValues.year) {
            setError('Please fill in all required fields!')
            return false
        }
        return true
    }

    const handleSubmit = async (formValues) => {
        if (!validateForm(formValues)) return

        setIsSubmitting(true)
        setError('')

        try {
            const response = await api.post('/teacher/addteacher', formValues)
            
            if (response.status === 200 || response.status === 201) {
                setModalState(prev => ({...prev, addStaff: false}))
                showToast('Teacher Added Successfully', 'success', {
                    duration: 3000,
                    position: 'top-center'
                })
                refreshTable()
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to add teacher. Please try again."
            setError(errorMsg)
            showToast(errorMsg, 'error', {
                duration: 3000,
                position: 'top-center'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (formValues) => {
        if (!validateForm(formValues)) return

        setIsSubmitting(true)
        setError('')

        try {
            const response = await api.put(`/teacher/updateteacher/${rowData}`, formValues)
            
            if (response.status === 200 || response.status === 201) {
                setModalState(prev => ({...prev, editStaff: false}))
                showToast('Teacher Updated Successfully', 'success', {
                    duration: 3000,
                    position: 'top-center'
                })
                refreshTable()
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to update teacher. Please try again."
            setError(errorMsg)
            showToast(errorMsg, 'error', {
                duration: 3000,
                position: 'top-center'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this teacher?')) return

        setIsLoading(true)
        try {
            const response = await api.delete(`/teacher/deleteteacher/${rowData}`)
            
            if (response.status === 200 || response.status === 201) {
                showToast('Teacher Deleted Successfully', 'success', {
                    duration: 3000,
                    position: 'top-center'
                })
                setModalState(prev => ({...prev, viewStaff: false}))
                onDelete()
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete teacher', 'error', {
                duration: 3000,
                position: 'top-center'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Add Staff Modal */}
            <ModalForm
                isOpen={modalState.addStaff}
                onClose={() => {
                    setError('')
                    setModalState(prev => ({...prev, addStaff: false}))
                }}
                title="Add Teacher"
                icon={FiUserPlus}
                initialValues={initialFormData}
                onSubmit={handleSubmit}
                closeOnOutsideClick={false}
                size="lg"
                submitText={isSubmitting ? <FaSpinner className="animate-spin"/> : 'Submit'}
                submitDisabled={isSubmitting}
            >
                {({ values, handleChange }) => (
                    <>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <div className="mb-2">
                                <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                                    Staff Number *
                                </label>
                                <ReusableInput 
                                    name="id" 
                                    id="id" 
                                    className="w-full mt-1" 
                                    value={values.id}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className='grid items-center grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className="mb-2">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Title *
                                    </label>
                                    <ReusableSelect
                                        name="title"
                                        id="title"
                                        options={titleOptions}
                                        placeholder='Select Title'
                                        className='w-full'
                                        value={values.title}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleChange(e)
                                            }
                                        }}
                                        required
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor="fname" className="block text-sm font-medium text-gray-700">
                                        First Name *
                                    </label>
                                    <ReusableInput 
                                        name="fname" 
                                        id="fname" 
                                        className="w-full mt-1" 
                                        value={values.fname}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor="mname" className="block text-sm font-medium text-gray-700">
                                        Middle Name
                                    </label>
                                    <ReusableInput 
                                        name="mname" 
                                        id="mname" 
                                        className="w-full mt-1" 
                                        value={values.mname}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor="lname" className="block text-sm font-medium text-gray-700">
                                        Last Name *
                                    </label>
                                    <ReusableInput 
                                        name="lname" 
                                        id="lname" 
                                        className="w-full mt-1" 
                                        value={values.lname}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                                        Sex *
                                    </label>
                                    <ReusableSelect
                                        name="sex"
                                        id="sex"
                                        options={sexOptions}
                                        placeholder='Select Sex'
                                        className='w-full'
                                        value={values.sex}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleChange(e)
                                            }
                                        }}
                                        required
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                                        Year *
                                    </label>
                                    <ReusableSelect
                                        name="year"
                                        id="year"
                                        options={yearOptions}
                                        placeholder='Select Year'
                                        className='w-full'
                                        value={values.year}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleChange(e)
                                            }
                                        }}
                                        required
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>
                                    <ReusableInput 
                                        name="phone"
                                        id="phone" 
                                        type="tel"
                                        className="w-full mt-1" 
                                        value={values.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <ReusableInput 
                                        name="email" 
                                        id="email" 
                                        type="email"
                                        className="w-full mt-1" 
                                        value={values.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </ModalForm>

            {/* View Staff Modal */}
            <ModalForm
                isOpen={modalState.viewStaff}
                onClose={() => {
                    setModalState(prev => ({...prev, viewStaff: false}))
                }}
                title="Teacher Details"
                icon={FiEye}
                isForm={false}
                submitText='Close'
                closeOnOutsideClick={false}
                size="lg"
                footerButtons={[
                    <Button 
                        key="edit"
                        variant="primary"
                        onClick={() => {
                            setModalState(prev => ({
                                ...prev,
                                viewStaff: false,
                                editStaff: true
                            }))
                        }}
                        className="mr-2"
                    >
                        <FiEdit2 className="mr-1" /> Edit
                    </Button>,
                    <Button 
                        key="delete"
                        variant="danger"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? <FaSpinner className="animate-spin mr-1" /> : <FiTrash2 className="mr-1" />}
                        Delete
                    </Button>
                ]}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <FaSpinner className="animate-spin text-2xl text-blue-500" />
                    </div>
                ) : staffData ? (
                    <div className="bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1 space-y-1">
                            <div className="mt-1 bg-white p-3 rounded shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Staff Number</label>
                                <p className="text-gray-800 font-medium">{staffData.id}</p>
                            </div>
                            
                            <div className="bg-white p-3 rounded shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                <p className="text-gray-800 font-medium">{staffData.title}</p>
                            </div>
                            
                            <div className="bg-white p-3 rounded shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
                                <p className="text-gray-800 font-medium">{staffData.fname}</p>
                            </div>
                            
                            <div className="bg-white p-3 rounded shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Middle Name</label>
                                <p className="text-gray-800 font-medium">{staffData.mname || '-'}</p>
                            </div>
                            
                            <div className="bg-white p-3 rounded shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                                <p className="text-gray-800 font-medium">{staffData.lname}</p>
                            </div>
                            
                            <div className="bg-white p-3 rounded shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Sex</label>
                                <p className="text-gray-800 font-medium">
                                    {staffData.sex === 'F' ? 'Female' : 'Male'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1 space-y-1">
                            <div className="bg-white p-3 rounded shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                                <p className="text-gray-800 font-medium">{staffData.year || '-'}</p>
                            </div>
                            
                            <div className="bg-white p-3 rounded shadow-sm">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                                <p className="text-gray-800 font-medium">{staffData.phone ? `+${staffData.phone}` : '-'}</p>
                            </div>
                            
                            <div className="bg-white p-3 rounded shadow-sm md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                <p className="text-gray-800 font-medium">{staffData.email || '-'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No Teacher data available
                    </div>
                )}
            </ModalForm>

            {/* Edit Staff Modal */}
            <ModalForm
                isOpen={modalState.editStaff}
                onClose={() => {
                    setError('')
                    setModalState(prev => ({ ...prev, editStaff: false }))
                }}
                title="Edit Teacher"
                icon={FiEdit2}
                initialValues={editFormData || initialFormData}
                onSubmit={handleUpdate}
                closeOnOutsideClick={false}
                size="lg"
                submitText={isSubmitting ? <FaSpinner className="animate-spin" /> : 'Update'}
                submitDisabled={isSubmitting}
            >
                {({ values, handleChange }) => (
                    isLoading || !editFormData ? (
                        <div className="flex justify-center items-center h-40">
                            <FaSpinner className="animate-spin text-2xl text-blue-500" />
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div>
                                {/* Staff Number */}
                                <div className="mb-2">
                                    <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                                        Staff Number *
                                    </label>
                                    <ReusableInput
                                        name="id"
                                        id="id"
                                        className="w-full mt-1"
                                        value={values.id}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Grid of Fields */}
                                <div className="grid items-center grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* Title */}
                                    <div className="mb-2">
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                            Title *
                                        </label>
                                        <ReusableSelect
                                            name="title"
                                            id="title"
                                            options={titleOptions}
                                            placeholder="Select Title"
                                            className="w-full"
                                            value={values.title}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleChange(e)
                                                }
                                            }}
                                            required
                                        />
                                    </div>

                                    {/* First Name */}
                                    <div className="mb-2">
                                        <label htmlFor="fname" className="block text-sm font-medium text-gray-700">
                                            First Name *
                                        </label>
                                        <ReusableInput
                                            name="fname"
                                            id="fname"
                                            className="w-full mt-1"
                                            value={values.fname}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Middle Name */}
                                    <div className="mb-2">
                                        <label htmlFor="mname" className="block text-sm font-medium text-gray-700">
                                            Middle Name
                                        </label>
                                        <ReusableInput
                                            name="mname"
                                            id="mname"
                                            className="w-full mt-1"
                                            value={values.mname}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div className="mb-2">
                                        <label htmlFor="lname" className="block text-sm font-medium text-gray-700">
                                            Last Name *
                                        </label>
                                        <ReusableInput
                                            name="lname"
                                            id="lname"
                                            className="w-full mt-1"
                                            value={values.lname}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Sex */}
                                    <div className="mb-2">
                                        <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                                            Sex *
                                        </label>
                                        <ReusableSelect
                                            name="sex"
                                            id="sex"
                                            options={sexOptions}
                                            placeholder="Select Sex"
                                            className="w-full"
                                            value={values.sex}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleChange(e)
                                                }
                                            }}
                                            required
                                        />
                                    </div>

                                    {/* Year */}
                                    <div className="mb-2">
                                        <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                                            Year *
                                        </label>
                                        <ReusableSelect
                                            name="year"
                                            id="year"
                                            options={yearOptions}
                                            placeholder="Select Year"
                                            className="w-full"
                                            value={values.year}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleChange(e)
                                                }
                                            }}
                                            required
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="mb-2">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                            Phone
                                        </label>
                                        <ReusableInput
                                            name="phone"
                                            id="phone"
                                            type="tel"
                                            className="w-full mt-1"
                                            value={values.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="mb-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <ReusableInput
                                            name="email"
                                            id="email"
                                            type="email"
                                            className="w-full mt-1"
                                            value={values.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                </div>
                            </div>
                        </>
                    )
                )}
            </ModalForm>
        </>
    )
}

export default StaffCRUD