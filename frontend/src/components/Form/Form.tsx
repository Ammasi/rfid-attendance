import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { 
  UserCircleIcon,
  XMarkIcon,
  CreditCardIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  UserIcon,
  CalendarIcon,
  EllipsisHorizontalCircleIcon,
  ArrowPathIcon,
  UserPlusIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  IdentificationIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  HeartIcon,
  CalendarDaysIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

const Form = () => {
  const backend_URI=import.meta.env.VITE_Backend_URI;
  const{id}=useParams();
  const route=useNavigate();
  
  const [storageType, setStorageType] = useState<"local" | "cloud">("cloud"); //07-05-2025 added this line
  const [data, setData] = useState({
    rfidcardno: "",
    file: null as File | null, // Photo Key Word Changed to File 06-05-2025 
    name: "",
    dob: "",
    email: "",
    mobileno: "",
    employeecode: "",
    designation: "",
    department: "",
    gender: "",
    maritalstatus: "",
    joiningdate: "",
    address: "",
  });

  useEffect(() => {
    if (id) {
      axios
        .get(`${backend_URI}/api/employee/${id}`)
        .then((res) => {
          const fetchedData = res.data;
          setData({
            ...fetchedData,
            dob: fetchedData.dob
              ? new Date(fetchedData.dob).toISOString().split("T")[0]
              : "",
              joiningdate: fetchedData.joiningdate
              ? new Date(fetchedData.joiningdate).toISOString().split("T")[0]
              : "",
            file: null, // // Photo Key Word Changed to File 06-05-2025 
          });
        })
        .catch((err) => console.error("Error fetching employee data:", err));
    }
  }, [id]);
  
  const onchangehandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "file") { // Photo Key Word Changed to File 06-05-2025 
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setData((prevState) => ({ ...prevState, file: file }));
    } else {
      setData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const submitdata = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value as string | Blob);
      }
    }); 

    try {
      if (id) {
        // Update existing employee
        await axios.put(
          `${backend_URI}/api/employee/${id}?storageType=${storageType}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        alert("Employee Updated Successfully!");
        route('/dashboard');
      }       
     else{
      //create Employee
      const response = await axios.post(`${backend_URI}/api/employee/create?storageType=${storageType}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Employee created successfully");
      route('/home')
      // Reset the form after successful submission
     }
      setData({
        rfidcardno: "",
        file: null, // Photo Key Word Changed to File 06-05-2025 
        name: "",
        dob: "",
        email: "",
        mobileno: "",
        employeecode: "",
        designation: "",
        department: "",
        gender: "",
        maritalstatus: "",
        joiningdate: "",
        address: "",
      });
      setStorageType("cloud");
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("Failed to create employee. Please try again.");
    }
  
  };
  
// changed design and width 07-05-2025
return (
  <div className="bg-gradient-to-r from-slate-400 to-blue-300 min-h-screen flex justify-center items-center p-4">
    <div className="w-full max-w-2xl p-4 md:p-8 bg-white bg-opacity-90 shadow-2xl rounded-2xl my-2">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 flex items-center gap-2">
          <UserCircleIcon className="h-8 w-8" />
          Employee Details
        </h1>
        <button className="p-1 hover:bg-gray-100 rounded-full">
          <XMarkIcon className="h-6 w-6 text-gray-600" onClick={()=>route('/dashboard')} />
        </button>
      </div>

      <form onSubmit={submitdata} encType="multipart/form-data" className="space-y-4 md:space-y-6">
        {/* RFID Card & Photo Upload */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full relative">
            <label htmlFor="rfidcardno" className="block text-sm font-medium text-gray-700 mb-1">
              RFID Card No
            </label>
            <div className="relative">
              <CreditCardIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="text"
                name="rfidcardno"
                value={data.rfidcardno}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="w-full">
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
              Employee Image
            </label>
            <div className="relative">
              <PhotoIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="file"
                name="file"
                onChange={onchangehandler}
                accept="image/*"
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="mt-2 flex flex-col md:flex-row gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="storageType"
                  value="cloud"
                  checked={storageType === "cloud"}
                  onChange={() => setStorageType("cloud")}
                  className="text-blue-600"
                />
                <CloudArrowUpIcon className="h-4 w-4" />
                Cloud Storage
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="storageType"
                  value="local"
                  checked={storageType === "local"}
                  onChange={() => setStorageType("local")}
                  className="text-blue-600"
                />
                <CpuChipIcon className="h-4 w-4" />
                Local Storage
              </label>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="w-full relative">
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <CalendarIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="date"
                name="dob"
                value={data.dob}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="w-full relative">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <div className="relative">
              <EllipsisHorizontalCircleIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <select
                name="gender"
                value={data.gender}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="w-full relative">
            <label htmlFor="mobileno" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile No
            </label>
            <div className="relative">
              <DevicePhoneMobileIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="text"
                name="mobileno"
                value={data.mobileno}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Employment Details Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full relative">
            <label htmlFor="employeecode" className="block text-sm font-medium text-gray-700 mb-1">
              Employee Code
            </label>
            <div className="relative">
              <IdentificationIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="text"
                name="employeecode"
                value={data.employeecode}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="w-full relative">
            <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <div className="relative">
              <BriefcaseIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="text"
                name="designation"
                value={data.designation}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Department & Marital Status */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full relative">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <div className="relative">
              <BuildingOfficeIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="text"
                name="department"
                value={data.department}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="w-full relative">
            <label htmlFor="maritalstatus" className="block text-sm font-medium text-gray-700 mb-1">
              Marital Status
            </label>
            <div className="relative">
              <HeartIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <select
                name="maritalstatus"
                value={data.maritalstatus}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="" disabled>Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </div>
          </div>
        </div>

        {/* Joining Date & Address */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full relative">
            <label htmlFor="joiningdate" className="block text-sm font-medium text-gray-700 mb-1">
              Joining Date
            </label>
            <div className="relative">
              <CalendarDaysIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <input
                type="date"
                name="joiningdate"
                value={data.joiningdate}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="w-full relative">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <MapPinIcon className="h-5 w-5 absolute left-3 top-3 text-blue-500" />
              <textarea
                name="address"
                value={data.address}
                onChange={onchangehandler}
                required
                className="pl-10 pr-4 w-full border rounded-xl border-blue-500 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-center">
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-all"
          >
            {id ? (
              <>
                <ArrowPathIcon className="h-5 w-5" />
                Update Employee
              </>
            ) : (
              <>
                <UserPlusIcon className="h-5 w-5" />
                Create Employee
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default Form;