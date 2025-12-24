import { createContext, useContext, ReactNode } from "react";

interface BlurContextType {
  isBlurred: boolean;
}

const BlurContext = createContext<BlurContextType>({ isBlurred: false });

export const useBlur = () => useContext(BlurContext);

export const BlurProvider = ({
  children,
  isBlurred,
}: {
  children: ReactNode;
  isBlurred: boolean;
}) => {
  return (
    <BlurContext.Provider value={{ isBlurred }}>
      {children}
    </BlurContext.Provider>
  );
};

