import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from './AuthContext';

export interface Occurrence {
  id: string;
  type: string;
  imageUrl?: string;
  likes: number;
  status: string;
  description?: string;
  user_has_liked: boolean;
}

export interface OccurrencesContextType {
  occurrences: Occurrence[];
  loading: boolean;
  deleteOccurrence: (id: string) => Promise<void>;
  refreshOccurrences: () => Promise<void>;
  optimisticallyToggleLike: (id: string) => void; // 👈 1. ADICIONE A NOVA FUNÇÃO
}

export const OccurrencesContext = createContext({} as OccurrencesContextType)

export function OccurrencesProvider({ children }: { children: React.ReactNode }) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOccurrences() {
    // ... (Sua função fetchOccurrences continua a mesma)
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_occurrences_with_likes');

      if (error) {
        throw error;
      }

      if (data) {
        const mappedData: Occurrence[] = data.map((item: any) => ({
          id: item.id.toString(),
          type: item.titulo_ocorrencia || 'Sem título',
          description: item.descricao_ocorrencia || '',
          imageUrl: item.urls_imagens && item.urls_imagens.length > 0 ? item.urls_imagens[0] : undefined,
          likes: item.likes || 0,
          status: item.status || 'Em Análise',
          user_has_liked: item.user_has_liked || false,
        }));
        setOccurrences(mappedData);
      }
    } catch (error: any) {
      console.error('Erro ao buscar ocorrências:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar as ocorrências.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOccurrences();
  }, []);

  async function deleteOccurrence(id: string): Promise<void> {
    // ... (Sua função deleteOccurrence continua a mesma)
    try {
      const { error } = await supabase
        .from('Ocorrencia')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      setOccurrences((current) => current.filter((item) => item.id !== id));
      Alert.alert('Sucesso', 'Ocorrência removida.');

    } catch (error: any) {
      console.error('Erro ao deletar:', error.message);
      Alert.alert('Erro', 'Não foi possível deletar a ocorrência.');
    }
  }

  // 2. 👇 ADICIONE A LÓGICA DA ATUALIZAÇÃO OTIMISTA
  async function optimisticallyToggleLike(id: string) {
    let originalOccurrences: Occurrence[] = [];

    // 3. Atualiza o estado local IMEDIATAMENTE
    setOccurrences(current => {
      originalOccurrences = [...current]; // Salva o estado original para reverter

      return current.map(occ => {
        if (occ.id === id) {
          // Inverte o status do like e atualiza a contagem
          const wasLiked = occ.user_has_liked;
          return {
            ...occ,
            user_has_liked: !wasLiked,
            likes: wasLiked ? occ.likes - 1 : occ.likes + 1
          };
        }
        return occ;
      });
    });

    // 4. Tenta atualizar o banco de dados em segundo plano
    try {
      const { error } = await supabase.rpc('toggle_like', {
        ocorrencia_id_param: id
      });
      if (error) throw error; // Joga para o catch
    } catch (error: any) {
      console.error("Erro ao dar toggle_like, revertendo:", error.message);
      // 5. Se o banco falhar, reverte o estado local
      setOccurrences(originalOccurrences);
      Alert.alert('Erro', 'Não foi possível registrar seu like.');
    }
  }

  return (
    <OccurrencesContext.Provider value={{
      occurrences,
      loading,
      deleteOccurrence,
      refreshOccurrences: fetchOccurrences,
      optimisticallyToggleLike // 👈 6. Exponha a nova função
    }}>
      {children}
    </OccurrencesContext.Provider>
  )
}

export function useOccurrences() {
  return useContext(OccurrencesContext)
}