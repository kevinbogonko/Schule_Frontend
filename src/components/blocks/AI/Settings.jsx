import React, { useEffect, useState } from "react";
import axios from "axios";

const Settings = () => {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("openai_api_key") || ""
  );

  const saveSettings = () => {
    localStorage.setItem("openai_api_key", apiKey);
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">⚙️ Settings</h1>

      <div className="bg-white shadow rounded-xl p-6 max-w-lg">
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">OpenAI API Key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-2 w-full p-2 border rounded-lg"
            placeholder="sk-..."
          />
        </label>

        <button
          onClick={saveSettings}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
