import { useEffect, useState } from "react";
import api from "../../../hooks/api";
import ReusableDiv from "../../ui/ReusableDiv";
import RadioGroup from "../../ui/RadioGroup";
import Button from "../../ui/Button";
import {FiSettings} from "react-icons/fi";
import { useToast } from "../../ui/Toast";
import { eventEmitter } from "../../../utils/eventEmitter";

const SystemLevel = () => {
  const { showToast } = useToast();

  // 1. Radio options (fixed order)
  const levelOptions = [
    { label: "Secondary (8-4-4)", value: 1 },
    { label: "Pre-Primary (CBC)", value: 2 },
    { label: "Primary (CBC)", value: 3 },
    { label: "Junior Secondary (CBC)", value: 4 },
    { label: "Senior Secondary (CBC)", value: 5 },
  ];

  // 2. Selected radio value (1–5)
  const [selectedLevel, setSelectedLevel] = useState(null);

  // 3. Loading & saving states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 4. GET /system/getlevels on mount
  useEffect(() => {
    const fetchLevels = async () => {
      setLoading(true);
      try {
        const response = await api.get("/system/getlevels");

        /**
         * Expected response:
         * [{ id: 1, status: 0 }, { id: 2, status: 1 }, ...]
         */

        const levels = Array.isArray(response?.data) ? response.data : [];

        const activeLevel = levels.find((item) => Number(item.status) === 1);

        if (activeLevel) {
          setSelectedLevel(Number(activeLevel.id));
        }
      } catch (error) {
        console.error("Failed to load system levels", error);
        showToast(
          error.response?.data?.message || "Failed to fetch system levels",
          "error",
          { duration: 3000, position: "top-right" }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [showToast]);

  // 5. Handle radio change
  const handleLevelChange = (e) => {
    setSelectedLevel(Number(e.target.value));
  };

  // 6. Handle SAVE button click
  const handleSave = async () => {
    setSaving(true);

    const payload = {};

    levelOptions.forEach((option) => {
      payload[option.value] = selectedLevel === option.value ? 1 : 0;
    });

    try {
      await api.post("/system/updatelevels", payload);

      const newLevelName = levelOptions.find(opt => opt.value === selectedLevel)?.label;
      eventEmitter.emit('systemLevelUpdated', newLevelName)

      showToast("System level updated successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Failed to update system levels", error);
      showToast(
        error.response?.data?.message || "Failed to update system levels",
        "error",
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setSaving(false);
    }
  };

  // 7. Render UI
  return (
    <ReusableDiv
      className="ml-0 mr-0 mb-2 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
      tag="System Levels"
      icon={FiSettings}
    >
      <RadioGroup
        name="systemLevel"
        label="Select Active System Level"
        options={levelOptions}
        value={selectedLevel}
        onChange={handleLevelChange}
        orientation="vertical"
        disabled={loading}
        required
      />

      <div className="mt-4">
        <Button onClick={handleSave} disabled={saving || !selectedLevel}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </ReusableDiv>
  );
};

export default SystemLevel;
