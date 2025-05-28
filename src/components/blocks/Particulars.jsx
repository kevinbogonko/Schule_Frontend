import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import { useToast } from "../Toast";
import api from "../../hooks/api";
import { FaSpinner } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import Button from "../ui/raw/Button";
import RUParticulars from "../snippets/RUParticulars";
import { TbListDetails, TbPhotoUp } from "react-icons/tb";

const Particulars = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { showToast } = useToast();

  const [particulars, setParticulars] = useState({
    schoolname: "",
    motto: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo_path: null,
  });

  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    editParticulars: false,
    editSchoolLogo : false
  });

  useEffect(() => {
    let isMounted = true;

    const fetchParticulars = async () => {
      try {
        const response = await api.get("/particular/getparticulars");
        if (isMounted) {
          setParticulars(response.data);
        }
      } catch (err) {
        showToast(err.message || "Failed to fetch school details", "error", {duration : 3000, position : 'top-right'});
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchParticulars();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const imagePath = particulars.logo_path || "/images/defaults/logo.webp";

  return (
    <div className="p-0 relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Loading School Details...
            </p>
          </div>
        </div>
      )}

      <ReusableDiv
        tag="School Details"
        icon={TbListDetails}
        className="ml-0 mr-0 bg-blue-50 mx-0 rounded-lg shadow-sm"
      >
        <div className="flex flex-col md:flex-row-reverse gap-6 px-0 py-2 w-full h-auto">
          <div className="w-full md:w-64 flex-shrink-0 h-auto">
            <div className="w-full h-64 border-2 border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-sm">
              <img
                src={`${BACKEND_BASE_URL}${imagePath}`}
                alt="School logo"
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${BACKEND_BASE_URL}/images/defaults/logo.webp`;
                }}
              />
            </div>
          </div>

          <div className="flex-1 w-full h-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-auto">
              {[
                ["School Name", particulars.schoolname],
                ["Motto", particulars.motto],
                ["Address", particulars.address],
                ["Phone", particulars.phone],
                ["Email", particulars.email],
              ].map(([label, value], i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow h-full"
                >
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="font-medium text-gray-700 truncate">
                    {value || "Not specified"}
                  </p>
                </div>
              ))}

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow h-full">
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Website
                </p>
                <p className="font-medium text-blue-600 truncate">
                  {particulars.website ? (
                    <a
                      href={
                        particulars.website.startsWith("http")
                          ? particulars.website
                          : `https://${particulars.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate block"
                    >
                      {particulars.website}
                    </a>
                  ) : (
                    "Not specified"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ReusableDiv>

      <div className="mt-6 flex gap-2 justify-end">
        <Button
          variant="primary"
          icon={FiEdit2}
          className="px-6 py-2"
          onClick={() => {
            setModalState((prev) => ({ ...prev, editParticulars: true }));
          }}
        >
          Edit
        </Button>
        <Button
          variant="primary"
          icon={TbPhotoUp}
          className="px-6 py-2"
          onClick={() => {
            setModalState((prev) => ({ ...prev, editSchoolLogo: true }));
          }}
        >
          Upload Logo
        </Button>
      </div>

      <RUParticulars
        modalState={modalState}
        setModalState={setModalState}
        particulars={particulars}
        onUpdateSuccess={(updatedData) => {
          setParticulars(updatedData);
        }}
      />
    </div>
  );
};

export default Particulars;
