import { useEffect, useState } from "react";

export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Definindo que o componente está montado após a montagem inicial
    setIsMounted(true);
    return () => {
      // Definindo que o componente não está mais montado ao desmontar
      setIsMounted(false);
    };
  }, []);

  return isMounted;
};

