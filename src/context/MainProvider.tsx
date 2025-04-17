import { createContext } from "react";

export const mainContext = createContext({});
export default function MainProvider({children}: {children: React.ReactNode}) {

  return (
    <mainContext.Provider value={{}}>
        {children}
    </mainContext.Provider>
  )
}
