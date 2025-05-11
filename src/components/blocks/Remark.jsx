import React, { useState } from "react";
import ReusableDiv from "../ReusableDiv";
import TableComponent from "../TableComponent";
import ReusableSelect from "../ReusableSelect";
import { FaUsersGear } from "react-icons/fa6";
import { BsPencil } from "react-icons/bs";
import { remarkItemOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import api from "../../hooks/api";
import RemarkRU from "../snippets/RemarkRU";

const Remark = () => {
  const { showToast } = useToast();

  const [remarkData, setRemarkData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [rowData, setRowData] = useState(null);

  const [modalState, setModalState] = useState({
    editRemark: false,
  });

  const pointsScale = {
    E: 1,
    "D-": 2,
    D: 3,
    "D+": 4,
    "C-": 5,
    C: 6,
    "C+": 7,
    "B-": 8,
    B: 9,
    "B+": 10,
    "A-": 11,
    A: 12,
  };

  const columns = [
    // { name: "S/N", uid: "id", sortable: true },
    { name: "GRADE", uid: "grade", sortable: false },
    { name: "COMMENT/REMARK", uid: "comment", sortable: false },
    { name: "ACTIONS", uid: "actions" },
  ];


  const handleItemChange = async (item) => {
    try {
      setLoading(true);
      setSelectedItem(item);

      const response = await api.post("/remark/getremarks", { item });

      const formattedData = response.data.map((item) => {
        const grade =
          Object.keys(pointsScale).find(
            (key) => pointsScale[key] === item.id
          ) || "N/A";

        return {
          ...item,
          grade: grade,
        };
      });

      setRemarkData(formattedData);
    } catch (err) {
      const errorMsg = err.response?.data?.status || "Failed to fetch remarks";
      showToast(errorMsg, "error", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (row) => {
    setRowData(row);
    setModalState({ editRemark: true });
  };

  const refreshTable = () => {
    if (selectedItem) {
      handleItemChange(selectedItem);
    }
  };

  return (
    <div className="my-4 flex flex-1 gap-2">
      <div className="w-1/4 flex flex-col">
        <ReusableDiv
          className="ring-1 h-fit bg-blue-100 mb-4"
          tag="Remarks"
          icon={FaUsersGear}
        >
          <div className="flex flex-wrap pb-4">
            <div className="w-full flex flex-col mb-2">
              <label htmlFor="item">Item</label>
              <ReusableSelect
                id="item"
                placeholder="Select Item"
                options={remarkItemOptions}
                value={selectedItem}
                onChange={(e) => handleItemChange(e.target.value)}
              />
            </div>
          </div>
        </ReusableDiv>
      </div>

      <TableComponent
        columns={columns}
        data={remarkData}
        loading={loading}
        horizontalTableFlow={true}
        showSelectAllCheckbox={false}
        striped={true}
        buttons={{
          actionButtons: {
            show: true,
            options: [
              {
                label: "Edit",
                icon: <BsPencil className="w-4 h-4" />,
                onClick: handleEditClick,
              },
            ],
          },
        }}
        borderColor="blue-200"
        rowColors={{
          default: "hover:bg-blue-50",
          selected: "bg-blue-100",
        }}
      />

      <RemarkRU
        modalState={modalState}
        setModalState={setModalState}
        rowData={rowData}
        selectedItem={selectedItem}
        refreshTable={refreshTable}
      />
    </div>
  );
};

export default Remark;
