import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const RFIDScanner: React.FC = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [rfidCardNumber, setRfidCardNumber] = useState<string>("");
  const [responseMessage, setResponseMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // Automatically focus the input field when the component loads
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
        body: JSON.stringify({ rfidcardno: rfidCardNumber }), // Match backend key `rfidcardno`
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

    setRfidCardNumber(""); // Clear input after submitting
    inputRef.current?.focus(); // Refocus input for next scan
  };

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col items-center justify-center h-screen bg-[#672362]">
        <div className="bg-[#8b3885] w-[400px] h-52 rounded-3xl border border-gray-200 p-4">
          <form
            className="flex flex-col justify-center items-center gap-4"
            onSubmit={handleScan}
          >
            <div className="flex  relative items-center text-center ">
              <label
                htmlFor="rfid-input"
                className="text-lg font-semibold font-poppins text-white"
              >
                Scan Your RFID Card:
              </label>
              <span
                className="text-lg absolute -right-20 font-medium cursor-pointer text-white"
                onClick={() => navigate("/home")}
              >
                X
              </span>
            </div>
            <input
              id="rfid-input"
              ref={inputRef} // Attach ref for autofocus
              type="text"
              value={rfidCardNumber}
              placeholder="Scan your card"
              onChange={(e) => setRfidCardNumber(e.target.value)}
              className="w-56 p-2 border font-poppins placeholder:font-poppins rounded border-gray-500 text-center focus:outline-blue-500"
            />
          </form>
          {responseMessage && (
            <div
              className={`mt-4 px-4 py-2 text-center ${
                responseMessage.includes("success")
                  ? "text-green-500"
                  : "text-red-100"
              }`}
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
