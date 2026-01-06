import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

// FilterBar Component
const FilterBar = ({ filters, onFilterChange }) => {
  const contentTypes = [
    "All",
    "Lesson",
    "Quiz",
    "Video",
    "Article",
    "Exercise",
  ];
  const topics = [
    "All",
    "Math",
    "Science",
    "History",
    "Language",
    "Technology",
  ];

  return (
    <div className="bg-white p-4 shadow rounded-xl mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content Type
          </label>
          <select
            value={filters.contentType}
            onChange={(e) => onFilterChange("contentType", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {contentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <select
            value={filters.topic}
            onChange={(e) => onFilterChange("topic", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

// SatisfactionChart Component
const SatisfactionChart = ({ data, filters }) => {
  const chartData = useMemo(() => {
    // Filter and aggregate data based on current filters
    const filteredData = data.filter((item) => {
      const matchesType =
        filters.contentType === "All" ||
        item.contentType === filters.contentType;
      const matchesTopic =
        filters.topic === "All" || item.topic === filters.topic;
      const itemDate = new Date(item.date);
      const startDate = filters.startDate
        ? new Date(filters.startDate)
        : new Date(0);
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

      return (
        matchesType &&
        matchesTopic &&
        itemDate >= startDate &&
        itemDate <= endDate
      );
    });

    // Group by date and calculate average rating
    const grouped = filteredData.reduce((acc, item) => {
      const date = item.date.split("T")[0];
      if (!acc[date]) {
        acc[date] = { total: 0, count: 0 };
      }
      acc[date].total += item.rating;
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, { total, count }]) => ({
        date,
        averageRating: total / count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data, filters]);

  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-4">
        📈 Average Rating Over Time
      </h2>
      <div className="h-64 flex items-end space-x-2">
        {chartData.length > 0 ? (
          chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="bg-blue-500 w-full rounded-t hover:bg-blue-600 transition-colors"
                style={{ height: `${(item.averageRating / 5) * 100}%` }}
                title={`${item.date}: ${item.averageRating.toFixed(2)}`}
              />
              <span className="text-xs mt-1 text-gray-500">
                {new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          ))
        ) : (
          <div className="w-full text-center text-gray-500">
            No data available for selected filters
          </div>
        )}
      </div>
    </div>
  );
};

// ContentList Component (Reusable for both top and low rated)
const ContentList = ({ title, content, type = "top" }) => {
  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-4">
        {type === "top" ? "🏆 " : "⚠️ "}
        {title}
      </h2>
      <div className="space-y-3">
        {content.length > 0 ? (
          content.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  {item.contentType} • {item.topic} •{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`text-lg font-bold ${getRatingColor(item.rating)}`}
              >
                {item.rating.toFixed(1)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">No content found</div>
        )}
      </div>
    </div>
  );
};

// ExportButton Component
const ExportButton = ({ data, filters }) => {
  const exportCSV = () => {
    const headers = [
      "Title",
      "Content Type",
      "Topic",
      "Rating",
      "Date",
      "Feedback",
    ];
    const csvContent = [
      headers.join(","),
      ...data.map((item) =>
        [
          `"${item.title}"`,
          item.contentType,
          item.topic,
          item.rating,
          item.date,
          `"${item.feedback || "No feedback"}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // In a real implementation, you would use a library like jsPDF or html2pdf
    alert(
      "PDF export would be implemented with a library like jsPDF. Data is ready for export."
    );
    console.log("PDF Export Data:", { data, filters });
  };

  return (
    <div className="flex space-x-3">
      <button
        onClick={exportCSV}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
      >
        📊 Export CSV
      </button>
      <button
        onClick={exportPDF}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
      >
        📄 Export PDF
      </button>
    </div>
  );
};

// Main Analytics Component
const Analytics = () => {
  const [metrics, setMetrics] = useState({
    learners: 0,
    satisfaction: 0,
    generated: 0,
  });

  const [feedbackData, setFeedbackData] = useState([]);
  const [contentData, setContentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    contentType: "All",
    topic: "All",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, feedbackRes, contentRes] = await Promise.all([
          axios.get("http://localhost:8000/analytics"),
          axios.get("http://localhost:8000/satisfaction_feedback"),
          axios.get("http://localhost:8000/generated_content"),
        ]);

        setMetrics(analyticsRes.data);
        setFeedbackData(feedbackRes.data);
        setContentData(contentRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Combine feedback with content data
  const combinedData = useMemo(() => {
    return feedbackData
      .map((feedback) => {
        const content = contentData.find((c) => c.id === feedback.contentId);
        return {
          ...feedback,
          ...content,
          id: `${feedback.id}-${content?.id || "unknown"}`,
        };
      })
      .filter((item) => item.title); // Only include items with valid content
  }, [feedbackData, contentData]);

  // Get top and low rated content
  const { topRated, lowRated } = useMemo(() => {
    const sorted = [...combinedData].sort((a, b) => b.rating - a.rating);
    return {
      topRated: sorted.slice(0, 5), // Top 5
      lowRated: sorted.slice(-5).reverse(), // Bottom 5
    };
  }, [combinedData]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📊 Learning Analytics</h1>
          <ExportButton data={combinedData} filters={filters} />
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 shadow rounded-xl text-center">
            <h2 className="text-lg font-semibold">Learners</h2>
            <p className="text-3xl mt-2">{metrics.learners}</p>
          </div>
          <div className="bg-white p-6 shadow rounded-xl text-center">
            <h2 className="text-lg font-semibold">Satisfaction (%)</h2>
            <p className="text-3xl mt-2">{metrics.satisfaction}</p>
          </div>
          <div className="bg-white p-6 shadow rounded-xl text-center">
            <h2 className="text-lg font-semibold">Content Generated</h2>
            <p className="text-3xl mt-2">{metrics.generated}</p>
          </div>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {/* Charts and Content Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SatisfactionChart data={combinedData} filters={filters} />
          <div className="space-y-6">
            <ContentList
              title="Top Rated Content"
              content={topRated}
              type="top"
            />
            <ContentList
              title="Content Needing Improvement"
              content={lowRated}
              type="low"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
