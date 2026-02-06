import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Tool {
  id: string;
  tNumber: string;
  hNumber: string;
  toolName: string;
  protrusion: string;
  bladeLength: string;
}

export interface WorkManual {
  id: string;
  customer: string;
  productName: string;
  productNumber: string;
  fileNo: string;
  machine: string;
  createdDate: string;
  createdBy: string;
  processName: string;
  processTime: string;
  prgM: string;
  prgS: string;
  material: string;
  materialSize: string;
  treatment: string;
  toolComment: string;
  subProgramNNumbers: string;
  tools: Tool[];
  images: string[];
}

interface StorageContextType {
  manuals: WorkManual[];
  addManual: (manual: WorkManual) => void;
  updateManual: (id: string, manual: WorkManual) => void;
  deleteManual: (id: string) => void;
  getManual: (id: string) => WorkManual | undefined;
  exportData: () => string;
  importData: (data: string) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manuals, setManuals] = useState<WorkManual[]>([]);

  // ローカルストレージから読み込み
  useEffect(() => {
    const stored = localStorage.getItem('workManuals');
    if (stored) {
      try {
        setManuals(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load manuals from localStorage:', error);
      }
    }
  }, []);

  // ローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('workManuals', JSON.stringify(manuals));
  }, [manuals]);

  const addManual = (manual: WorkManual) => {
    setManuals([...manuals, manual]);
  };

  const updateManual = (id: string, manual: WorkManual) => {
    setManuals(manuals.map(m => (m.id === id ? manual : m)));
  };

  const deleteManual = (id: string) => {
    setManuals(manuals.filter(m => m.id !== id));
  };

  const getManual = (id: string) => {
    return manuals.find(m => m.id === id);
  };

  const exportData = () => {
    return JSON.stringify(manuals, null, 2);
  };

  const importData = (data: string) => {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        setManuals(imported);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  };

  return (
    <StorageContext.Provider value={{ manuals, addManual, updateManual, deleteManual, getManual, exportData, importData }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};
