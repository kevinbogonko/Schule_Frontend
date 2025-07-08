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

export const promotionOptions = [
  { value: "all", label: "All Students" },
  { value: "exam", label: "Weighted exam grade" },
];

export const subjectsPerStream = [
    {
      id: 1,
      isCustom: false,
      singles: 3,
      doubles: 1,
      isMerged: false,
      mergedWith: [],
      isPaired: false,
      pair: [],
      mergeAlias: null,
      mergeSingles: 0,
      mergeDoubles: 0,
      code: 121,
      name: "MAT",
      streamId: [1, 2, 3, 4],
      teacherId: [1, 2, 1, 2],
      form: 1,
    },
    {
      id: 5,
      isCustom: false,
      singles: 5,
      doubles: 0,
      isMerged: false,
      mergedWith: [],
      isPaired: false,
      pair: [],
      mergeAlias: null,
      mergeSingles: 0,
      mergeDoubles: 0,
      code: 101,
      name: "ENG",
      streamId: [1, 2, 3, 4],
      teacherId: [3, 4, 3, 4],
      form: 1,
    },
    {
      id: 8,
      isCustom: false,
      singles: 3,
      doubles: 1,
      isMerged: false,
      mergedWith: [],
      isPaired: false,
      pair: [],
      mergeAlias: null,
      mergeSingles: 0,
      mergeDoubles: 0,
      code: 233,
      name: "CHE",
      streamId: [1, 2, 3, 4],
      teacherId: [5, 2, 6, 2],
      form: 1,
    },
    {
      id: 9,
      isCustom: false,
      singles: 4,
      doubles: 0,
      isMerged: false,
      mergedWith: [],
      isPaired: false,
      pair: [],
      mergeAlias: null,
      mergeSingles: 0,
      mergeDoubles: 0,
      code: 312,
      name: "GEO",
      streamId: [1, 2, 3, 4],
      teacherId: [7, 8, 7, 7],
      form: 1,
    },
    {
      id: 10,
      isCustom: false,
      singles: 4,
      doubles: 0,
      isMerged: false,
      mergedWith: [],
      isPaired: false,
      pair: [],
      mergeAlias: null,
      mergeSingles: 0,
      mergeDoubles: 0,
      code: 505,
      name: "CST",
      streamId: [1, 2, 3, 4],
      teacherId: [9, 9, 9, 9],
      form: 1,
    },
    {
      id: 11,
      isCustom: false,
      singles: 3,
      doubles: 1,
      isMerged: true,
      mergedWith: [12],
      isPaired: true,
      pair: [3, 4],
      mergeAlias: "SCI",
      mergeSingles: 3,
      mergeDoubles: 1,
      code: 231,
      name: "BIO",
      streamId: [3, 4],
      teacherId: [10, 6],
      form: 1,
    },
    {
      id: 12,
      isCustom: false,
      singles: 3,
      doubles: 1,
      isMerged: true,
      mergedWith: [11],
      isPaired: true,
      pair: [3, 4],
      mergeAlias: "SCI",
      mergeSingles: 3,
      mergeDoubles: 1,
      code: 232,
      name: "PHY",
      streamId: [3, 4],
      teacherId: [11, 2],
      form: 1,
    },
    {
      id: 13,
      isCustom: false,
      singles: 4,
      doubles: 0,
      isMerged: false,
      mergedWith: [],
      isPaired: false,
      pair: [],
      mergeAlias: null,
      mergeSingles: 0,
      mergeDoubles: 0,
      code: 311,
      name: "HIS",
      streamId: [1, 2, 3, 4],
      teacherId: [12, 12, 12, 12],
      form: 1,
    },
    {
      id: 14,
      isCustom: false,
      singles: 4,
      doubles: 0,
      isMerged: false,
      mergedWith: [],
      isPaired: false,
      pair: [],
      mergeAlias: null,
      mergeSingles: 0,
      mergeDoubles: 0,
      code: 313,
      name: "CRE",
      streamId: [1, 2, 3, 4],
      teacherId: [13, 13, 13, 13],
      form: 1,
    },
    {
      id: 15,
      isCustom: false,
      singles: 4,
      doubles: 0,
      isMerged: false,
      mergedWith: [],
      isPaired: false,
      pair: [],
      mergeAlias: null,
      mergeSingles: 0,
      mergeDoubles: 0,
      code: 565,
      name: "BST",
      streamId: [1, 2, 3, 4],
      teacherId: [14, 14, 14, 14],
      form: 1,
    },
  ];

  
   export const timeSlots = [
      { id: 1, label: "8:00 - 8:40", type: "lesson" },
      { id: 2, label: "8:40 - 9:20", type: "lesson" },
      { id: 3, label: "9:20 - 9:30", type: "break" },
      { id: 4, label: "9:30 - 10:10", type: "lesson" },
      { id: 5, label: "10:10 - 10:50", type: "lesson" },
      { id: 6, label: "10:50 - 11:20", type: "break" },
      { id: 7, label: "11:20 - 12:00", type: "lesson" },
      { id: 8, label: "12:00 - 12:40", type: "lesson" },
      { id: 9, label: "12:40 - 2:00", type: "lunch" },
      { id: 10, label: "2:00 - 2:40", type: "lesson" },
      { id: 11, label: "2:40 - 3:20", type: "lesson" },
      { id: 12, label: "3:20 - 4:00", type: "lesson" },
    ];
  
export const days = [
      { name: "Monday", hasGames: false },
      { name: "Tuesday", hasGames: false },
      { name: "Wednesday", hasGames: true },
      { name: "Thursday", hasGames: false },
      { name: "Friday", hasGames: true },
    ];
  
  export const streams = [
      { id: 1, name: "1W", form: 1 },
      { id: 2, name: "1N", form: 1 },
      { id: 3, name: "1E", form: 1 },
      { id: 4, name: "1S", form: 1 },
    ];
  
  
  export const subjectColors = [
      "bg-blue-400",
      "bg-red-400",
      "bg-green-400",
      "bg-yellow-400",
      "bg-purple-400",
      "bg-pink-400",
      "bg-indigo-400",
      "bg-teal-400",
      "bg-orange-400",
      "bg-cyan-400",
      "bg-lime-400",
      "bg-amber-400",
    ];
  
  
export const clusterOptions = [
      { value: "cluster1", label: "Cluster 1" },
      { value: "cluster2", label: "Cluster 2" },
      { value: "cluster3", label: "Cluster 3" },
    ];