import React, { useEffect, useState } from "react";
import axios from "axios";

const Presentation = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("http://localhost:8000/presentations");
        setItems(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleExport = async (id, format) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/export/${id}?format=${format}`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `content_${id}.${format}`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Export failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">📖 Presentation & Export</h1>

      {items.length === 0 ? (
        <p>No content available for presentation.</p>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold text-lg mb-2">{item.title}</h2>
              <p className="text-gray-700 mb-4">{item.text}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport(item.id, "pdf")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport(item.id, "docx")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Export DOCX
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Presentation;
