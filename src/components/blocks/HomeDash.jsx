// src/components/HomeDash.jsx
import React from "react";
import { FaChalkboard, FaChalkboardTeacher } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { PiBookOpen, PiBriefcase, PiExamBold, PiGraduationCap, PiMedal, PiTrophy } from "react-icons/pi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const Card = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <div
          className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.replace(
            "text-",
            ""
          )}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ data }) => {
  // Prepare enrollment data for chart
  const enrollmentData = Object.entries(data.student_enrolment).map(
    ([year, counts]) => ({
      year,
      Male: counts.M,
      Female: counts.F,
    })
  );

  // Prepare subject average data for chart
  const subjectData = Object.entries(data.subject_average).map(
    ([subject, average]) => ({
      subject,
      average,
    })
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Students"
          value={data.total_students}
          icon={<FiUsers className="text-2xl" />}
          color="text-blue-500"
        />
        <Card
          title="Total Teachers"
          value={data.total_teachers}
          icon={<FaChalkboardTeacher className="text-2xl" />}
          color="text-green-500"
        />
        <Card
          title="Set Exams"
          value={data.total_exams}
          icon={<PiExamBold className="text-2xl" />}
          color="text-yellow-500"
        />
        <Card
          title="Total Classes"
          value={data.total_streams}
          icon={<FaChalkboard className="text-2xl" />}
          color="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Student Enrollment Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Male"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="Female"
                  stroke="#ec4899"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Subject Averages
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectData}
                layout="vertical"
                margin={{ left: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 12]} />
                <YAxis dataKey="subject" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="average" fill="#8884d8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherDashboard = ({ data }) => {
  // Prepare stream performance data for chart
  const streamData = Object.entries(data.stream_performance).flatMap(
    ([stream, subjects]) => {
      return Object.entries(subjects)
        .filter(([key]) => key !== "AVG")
        .map(([subject, score]) => ({
          stream: `Stream ${stream}`,
          subject,
          score,
        }));
    }
  );

  // Prepare top/weak students data
  const examTables = Object.entries(data.top_weak).map(([exam, classes]) => {
    const examName = exam
      .replace(/_/g, " ")
      .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());

    return (
      <div key={exam} className="mb-8">
        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
          {examName}
        </h4>
        {Object.entries(classes).map(([classId, students]) => (
          <div key={classId} className="mb-6">
            <h5 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Class {classId}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="bg-green-100 dark:bg-green-900 px-4 py-2 font-medium text-green-800 dark:text-green-200">
                  Top Students
                </div>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        S/N
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Reg ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Mark
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {students.top.map((student, idx) => (
                      <tr key={student.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          {student.id}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          {student.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                          {student[classId]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="bg-red-100 dark:bg-red-900 px-4 py-2 font-medium text-red-800 dark:text-red-200">
                  Weak Students
                </div>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        S/N
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Reg ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Mark
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {students.weak.map((student, idx) => (
                      <tr key={student.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          {student.id}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          {student.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                          {student[classId]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Subjects"
          value={data.total_subjects}
          icon={<PiBookOpen className="text-2xl" />}
          color="text-blue-500"
        />
        <Card
          title="Total Classes"
          value={data.total_classes}
          icon={<FaChalkboard className="text-2xl" />}
          color="text-green-500"
        />
        <Card
          title="Workload"
          value={`${data.workload}%`}
          icon={<PiBriefcase className="text-2xl" />}
          color="text-yellow-500"
        />
        <Card
          title="Set Exams"
          value={data.total_exams}
          icon={<PiExamBold className="text-2xl" />}
          color="text-purple-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Stream Performance
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={streamData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stream" />
              <YAxis domain={[0, 12]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="score"
                name="Score"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Student Performance Analysis
        </h3>
        {examTables}
      </div>
    </div>
  );
};

const StudentDashboard = ({ data }) => {
  // Prepare performance trend data for chart
  const performanceData = Object.entries(data.performance_trend).map(
    ([exam, score]) => {
      const examName = exam
        .replace(/_/g, " ")
        .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
      return { exam: examName, score };
    }
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Exams Attempted"
          value={data.total_exams}
          icon={<PiExamBold className="text-2xl" />}
          color="text-blue-500"
        />
        <Card
          title="Recent Grade"
          value={data.recent_grade}
          icon={<PiGraduationCap className="text-2xl" />}
          color="text-green-500"
        />
        <Card
          title="Stream Position"
          value={`#${data.stream_position}`}
          icon={<PiMedal className="text-2xl" />}
          color="text-yellow-500"
        />
        <Card
          title="Overall Position"
          value={`#${data.overal_position}`}
          icon={<PiTrophy className="text-2xl" />}
          color="text-purple-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Performance Trend
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exam" />
              <YAxis domain={[0, 12]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Latest Results
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(data.latest_results.subjects).map(
                ([subject, result]) => {
                  const [score, grade] = result.split(" ");
                  return (
                    <tr key={subject}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                        {subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        {score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        {grade}
                      </td>
                    </tr>
                  );
                }
              )}
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                  Total Marks
                </td>
                <td
                  colSpan="2"
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
                >
                  {data.latest_results.marks}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                  Points
                </td>
                <td
                  colSpan="2"
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
                >
                  {data.latest_results.points}
                </td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                  Grade
                </td>
                <td
                  colSpan="2"
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
                >
                  {data.latest_results.grade}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                  Stream Rank
                </td>
                <td
                  colSpan="2"
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
                >
                  #{data.latest_results.stream_rank}
                </td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                  Overall Rank
                </td>
                <td
                  colSpan="2"
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
                >
                  #{data.latest_results.overal_rank}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const HomeDash = ({ role, data }) => {
  if (!data) return <div>Loading dashboard data...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Dashboard Overview
      </h1>

      {role === "admin" && <AdminDashboard data={data} />}
      {role === "teacher" && <TeacherDashboard data={data} />}
      {role === "student" && <StudentDashboard data={data} />}
    </div>
  );
};

export default HomeDash;
