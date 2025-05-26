import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RFIDScanner: React.FC = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [rfidCardNumber, setRfidCardNumber] = useState<string>("");
  const [responseMessage, setResponseMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidCardNumber) {
      setResponseMessage("RFID card number cannot be empty.");
      return;
    }
    try {
      const response = await fetch(`${backend_URI}/api/employee/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfidcardno: rfidCardNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Success");
        setResponseMessage(data.message);
      } else {
        toast.error(data.message || "Error");
        setResponseMessage(data.message || "Error occurred.");
      }
    } catch (error) {
      console.error(error);
      setResponseMessage("Error connecting to the server.");
      toast.error("Error connecting to the server.");
    }
    setRfidCardNumber("");
    inputRef.current?.focus();
  };

  return (
    <>
      <ToastContainer />
      <div
        className="
          flex flex-col items-center justify-center h-screen
          bg-[#e0e5ec]
          shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.7)]
        "
      >
        <div
          className="
            bg-[#f9f9f9]
            w-[400px] h-52
            rounded-3xl
            p-6
            flex flex-col justify-center items-center
            shadow-lg
            hover:shadow-xl
            transition-shadow duration-300
          "
        >
          <form
            className="flex flex-col justify-center items-center gap-4 w-full"
            onSubmit={handleScan}
          >
            <div className="relative w-full text-center  ">
              <label
                htmlFor="rfid-input"
                className="block text-xl font-semibold font-poppins text-gray-700"
              >
                Scan Your RFID Card
              </label>
              <button
                type="button"
                className="absolute right-0 top-0  text-xl text-gray-500 hover:text-gray-700"
                onClick={() => navigate("/home")}
              >
                ✕
              </button>
            </div>

            <input
              id="rfid-input"
              ref={inputRef}
              type="text"
              value={rfidCardNumber}
              placeholder="Scan your card"
              onChange={(e) => setRfidCardNumber(e.target.value)}
              className="
                w-full max-w-xs
                p-3
                font-poppins
                placeholder-gray-400
                text-center
                rounded-lg
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-indigo-300
                shadow-inner
              "
            />
          </form>

          {responseMessage && (
            <div
              className={`
                mt-4 px-4 py-2 text-center rounded-md
                ${
                  responseMessage.toLowerCase().includes("success")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }
                w-full max-w-xs
              `}
            >
              {responseMessage}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RFIDScanner;
