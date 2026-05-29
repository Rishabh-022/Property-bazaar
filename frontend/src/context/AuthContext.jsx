import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('propertyBazzarUser');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
    const userData = { ...data.user, token: data.token };
    setUser(userData);
    localStorage.setItem('propertyBazzarUser', JSON.stringify(userData));
    return data;
  };

  const register = async (formData) => {
    const { data } = await axios.post('http://localhost:5000/api/users/register', formData);
    const userData = { ...data.user, token: data.token };
    setUser(userData);
    localStorage.setItem('propertyBazzarUser', JSON.stringify(userData));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('propertyBazzarUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};