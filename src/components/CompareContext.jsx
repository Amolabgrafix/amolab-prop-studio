import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("compare_properties_full") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("compare_properties_full", JSON.stringify(compareItems));
    localStorage.setItem(
      "compare_properties",
      JSON.stringify(compareItems.map((item) => item.id))
    );
  }, [compareItems]);

  function addToCompare(property) {
    if (!property?.id) return;

    const alreadyAdded = compareItems.some((item) => item.id === property.id);

    if (alreadyAdded) {
      toast("Already added to compare");
      return;
    }

    if (compareItems.length >= 3) {
      toast.error("Maximum 3 properties can be compared");
      return;
    }

    setCompareItems((prev) => [...prev, property]);
    toast.success("Property added to compare");
  }

  function removeFromCompare(propertyId) {
    setCompareItems((prev) => prev.filter((item) => item.id !== propertyId));
  }

  function clearCompare() {
    setCompareItems([]);
    toast.success("Compare list cleared");
  }

  function isInCompare(propertyId) {
    return compareItems.some((item) => item.id === propertyId);
  }

  const value = useMemo(
    () => ({
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
    }),
    [compareItems]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCompare() {
  const context = useContext(CompareContext);

  if (!context) {
    throw new Error("useCompare must be used inside CompareProvider");
  }

  return context;
}