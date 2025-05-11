import React from 'react'
import ReusableDiv from '../ReusableDiv'
import ReusableSelect from '../ReusableSelect'
import { FaUsersGear } from 'react-icons/fa6'

const StripControl = () => {
    const formOptions=[
        { value: '1', label: 'Form 1' },
        { value: '2', label: 'Form 2' },
        { value: '3', label: 'Form 3' },
        { value: '4', label: 'Form 4' },
    ]

    const termOptions=[
        { value: '1', label: 'Term 1' },
        { value: '2', label: 'Term 2' },
        { value: '3', label: 'Term 3' },
    ]


  return (
    <ReusableDiv className='ring-1 w-1/4 h-fit bg-blue-100' tag='Manage Students' icon={FaUsersGear}>
        <div className='flex flex-wrap pb-4'>
            <div className='w-full flex flex-col mb-2'>
                <label htmlFor="year">Year</label>
                <ReusableSelect id="year" placeholder="Select Year" className="flex-1"/>
            </div>
            <div className='w-full flex flex-col mb-2'>
                <label htmlFor="form">Form</label>
                <ReusableSelect id="form" placeholder="Select Form" options={formOptions} className="flex-1"/>
            </div>
            {/* <div className='w-full flex flex-col mb-2'>
                <label htmlFor="term">Term</label>
                <ReusableSelect id="term" placeholder="Select Term" options={termOptions} className="flex-1"/>
            </div> */}
        </div>
    </ReusableDiv>
  )
}

export default StripControl
