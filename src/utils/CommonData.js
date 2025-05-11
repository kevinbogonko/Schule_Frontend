export const weekDaysOptions = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

export const titleOptions = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
]

export const sexOptions = [
  { value: 'F', label: 'Female' },
  { value: 'M', label: 'Male' },
]

export const formOptions=[
    { value: '1', label: 'Form 1' },
    { value: '2', label: 'Form 2' },
    { value: '3', label: 'Form 3' },
    { value: '4', label: 'Form 4' },
]

export const termOptions=[
    { value: '1', label: 'Term 1' },
    { value: '2', label: 'Term 2' },
    { value: '3', label: 'Term 3' },
]

export const remarkItemOptions=[
    { value: 'comments', label: 'Result Comments' },
    { value: 'principal_remark', label: 'Principal Remarks' },
    { value: 'classteacher_remark', label: 'Class Teacher Remarks' },
]

// Year Utility
const currentYear = new Date().getFullYear();
export const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString()
}));

// Paper Options Utility
export const paperOptions = [
  { value: 1, label: "Single Paper" },
  { value: 2, label: "2 Papers" },
  { value: 3, label: "3 Papers" }
]

export const formulaOptions = [
  { value: 'threePaperAvg', label: 'Average of Three Papers' },
  { value: 'threePaperAvgAdd', label: 'Weighted: (P1+P2) *160 + P3' },
  { value: 'threePaperAddAgr', label: 'Weighted: (P1+P2+P3) / 2' }
]
