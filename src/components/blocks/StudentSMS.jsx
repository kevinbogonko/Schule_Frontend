import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import { TbCalendarCog, TbReport } from "react-icons/tb";
import { FaSpinner } from "react-icons/fa";
import { MdOutlinePreview } from "react-icons/md";
import { AiOutlineClear } from "react-icons/ai";
import { TbSend } from "react-icons/tb";
import { formOptions, yearOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import Dropdown from "../Dropdown";
import Button from "../ui/raw/Button";
import api from "../../hooks/api";
import ReusableTextarea from "../ReusableTextarea";
import TableComponent from "../TableComponent";
import Checkbox from "../Checkbox";
import CheckboxGroup from "../CheckboxGroup";

const StudentSMS = () => {
  const { showToast } = useToast();
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [smsLogs, setSmsLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [streamOptions, setStreamOptions] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [selectStreamChecked, setSelectStreamChecked] = useState(false);
  const [selectStudentChecked, setSelectStudentChecked] = useState(false);
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [selectedStudentList, setSelectedStudentList] = useState([]);

  useEffect(() => {
    const fetchSchoolName = async () => {
      try {
        const response = await api.get("particular/getparticulars");
        setSchoolName(response.data.schoolname || "");
      } catch (error) {
        showToast(
          error?.response?.data.message || "Error fetching school name",
          "error",
          { duration: 3000, position: "top-right" }
        );
      }
    };
    fetchSchoolName();
  }, []);

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
      setSmsLogs([]);
      handleClearForm();
    }
    if (field === "form") {
      setSmsLogs([]);
      handleClearForm();
    }
  };

  useEffect(() => {
    const fetchStreams = async () => {
      if (selectedYear && selectedForm) {
        try {
          const response = await api.post("/stream/getstreams", {
            year: selectedYear,
            form: selectedForm,
          });
          setStreamOptions(
            response.data.map((stream) => ({
              value: stream.id,
              label: stream.stream_name,
            }))
          );
        } catch (err) {
          showToast(
            err?.response?.data.message || "Failed to fetch streams",
            "error",
            { duration: 3000, position: "top-right" }
          );
        }
      }
    };

    const fetchStudents = async () => {
      if (selectedYear && selectedForm) {
        try {
          const response = await api.post("/student/getstudents", {
            year: selectedYear,
            form: selectedForm,
          });
          setStudentList(
            response.data.map((student) => ({
              value: student.id,
              label: `${student.id} ${student.fname} ${student.lname}`,
              phone: student.phone,
              stream_id: student.stream_id,
            }))
          );
        } catch (err) {
          showToast(
            err?.response?.data.message || "Failed to fetch students",
            "error",
            { duration: 3000, position: "top-right" }
          );
        }
      }
    };

    if (selectedYear && selectedForm) {
      fetchStreams();
      fetchStudents();
    }
  }, [selectedYear, selectedForm]);

  const fetchSmsLogs = async () => {
    if (!selectedYear || !selectedForm) return;

    try {
      setLoading(true);
      const response = await api.post("/sms/getsmslogs", {
        year: selectedYear,
        form: selectedForm,
      });
      setSmsLogs(response.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setSmsLogs([]);
      } else {
        showToast(
          error?.response?.data.message || "Failed to fetch SMS logs",
          "error",
          {
            duration: 3000,
            position: "top-right",
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmsLogs();
  }, [selectedYear, selectedForm]);

  const handleClearForm = () => {
    setMessage("");
    setPreviewMessage("");
  };

  useEffect(() => {
    setPreviewMessage(message);
  }, [message]);

  const handleStreamCheckboxChange = (e) => {
    setSelectStreamChecked(e.target.checked);
    if (e.target.checked) {
      setSelectStudentChecked(false);
    }
  };

  const handleStudentCheckboxChange = (e) => {
    setSelectStudentChecked(e.target.checked);
    if (e.target.checked) {
      setSelectStreamChecked(false);
    }
  };

  const handleSendSMS = async () => {
    if (!message) {
      showToast("Please enter a message", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    try {
      setSending(true);
      let recipients = [];

      if (!selectStreamChecked && !selectStudentChecked) {
        recipients = studentList
          .filter((student) => student.phone)
          .map((student) => ({
            id: student.value,
            number: student.phone,
          }));
      } else if (selectStreamChecked && !selectStudentChecked) {
        if (selectedStreams.length === 0) {
          showToast("Please select at least one stream", "error", {
            duration: 3000,
            position: "top-right",
          });
          return;
        }

        recipients = studentList
          .filter(
            (student) =>
              student.phone && selectedStreams.includes(student.stream_id)
          )
          .map((student) => ({
            id: student.value,
            number: student.phone,
          }));
      } else if (selectStudentChecked && !selectStreamChecked) {
        if (selectedStudentList.length === 0) {
          showToast("Please select at least one student", "error", {
            duration: 3000,
            position: "top-right",
          });
          return;
        }

        recipients = studentList
          .filter(
            (student) =>
              student.phone && selectedStudentList.includes(student.value)
          )
          .map((student) => ({
            id: student.value,
            number: student.phone,
          }));
      }

      const uniqueRecipients = recipients.filter(
        (recipient, index, self) =>
          index === self.findIndex((r) => r.id === recipient.id)
      );

      if (uniqueRecipients.length === 0) {
        showToast(
          "No valid phone numbers found for selected recipients",
          "error",
          { duration: 3000, position: "top-right" }
        );
        return;
      }

      const payload = {
        message: `${schoolName}\n\n${message}`,
        recipients: uniqueRecipients,
        unival: "studentgeneric",
      };

      await api.post("/sms/sendgensms", payload);

      showToast("SMS sent successfully!", "success", {
        duration: 3000,
        position: "top-right",
      });
      fetchSmsLogs();
      handleClearForm();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to send SMS",
        "error",
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setSending(false);
    }
  };

  const showStreamControls = streamOptions.length > 0 || studentList.length > 0;

  return (
    <div className="p-0">
      <div className="my-2 w-full flex flex-col lg:flex-row gap-2">
        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit mb-2 bg-blue-100 dark:bg-gray-800"
            tag="Configuration"
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
                />
              </div>
            </div>
          </ReusableDiv>
        </div>

        <div className="w-full lg:w-3/4 flex flex-1 flex-col gap-2">
          <div className="flex flex-1 flex-col lg:flex-row gap-2">
            <ReusableDiv
              className="ml-0 mr-0 flex-1 ring-1 mb-2 bg-blue-100 dark:bg-gray-800"
              tag="Compose Message"
              icon={TbReport}
              collapsible={true}
            >
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <ReusableTextarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                  />
                </div>

                {showStreamControls && (
                  <div className="mt-2">
                    <Checkbox
                      id="select-stream-checkbox"
                      label="Select Stream"
                      className="mb-2"
                      checked={selectStreamChecked}
                      onChange={handleStreamCheckboxChange}
                    />
                    {selectStreamChecked && streamOptions.length > 0 && (
                      <Dropdown
                        options={streamOptions}
                        value={selectedStreams}
                        onChange={(values) => setSelectedStreams(values)}
                        placeholder="Select Stream"
                        menuPlacement="auto"
                        searchable
                        clearable
                        className="z-50 flex-1"
                        multiple={true}
                      />
                    )}
                  </div>
                )}

                {showStreamControls && (
                  <div className="mt-2">
                    <Checkbox
                      id="select-student-checkbox"
                      label="Select Students"
                      className="mb-2"
                      checked={selectStudentChecked}
                      onChange={handleStudentCheckboxChange}
                    />
                    {selectStudentChecked && studentList.length > 0 && (
                      <CheckboxGroup
                        label="Student List"
                        className="mt-1 mr-0"
                        options={studentList}
                        selectedValues={selectedStudentList}
                        onChange={(values) => {
                          setSelectedStudentList(values);
                        }}
                        name="student_ids"
                        height="100px"
                      />
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    icon={AiOutlineClear}
                    className="ring-1"
                    onClick={handleClearForm}
                    disabled={!message}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="primary"
                    icon={sending ? FaSpinner : TbSend}
                    onClick={handleSendSMS}
                    disabled={sending || !message || studentList.length === 0}
                    className={sending ? "animate-pulse" : ""}
                  >
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </ReusableDiv>

            <ReusableDiv
              className="ml-0 mr-0 flex-1 ring-1 mb-2 bg-blue-100 dark:bg-gray-800"
              tag="Message Preview"
              icon={MdOutlinePreview}
              collapsible={true}
            >
              <div className="p-4 overflow-auto max-h-[300px]">
                <div className="whitespace-pre-line text-sm break-words overflow-wrap-anywhere">
                  {schoolName && <strong>{schoolName}</strong>}
                  {schoolName && <br />}
                  {<br />}
                  {previewMessage}
                </div>
              </div>
            </ReusableDiv>
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

export default StudentSMS;
