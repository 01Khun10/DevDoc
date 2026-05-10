import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("devdoc_language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("devdoc_language", selectedLanguage);
  }, [selectedLanguage]);

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setLanguage: setSelectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
