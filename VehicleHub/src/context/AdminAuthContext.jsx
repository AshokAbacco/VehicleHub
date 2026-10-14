import { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
    const [admin] = useState({ name: 'Admin', role: 'Super Admin' });
    return <AdminAuthContext.Provider value={{ admin }}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => useContext(AdminAuthContext);