import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faImage,
  faTimes,
  faCheck,
  faExclamationCircle,
  faSpinner,
  faPencilAlt,
  faTrash,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";
import chatbg from "/doodle.jpg";
import Cookies from "js-cookie";

interface Message {
  groupId: string;
  sender: { _id: string | null; name: string } | null;
  content: string;
  file?: string; // image link
  timestamp: string;
  tempId?: string;
  uploadProgress?: number;
  mentions?: string[];
}

interface Group {
  _id: string;
  name: string;
  members: string[];
}

interface User {
  _id: string;
  name: string;
}

interface Employee {
  _id: string;
  rfidcardno: string;
  photo: string;
  name: string;
  dob: string;
  email: string;
  mobileno: string;
  employeecode: string;
  designation: string;
  department: string;
  gender: string;
  maritalstatus: string;
  joiningdate: string;
  address: string;
}

// Imported from .env file
const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const backend_URI = import.meta.env.VITE_Backend_URI;

const ChatApp: React.FC = () => {
  const { currentUserId, userName, isAdmin } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const [newUser, setNewUser] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [mentionUsers, setMentionUsers] = useState<User[]>([]);
  const [showMentionList, setShowMentionList] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = useRef<any>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  //chatbox sidebar
  const [isSidebarChatOpen, setIsSidebarChatOpen] = useState(false);

  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (!activeGroup) {
      window.location.reload();
    }
  }, [activeGroup]);

  useEffect(() => {
    socket.current = io(`${backend_URI}`, {
      transports: ["websocket"],
    });

    //new message updates instantly
    socket.current.on("message", handleNewMessage);

    return () => {
      socket.current.disconnect();
    };
  }, []);

  // fetch Employee
  useEffect(() => {
    const fetchemployee = async () => {
      try {
        const response = await fetch(`${backend_URI}/api/employee`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Employee[] = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employee:", error);
      }
    };
    fetchemployee();
  }, []);

  //new messages fetching using socket
  const handleNewMessage = (message: Message) => {
    setMessages((prev) => {
      const existingIndex = prev.findIndex((m) => m.tempId === message.tempId);
      if (existingIndex !== -1) {
        const newMessages = [...prev];
        newMessages[existingIndex] = message;
        return newMessages;
      }
      return [...prev, message];
    });
  };

  //fetch active group messages all messages
  useEffect(() => {
    if (activeGroup) {
      socket.current.emit("joinGroup", activeGroup);
      const fetchMessages = async () => {
        try {
          const response: any = await axios.get(
            `${backend_URI}/api/employee/groups/messages/${activeGroup}`
          );
          setMessages(response.data.messages || []);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
      return () => {
        socket.current.emit("leaveGroup", activeGroup);
      };
    }
  }, [activeGroup]);

  useEffect(() => {
    if (activeGroup) {
      Cookies.set("activeGroupId", activeGroup);
    } else {
      Cookies.remove("activeGroupId");
    }
  }, [activeGroup]);

  //fetch all groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await axios.get(
          `${backend_URI}/api/employee/groups/getgroups`,
          { withCredentials: true }
        );
        // filter
        const filteredGroups = isAdmin ? data: data.filter((group:any)=>group.members.includes(userName));
        setGroups(filteredGroups);
        // Restore the last active group from localStorage
        const storedGroupId = Cookies.get("activeGroupId");

        if (
          storedGroupId &&
          filteredGroups.some((group: { _id: string }) => group._id === storedGroupId)
        ) {
          setActiveGroup(storedGroupId);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [isAdmin,userName]);

  const getGroupInitial = (name: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  //upload the image to cloudinary database and it gives link
  const uploadToCloudinary = async (
    file: File,
    onProgress: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chatimages");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  //send messages
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() && !selectedImage) return;

    const tempId = Date.now().toString();

    const optimisticMessage: Message = {
      groupId: activeGroup!,
      // sender: currentUserId,
      sender: { _id: currentUserId, name: userName },
      content: messageInput.trim(),
      file: selectedImage ? URL.createObjectURL(selectedImage) : undefined, // image converts to cloudinary link
      timestamp: new Date().toISOString(),
      tempId,
      uploadProgress: 0,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // clear inputs
    setMessageInput("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      let imageUrl = "";
      if (selectedImage) {
        imageUrl = await uploadToCloudinary(selectedImage, (progress) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === tempId ? { ...msg, uploadProgress: progress } : msg
            )
          );
        });
      }

      const finalMessage = {
        ...optimisticMessage,
        file: imageUrl || undefined, // Correctly includes Cloudinary URL send link to backend
      };

      await axios.post(
        `${backend_URI}/api/employee/groups/post`,
        finalMessage,
        { withCredentials: true }
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, uploadProgress: -1 } : msg
        )
      );
    }
  };

  //image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setSelectedImage(file);
    }
  };

  //new group create
  const handleCreateGroup = async () => {
    if (groupName.trim()) {
      try {
        //update group name if existing groupId
        if (editingGroupId) {
          const response = await axios.put(
            `${backend_URI}/api/employee/groups/${editingGroupId}`,
            { name: groupName.trim() },
            { withCredentials: true }
          );
          setGroups((prev) =>
            prev.map((g) =>
              g._id === editingGroupId ? { ...g, name: groupName.trim() } : g
            )
          );
          setEditingGroupId(null);
          setGroupName("");
        } else {
          //create new group name
          const response = await axios.post(
            `${backend_URI}/api/employee/groups/creategroup`,
            { name: groupName.trim() },
            { withCredentials: true }
          );
          const newGroup = response.data; // { _id, name, members… }
          setGroups((prev) => [...prev, newGroup]);
          setGroupName("");
          // ** NEW LINES **
          setActiveGroup(newGroup._id);
        }
      } catch (error) {
        console.error("Error creating group:", error);
      }
    }
  };

  // Inline group update function for editing
  const updateInlineGroup = async (groupId: string) => {
    if (groupName.trim()) {
      try {
        await axios.put(
          `${backend_URI}/api/employee/groups/${groupId}`,
          { name: groupName.trim() },
          { withCredentials: true }
        );
        setGroups((prev) =>
          prev.map((g) =>
            g._id === groupId ? { ...g, name: groupName.trim() } : g
          )
        );
        setEditingGroupId(null);
        setGroupName("");
      } catch (error) {
        console.error("Error updating group:", error);
      }
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  //delete group
  const handleDeleteGroup = async (groupId: string) => {
    try {
      const response = await axios.delete(
        `${backend_URI}/api/employee/groups/${groupId}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        //filter method returns new array
        //iterates over each group in prevGroups and keeps only those groups whose _id is NOT equal to groupId
        setGroups((prevGroups) =>
          prevGroups.filter((group) => group._id !== groupId)
        );
      }
    } catch (error) {
      console.error("Error deleting group:", error);
    } finally {
      setShowDeleteConfirm(false);
      setGroupToDelete(null);
    }
  };

  // Function to trigger the delete confirmation
  const confirmDeleteGroup = (groupId: string) => {
    setGroupToDelete(groupId);
    setShowDeleteConfirm(true);
  };

  //new users add group
  const addUserToGroup = async () => {
    if (!newUser.trim() || !activeGroup) return;

    try {
      await axios.post(
        `${backend_URI}/api/employee/groups/${activeGroup}/addmember`,
        { userId: newUser },
        { withCredentials: true }
      );
      setNewUser("");
      window.location.reload();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };
  //time format
  const formatTimestamp = (timestamp: string) => {
    return moment(timestamp).tz("Asia/Kolkata").format("hh:mm A");
  };

  // Handle user mention logic when click @ show group members functionality
  const handlemention = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    if (value.includes("@")) {
      const query = value.split("@").pop() || "";
      setMentionQuery(query);
      setShowMentionList(true);

      // Fetch users for mention
      const group = groups.find((g) => g._id === activeGroup);
      if (group) {
        const users = group.members.map((member) => ({
          _id: member,
          name: member, // Replace with actual user name fetching logic
        }));
        setMentionUsers(users.filter((user) => user.name.includes(query)));
      }
    } else {
      setShowMentionList(false);
    }
  };

  const selectMention = (user: User) => {
    const message = messageInput.replace(`@${mentionQuery}`, `@${user.name}`);
    setMessageInput(message);
    setShowMentionList(false);
  };

  const handleGroupSelect = (groupId: string) => {
    // const selectedGroup = groups.find(group => group._id === groupId);
    // if(selectedGroup && selectedGroup.members.length >+ 0){
    setActiveGroup(groupId);
    setIsSidebarChatOpen(false);
    // }
  };

  //image preview chat Fetches and displays a preview of a given URL
  const LinkPreview = ({ url }: { url: string }) => {
    const [preview, setPreview] = useState<{
      title?: string;
      description?: string;
      image?: string;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
      const fetchPreview = async () => {
        try {
          const response = await axios.get(
            `${backend_URI}/api/employee/groups/proxy?url=${encodeURIComponent(
              url
            )}`
          );

          const data = {
            title: response.data.title?.substring(0, 100) || "No Tiltle",
            description: response.data.description?.substring(0, 200) || "",
            image: response.data.image || "",
            url: response.data.url,
          };
          setPreview(data);
          setLoading(false);
        } catch (error) {
          setError(true);
          setLoading(false);
        }
      };
      fetchPreview();
    }, [url]);
    //if true loading preview
    if (loading) return <div className="p-2 text-sm">Loading preview...</div>;
    //if false error
    if (error || !preview) return null;

    return (
      <div
        className={`mt-0.5 max-w-sm bg-[#efefef] rounded-lg border shadow-md overflow-hidden`}
      >
        {preview.image && (
          <img
            src={preview.image}
            alt="Preview"
            className="w-full h-32 md:h-52 object-cover"
            //If the image fails to load, it is hidden using onError.
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="p-2">
          {preview.title && (
            <div className="font-medium text-black text-sm truncate">
              {preview.title}
            </div>
          )}
          {preview.description && (
            <div className="text-xs text-black truncate">
              {preview.description}
            </div>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 truncate hover:underline cursor-pointer"
          >
            {url}
          </a>
        </div>
      </div>
    );
  };

  //Parses text content to identify and format URLs and @mentions.
  const parseContent = (content: string) => {
    const urlRegax = /(https?:\/\/[^\s"'<>()]+)/g;
    const mentionRegax = /@([a-zA-Z0-9_-]+)/g;
    let elements: JSX.Element[] = []; //Returns an array of JSX elements.
    let remainingContent = content;

    //split by urls Converts URLs into clickable links.
    const urlParts = remainingContent.split(urlRegax);
    urlParts.forEach((part, index) => {
      if (index % 2 === 1) {
        //url part
        elements.push(
          <a
            key={`url-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {part}
          </a>
        );
      } else {
        // Text part, check for mentions
        const mentionParts = part.split(mentionRegax);
        mentionParts.forEach((mp, mpIndex) => {
          if (mpIndex % 2 === 1) {
            //mention part
            elements.push(
              <span key={`mention-${mpIndex}`} className="text-blue-500">
                @{mp}
              </span>
            );
          } else {
            //regular text
            elements.push(<span key={`text-${mpIndex}`}>{mp}</span>);
          }
        });
      }
    });
    return elements; //Returns an array of JSX elements.
  };

  return (
    <div className="flex h-full ">
      {isSidebarChatOpen && (
        <div
          className={`${
            isSidebarChatOpen
              ? "fixed lg:relative inset-y-0 lg:w-72 w-64 mt-14 lg:mt-0 z-40 top-0 left-0 h-full overflow-y-scroll  transition-transform duration-700  "
              : "hidden"
          } lg:block bg-gradient-to-b from-[hsl(214,41%,40%)] to-[hsl(214,41%,16%)] pl-4 pb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-indigo-100 scrollbar-thumb-rounded-lg`}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-white font-grechenfuemen text-4xl">
              Groups
            </h2>
            {/* Close button for mobile sidebar */}
            <button
              className={`${
                isSidebarChatOpen ? "block" : "hidden"
              } text-white p-2`}
              onClick={() => setIsSidebarChatOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} size="lg" /> {/* close icon */}
            </button>
          </div>
          <hr className="border-gray-700 border mb-2 " />
          {isAdmin && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 border font-poppins rounded-md bg-[#d8d8df] text-black"
              />
              <button
                onClick={handleCreateGroup}
                className="bg-[#819697] text-white px-4 py-2 font-lato rounded-md mt-2 w-full"
              >
                {editingGroupId ? "Update Group" : "Create Group"}
              </button>
            </div>
          )}

          {groups.map((group, index) => (
            <div
              key={group._id || index}
              className={`p-2 mb-2 rounded-md cursor-pointer flex items-center hover:bg-[#475e9a] relative ${
                activeGroup === group._id
                  ? "bg-[#516db4] text-white"
                  : "bg-[#516db4] text-white"
              }`}
              onClick={() => handleGroupSelect(group._id)}
            >
              <div className="w-8 h-8 rounded-full bg-[#9778d8] flex items-center justify-center text-gray-200 font-bold -mr-1">
                {getGroupInitial(group.name)}
              </div>
              <div className="flex justify-between ml-4 ">
                {editingGroupId === group._id ? (
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    onBlur={() => updateInlineGroup(group._id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && updateInlineGroup(group._id)
                    }
                    className="font-bold text-md tracking-wide font-poppins text-gray-200 bg-transparent border-b border-white outline-none"
                  />
                ) : (
                  <div className="flex flex-col">
                    <div className="font-bold text-md tracking-wide font-poppins text-gray-200">
                      {group.name}
                    </div>
                    <div className="text-xs text-blue-100 font-poppins">
                      {group.members?.length || 0} member
                    </div>
                  </div>
                )}
                {isAdmin && editingGroupId !== group._id && (
                  <div className="flex space-x-4 items-center absolute  top-0 right-4">
                    <FontAwesomeIcon
                      icon={faPencilAlt}
                      className="text-blue-100 pt-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGroupId(group._id);
                        setGroupName(group.name);
                      }}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-blue-100 pt-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeleteGroup(group._id);
                      }}
                    />
                  </div>
                )}
                {isAdmin && editingGroupId === group._id && (
                  <div className="flex items-center ml-2">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-green-500 cursor-pointer"
                      onClick={() => updateInlineGroup(group._id)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Display activity group members */}

          {isAdmin &&
            activeGroup &&
            (() => {
              const activeGroupObj = groups.find(
                (group) => group._id === activeGroup
              );
              if (!activeGroupObj) return null;
              return (
                <div className="mt-4">
                  <h3 className="text-white font-bold mb-2">
                    {activeGroupObj.name} Members
                  </h3>
                  {groups
                    .find((group) => group._id === activeGroup)
                    ?.members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 mt-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
                          {member.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white">
                          {member.charAt(0).toUpperCase() +
                            member.slice(1).toLowerCase()}
                        </span>
                      </div>
                    ))}
                </div>
              );
            })()}

          {isAdmin && activeGroup && (
            <div className="mt-2 mb-16">
              <select
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                className="w-full p-2 border rounded-md font-poppins bg-[#d8d8df] text-black"
              >
                <option value="">Select Name</option>
                {employees.map((emp, index) => (
                  <option key={index} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addUserToGroup}
                className="bg-[#819697] text-white px-4 py-2 font-lato rounded-md mt-2 w-full"
              >
                Add User
              </button>
            </div>
          )}
        </div>
      )}

      {/* delete group popup */}
      {showDeleteConfirm && (
        <div className="fixed p-2 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-5 text-center">
            <svg
              className="mx-auto mb-4 w-11 h-11 text-gray-400 dark:text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="mb-4 text-gray-500 dark:text-gray-300">
              Are you sure you want to delete this group?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setGroupToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  groupToDelete && handleDeleteGroup(groupToDelete)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* chat section */}
      <div className="flex-1 flex flex-col bg-[#ffffff] relative">
        <div className="bg-[hsl(214,41%,50%)]  text-[#1d47a6] px-2 sm:px-4 py-2 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className={`${
                isSidebarChatOpen ? "hidden" : "block"
              } mr-2 text-white`} // lg:hidden
              onClick={() => setIsSidebarChatOpen(true)}
            >
              <FontAwesomeIcon
                icon={faBars}
                className="cursor-pointer text-xl"
              />
            </button>
            <div
              className="sm:w-8 sm:h-8 w-6 h-6 rounded-full bg-[#194aa5] flex items-center justify-center
             text-gray-200 font-bold mr-3 text-sm sm:text-base sm:mr-3"
            >
              {getGroupInitial(
                groups.find((group) => group._id === activeGroup)?.name || "G"
              )}
            </div>
            <h2 className="text-lg font-bold  text-gray-200 font-roboto  ">
              {groups.find((group) => group._id === activeGroup)?.name ||
                "Select a group"}
            </h2>
          </div>
        </div>
        <hr className="border border-gray-700 shadow-lg opacity-100" />

        {/* chat messages */}
        <div
          className="flex-1 flex flex-col bg-cover bg-center overflow-y-auto   sm:p-4 p-2"
          style={{ backgroundImage: `url(${chatbg})` }}
        >
          {messages.map((message, index) => {
            const senderObj =
              typeof message.sender === "string"
                ? { _id: message.sender, name: "Loading..." }
                : message.sender;

            const isSender = senderObj?._id === currentUserId;
            const isFailed = message.uploadProgress === -1;
            const isUploading =
              message.uploadProgress !== undefined &&
              message.uploadProgress < 100;

            return (
              <div
                key={message.tempId || index}
                className={`flex flex-col mb-4 sm:mb-8 ${
                  isSender ? "items-end" : ""
                }`}
              >
                <div className="flex">
                  {!isSender && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm sm:mr-3 mr-2">
                      {senderObj?.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div
                    className={`relative sm:p-3 p-2 rounded-l-xl sm:rounded-l-2xl rounded-tr-xl sm:rounded-tr-3xl
              sm:text-sm text-xs 
              break-words max-w-[85vw] sm:max-w-[400px] min-w-24
              ${isSender ? "bg-[#efefef]" : "bg-[#efefef]"} 
              text-black pb-6 `}
                  >
                    {/* If it's not the current user, show the sender's name */}
                    {!isSender && (
                      <div className="text-md font-bold font-poppins">
                        {senderObj?.name}
                      </div>
                    )}

                    {/* Link Previews */}
                    {Array.from(
                      new Set(
                        message.content.match(/(https?:\/\/[^\s"'<>()]+)/g) ||
                          []
                      )
                    ).map((url, i) => (
                      <LinkPreview key={`preview-${i}`} url={url} />
                    ))}

                    {/* Message text */}
                    {message.content && (
                      <div className="text-sm sm:mt-2 mt-1 w-full object-cover font-poppins h-auto rounded-lg overflow-wrap break-words">
                        {parseContent(message.content)}
                      </div>
                    )}

                    {/* Image file */}
                    {message.file && (
                      <div className="relative mt-1 sm:mt-2">
                        <img
                          src={message.file}
                          alt="Uploaded content"
                          className="mt-2 w-full h-auto rounded-md"
                        />
                        {isUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                            <FontAwesomeIcon
                              icon={faSpinner}
                              spin
                              className="text-white text-xl"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timestamp + status icons */}
                    <div className="absolute bottom-0 right-0 flex items-center space-x-2 mb-0 md:-mb-0.5 mr-2">
                      <span className="flex text-[8px] md:text-xs text-gray-800">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {/* Show tick only for sender messages (not failed, not uploading) */}
                      {isSender && !isFailed && !isUploading && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-blue-500 text-[10px] md:text-[14px]"
                        />
                      )}
                      {/* Show failed icon if needed */}
                      {isFailed && (
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          className="text-red-500 text-xs"
                          title="Failed to send"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* chat input */}
        <div className="sm:p-4 p-2 border-t bg-[hsl(214,41%,50%)]  text-[#1d47a6] flex items-center space-x-1">
          <div className="sm:mr-2 mr-1">
            <label htmlFor="file-upload" className="cursor-pointer">
              <FontAwesomeIcon
                icon={faImage}
                className="text-[#f0f5f1]"
                size="lg"
              />
            </label>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={handlemention}
              onKeyPress={(e) => e.key === "Enter" && sendMessage(e)}
              className="w-full sm:px-4 px-3 sm:py-2 py-1 font-poppins rounded-full border focus:outline-none
               focus:ring-2 focus:ring-blue-200 sm:text-sm text-xs bg-[#d8d8df]"
            />
            {showMentionList && (
              <div className="absolute bottom-12 left-0 bg-white border rounded-lg shadow-lg w-48 max-h-40 overflow-y-auto">
                {mentionUsers.map((user) => (
                  <div
                    key={user._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectMention(user)}
                  >
                    {user.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={sendMessage}
            className="flex-shrink-0 p-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[#39ba4f] rounded-full hover:bg-green-600 text-white"
          >
            <FontAwesomeIcon
              icon={faPaperPlane}
              size="xs"
              style={{ fontSize: "sm" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
