import React, { createContext, useContext, useState } from "react";

interface Occurrence {
  id: string;
  type: string;
  imageUrl?: string;
  likes: number;
  status: string;
}

export interface OccurrencesContextType {
  occurrences: Occurrence[]
  deleteOccurrence: (id: string) => Promise<void>
}

export const OccurrencesContext = createContext({} as OccurrencesContextType)

export function OccurrencesProvider({ children }: { children: React.ReactNode }) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([
    {
      id: 'demo-1',
      type: 'Buraco na rua',
      imageUrl: 'teste',
      likes: 255,
      status: 'Em Análise'
    },
    {
      id: 'demo-2',
      type: 'Poste caído',
      imageUrl: 'teste',
      likes: 10,
      status: 'Em Análise'
    }
  ]);

  async function deleteOccurrence(id: string): Promise<void> {
    console.log('afodjspfjdl')
    setOccurrences(occurrences.filter((item) => id !== item.id))
  }

  return (
    <OccurrencesContext.Provider value={{ occurrences, deleteOccurrence }}>
      {children}
    </OccurrencesContext.Provider>
  )
}

export function useOccurrences() {
  return useContext(OccurrencesContext)
}
