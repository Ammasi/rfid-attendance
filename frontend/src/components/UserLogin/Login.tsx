import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";
import loginimage from "/login.jpg";

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState({ name: "", email: "", password: "" });

  const onchangehandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const submitform = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ email: user.email, password: user.password });
        toast.success("Login successful");
        navigate("/home");
      } else {
        await register(user);
        toast.success("Registration successful. Please login.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-pink-600 to-indigo-900 bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${loginimage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="backdrop-blur-lg bg-white/10 border border-white/30 shadow-xl rounded-2xl p-8 w-full max-w-md text-white">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Register"}
        </h2>
        <form onSubmit={submitform} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={onchangehandler}
                className="w-full rounded-md bg-white/20 text-white placeholder-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={onchangehandler}
              className="w-full rounded-md bg-white/20 text-white placeholder-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={onchangehandler}
              className="w-full rounded-md bg-white/20 text-white placeholder-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-purple-900 font-semibold rounded-lg py-2 hover:bg-opacity-90 transition duration-200"
          >
            {isLogin ? "Log in" : "Register"}
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          <button
            onClick={toggleForm}
            className="text-white underline hover:text-gray-300"
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
