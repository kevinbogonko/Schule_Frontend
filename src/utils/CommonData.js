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

export const eventOptions = [
    { value: "opening", label: "Opening" },
    { value: "closing", label: "Closing" },
  ];

export const eventTypeOptions = {
    opening: [
      { value: "term_begin", label: "Term Begin" },
      { value: "term_continue", label: "Term Continuation" },
    ],
    closing: [
      { value: "term_end", label: "Term End" },
      { value: "term_break", label: "Term Break" },
    ],
  };

// export const formOptions=[
//     { value: '1', label: 'Form 1' },
//     { value: '2', label: 'Form 2' },
//     { value: '3', label: 'Form 3' },
//     { value: '4', label: 'Form 4' },
// ]

export const formOptions = [
  {
    label: "Pre-Primary (CBC)",
    options: [
      { value: 0, label: "PP1", system: "CBC" },
      { value: 0, label: "PP2", system: "CBC" }, // same numeric level, different stage
    ],
  },
  {
    label: "Primary (CBC)",
    options: [
      { value: 1, label: "Grade 1", system: "CBC" },
      { value: 2, label: "Grade 2", system: "CBC" },
      { value: 3, label: "Grade 3", system: "CBC" },
      { value: 4, label: "Grade 4", system: "CBC" },
      { value: 5, label: "Grade 5", system: "CBC" },
      { value: 6, label: "Grade 6", system: "CBC" },
    ],
  },
  {
    label: "Junior Secondary (CBC)",
    options: [
      { value: 7, label: "Grade 7", system: "CBC" },
      { value: 8, label: "Grade 8", system: "CBC" },
      { value: 9, label: "Grade 9", system: "CBC" },
    ],
  },
  {
    label: "Senior Secondary (CBC)",
    options: [
      { value: 10, label: "Grade 10", system: "CBC" },
      { value: 11, label: "Grade 11", system: "CBC" },
      { value: 12, label: "Grade 12", system: "CBC" },
    ],
  },
  {
    label: "Secondary (8-4-4)",
    options: [
      { value: 19, label: "Form 1", system: "8-4-4" },
      { value: 20, label: "Form 2", system: "8-4-4" },
      { value: 21, label: "Form 3", system: "8-4-4" },
      { value: 22, label: "Form 4", system: "8-4-4" },
    ],
  },
];

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

// Grading Scheme Table Columns
export const getColumns = (syst_level) => {
  const commonColumns = [
    { name: "code", uid: "id", sortable: true },
    { name: `${syst_level == "Secondary (8-4-4)" ? "SUBJECT" : "LEARNING AREA"}`, uid: "subject", sortable: true },
  ];

  const secondary844Columns = [
    {
      name: "E",
      uid: "E",
      sortable: true,
      render: (item) => `${item.E.min}-${item.E.max}`,
    },
    {
      name: "D-",
      uid: "D-",
      sortable: true,
      render: (item) => `${item["D-"].min}-${item["D-"].max}`,
    },
    {
      name: "D",
      uid: "D",
      sortable: true,
      render: (item) => `${item.D.min}-${item.D.max}`,
    },
    {
      name: "D+",
      uid: "D+",
      sortable: true,
      render: (item) => `${item["D+"].min}-${item["D+"].max}`,
    },
    {
      name: "C-",
      uid: "C-",
      sortable: true,
      render: (item) => `${item["C-"].min}-${item["C-"].max}`,
    },
    {
      name: "C",
      uid: "C",
      sortable: true,
      render: (item) => `${item.C.min}-${item.C.max}`,
    },
    {
      name: "C+",
      uid: "C+",
      sortable: true,
      render: (item) => `${item["C+"].min}-${item["C+"].max}`,
    },
    {
      name: "B-",
      uid: "B-",
      sortable: true,
      render: (item) => `${item["B-"].min}-${item["B-"].max}`,
    },
    {
      name: "B",
      uid: "B",
      sortable: true,
      render: (item) => `${item.B.min}-${item.B.max}`,
    },
    {
      name: "B+",
      uid: "B+",
      sortable: true,
      render: (item) => `${item["B+"].min}-${item["B+"].max}`,
    },
    {
      name: "A-",
      uid: "A-",
      sortable: true,
      render: (item) => `${item["A-"].min}-${item["A-"].max}`,
    },
    {
      name: "A",
      uid: "A",
      sortable: true,
      render: (item) => `${item.A.min}-${item.A.max}`,
    },
  ];

  const non844CBCColumns = [
    {
      name: "BE",
      uid: "BE",
      sortable: true,
      render: (item) => `${item.BE.min}-${item.BE.max}`,
    },
    {
      name: "AE",
      uid: "AE",
      sortable: true,
      render: (item) => `${item.AE.min}-${item.AE.max}`,
    },
    {
      name: "ME",
      uid: "ME",
      sortable: true,
      render: (item) => `${item.ME.min}-${item.ME.max}`,
    },
    {
      name: "EE",
      uid: "EE",
      sortable: true,
      render: (item) => `${item.EE.min}-${item.EE.max}`,
    },
  ];

  const actionColumn = { name: "ACTIONS", uid: "actions" };

  // Final dynamic return
  return syst_level === "Secondary (8-4-4)"
    ? [...commonColumns, ...secondary844Columns, actionColumn]
    : [...commonColumns, ...non844CBCColumns, actionColumn];
};


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
      singles: 3,
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

export const timeSlotClusterOptions = [
    { value: "MR", label: "Morning Remedial (MR)" },
    { value: "D", label: "Standard Day (D)" },
    { value: "ER", label: "Evening Remedial (ER)" },
  ];