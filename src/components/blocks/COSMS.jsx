import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import { TbCalendarCog, TbReport } from "react-icons/tb";
import { FaSpinner } from "react-icons/fa";
import { MdOutlinePreview } from "react-icons/md";
import { AiOutlineClear } from "react-icons/ai";
import { TbSend } from "react-icons/tb";
import { formOptions, yearOptions, termOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import ReusableInput from "../ui/ReusableInput";
import Dropdown from "../Dropdown";
import Button from "../ui/raw/Button";
import api from "../../hooks/api";
import ReusableTextarea from "../ReusableTextarea";
import TimeInput from "../TimeInput";
import TableComponent from "../TableComponent";

const COSMS = () => {
  const { showToast } = useToast();
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [smsLogs, setSmsLogs] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [openingDate, setOpeningDate] = useState("");
  const [signoutTime, setSignoutTime] = useState("08:00");
  const [reportByTime, setReportByTime] = useState("15:00");
  const [extraInfo, setExtraInfo] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    const fetchSchoolName = async () => {
      try {
        const response = await api.get("particular/getparticulars");
        setSchoolName(response.data.schoolname || "");
      } catch (error) {
        console.error("Error fetching school name:", error);
      }
    };
    fetchSchoolName();
  }, []);

  const eventOptions = [
    { value: "opening", label: "Opening" },
    { value: "closing", label: "Closing" },
  ];

  const eventTypeOptions = {
    opening: [
      { value: "term_begin", label: "Term Begin" },
      { value: "term_continue", label: "Term Continuation" },
    ],
    closing: [
      { value: "term_end", label: "Term End" },
      { value: "term_break", label: "Term Break" },
    ],
  };

  const columns = [
    { name: "REG NO.", uid: "student_id", sortable: true },
    { name: "PHONE", uid: "phone", sortable: true },
    { name: "STATUS", uid: "response_code", sortable: true },
    { name: "DESCRIPTION", uid: "description", sortable: true },
    {
      name: "TIMESTAMP",
      uid: "timestamp",
      sortable: true,
      render: (item) => formatTimestamp(item.timestamp),
    },
  ];

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const resetBelow = (field) => {
    if (field === "year") {
      setSelectedForm("");
      setSelectedTerm("");
      setSmsLogs([]);
      setSelectedEvent("");
      setSelectedEventType("");
      handleClearForm();
    }
    if (field === "form") {
      setSmsLogs([]);
      setSelectedEvent("");
      setSelectedEventType("");
      handleClearForm();
    }
    if (field === "term") {
      setSmsLogs([]);
      setSelectedEvent("");
      setSelectedEventType("");
      handleClearForm();
    }
  };

  const fetchSmsLogs = async () => {
    if (!selectedYear || !selectedForm || !selectedTerm) return;

    try {
      setLoading(true);
      const response = await api.post("/sms/getsmslogs", {
        year: selectedYear,
        form: selectedForm,
        term: selectedTerm,
      });
      setSmsLogs(response.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setSmsLogs([]);
      } else {
        showToast("Failed to fetch SMS logs", "error", { duration: 2000 });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmsLogs();
  }, [selectedYear, selectedForm, selectedTerm]);

  const handleEventChange = (value) => {
    setSelectedEvent(value);
    setSelectedEventType("");
    handleClearForm();
  };

  const handleClearForm = () => {
    setClosingDate("");
    setOpeningDate("");
    setSignoutTime("08:00");
    setReportByTime("15:00");
    setExtraInfo("");
    setPreviewMessage("");
  };

  const generatePreviewMessage = () => {
    const fname = "Joe";
    const lname = "Doe";
    const event_type = selectedEventType
      ? eventTypeOptions[selectedEvent].find(
          (opt) => opt.value === selectedEventType
        )?.label
      : "";
    const details = extraInfo || "";

    if (selectedEvent === "closing") {
      return `${schoolName}\n\nDear Parent/Guardian, we wish to inform you we will officially close for the ${event_type} of term ${selectedTerm} on ${closingDate} and your child ${fname} ${lname} signs out at ${signoutTime}. We will resume on ${openingDate}. ${details} We appreciate your continued support and wish you a restful break. For any inquiries, please contact the school administration.`;
    } else if (selectedEvent === "opening") {
      return `${schoolName}\n\nDear Parent/Guardian, we wish to inform you we will officially open for the ${event_type} of term ${selectedTerm} on ${openingDate} and your child ${fname} ${lname} is required to sign-in before ${reportByTime}. ${details} For any inquiries, please contact the school administration.`;
    }
    return "";
  };

  useEffect(() => {
    setPreviewMessage(generatePreviewMessage());
  }, [
    selectedEvent,
    selectedEventType,
    closingDate,
    openingDate,
    signoutTime,
    reportByTime,
    extraInfo,
    selectedTerm,
    schoolName,
  ]);

  const handleSendSMS = async () => {
    if (!isSendEnabled()) return;

    try {
      setSending(true);

      const eventData = {
        events_data: {
          event: selectedEvent,
          event_type: selectedEventType,
          message: previewMessage,
          ...(selectedEvent === "closing" && {
            closing_date: closingDate,
            signout_time: signoutTime,
          }),
          opening_date: openingDate,
          report_time: reportByTime,
          details: extraInfo || null,
        },
        year: selectedYear,
        term: selectedTerm,
        forms: Array.isArray(selectedForm) ? selectedForm : [selectedForm],
      };

      await api.post("/sms/sendcosms", eventData);

      showToast("SMS sent successfully!", "success", { duration: 3000 });
      fetchSmsLogs();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to send SMS",
        "error",
        { duration: 3000 }
      );
    } finally {
      setSending(false);
    }
  };

  const showClosingElements =
    selectedEventType === "term_end" || selectedEventType === "term_break";

  const isSendEnabled = () => {
    if (selectedEvent === "opening") {
      return openingDate && reportByTime && selectedEventType;
    } else if (selectedEvent === "closing") {
      return (
        closingDate &&
        signoutTime &&
        openingDate &&
        reportByTime &&
        selectedEventType
      );
    }
    return false;
  };

  return (
    <div className="p-0">
      <div className="my-2 w-full flex flex-col lg:flex-row gap-2">
        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit mb-2 bg-blue-100 dark:bg-gray-800"
            tag="Term Configuration"
            icon={TbCalendarCog}
            collapsible={true}
          >
            <div className="flex flex-col space-y-4 pb-4">
              <div className="w-full flex flex-col">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Year
                </label>
                <Dropdown
                  id="year"
                  placeholder="Select Year"
                  options={yearOptions}
                  value={selectedYear}
                  onChange={(value) => {
                    resetBelow("year");
                    setSelectedYear(value);
                  }}
                />
              </div>
              <div className="w-full flex flex-col">
                <label
                  htmlFor="term"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Term
                </label>
                <Dropdown
                  id="term"
                  placeholder="Select Term"
                  options={termOptions}
                  value={selectedTerm}
                  onChange={(value) => {
                    resetBelow("term");
                    setSelectedTerm(value);
                  }}
                  disabled={!selectedYear}
                />
              </div>
              <div className="w-full flex flex-col">
                <label
                  htmlFor="form"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Form
                </label>
                <Dropdown
                  id="form"
                  placeholder="Select Form"
                  options={formOptions}
                  value={selectedForm}
                  onChange={(value) => {
                    resetBelow("form");
                    setSelectedForm(value);
                  }}
                  disabled={!selectedYear}
                  multiple={true}
                />
              </div>
            </div>
          </ReusableDiv>
        </div>

        <div className="w-full lg:w-3/4 flex flex-1 flex-col gap-2">
          <div className="flex flex-1 flex-col lg:flex-row gap-2">
            <ReusableDiv
              className="ml-0 mr-0 flex-1 ring-1 mb-2 bg-blue-100 dark:bg-gray-800"
              tag="Term Events"
              icon={TbReport}
              collapsible={true}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Event
                    </label>
                    <Dropdown
                      options={eventOptions}
                      value={selectedEvent}
                      onChange={handleEventChange}
                      placeholder="Select Event"
                      disabled={!selectedForm}
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Event Type
                    </label>
                    <Dropdown
                      options={
                        selectedEvent ? eventTypeOptions[selectedEvent] : []
                      }
                      value={selectedEventType}
                      onChange={setSelectedEventType}
                      placeholder="Select Event Type"
                      disabled={!selectedEvent}
                    />
                  </div>
                </div>

                {selectedEventType && (
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-4">
                      {showClosingElements && (
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-1/2">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Closing Date
                            </label>
                            <ReusableInput
                              type="date"
                              value={closingDate}
                              onChange={(e) => setClosingDate(e.target.value)}
                            />
                          </div>
                          <div className="w-full md:w-1/2">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Signout Time
                            </label>
                            <TimeInput
                              value={signoutTime}
                              onChange={setSignoutTime}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2">
                          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Opening Date
                          </label>
                          <ReusableInput
                            type="date"
                            value={openingDate}
                            onChange={(e) => setOpeningDate(e.target.value)}
                          />
                        </div>
                        <div className="w-full md:w-1/2">
                          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Report by
                          </label>
                          <TimeInput
                            value={reportByTime}
                            onChange={setReportByTime}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Other information
                      </label>
                      <ReusableTextarea
                        value={extraInfo}
                        onChange={(e) => setExtraInfo(e.target.value)}
                        placeholder="Enter any additional information..."
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        icon={AiOutlineClear}
                        className="ring-1"
                        onClick={handleClearForm}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="primary"
                        icon={sending ? FaSpinner : TbSend}
                        onClick={handleSendSMS}
                        disabled={!isSendEnabled() || sending}
                        className={sending ? "animate-pulse" : ""}
                      >
                        {sending ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ReusableDiv>

            {previewMessage && (
              <ReusableDiv
                className="ml-0 mr-0 flex-1 ring-1 mb-2 bg-blue-100 dark:bg-gray-800"
                tag="Message Preview"
                icon={MdOutlinePreview}
                collapsible={true}
              >
                <div className="p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {previewMessage}
                  </pre>
                </div>
              </ReusableDiv>
            )}
          </div>
        </div>
      </div>
      <ReusableDiv className="ml-0 mr-0">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          </div>
        ) : (
          <TableComponent
            columns={columns}
            data={smsLogs}
            loading={loading}
            horizontalTableFlow={true}
            showSelectAllCheckbox={false}
            striped={true}
            borderColor="blue-200"
            rowColors={{
              default: "hover:bg-blue-50",
              selected: "bg-blue-100",
            }}
            buttons={{
              addButton: {
                show: false,
              },
            }}
          />
        )}
      </ReusableDiv>
    </div>
  );
};

export default COSMS;
