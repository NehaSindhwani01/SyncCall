import axios from "axios";
import { createContext, useState } from "react";
import { StatusCodes } from "http-status-codes";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:3000/api/v1/users",
  withCredentials: true, // enable cookies if needed
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post("/register", {
        name,
        username,
        password,
      });
      if (request.status === StatusCodes.CREATED) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", {
        username,
        password,
      });

      if (request.status === StatusCodes.OK) {
        const token = request.data.token;
        const name = request.data.name;

        localStorage.setItem("token", token);
        setUserData({ name }); 
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
