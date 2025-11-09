import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
// 1. Importe o Supabase central do AuthContext
import { supabase } from './AuthContext';

// 2. Interface atualizada para corresponder ao banco
export interface Occurrence {
  id: string;
  type: string;      // Mapeado de 'titulo_ocorrencia'
  imageUrl?: string; // Mapeado de 'urls_imagens[0]'
  likes: number;
  status: string;
  description?: string; // Mapeado de 'descricao_ocorrencia'
}

export interface OccurrencesContextType {
  occurrences: Occurrence[];
  loading: boolean;
  deleteOccurrence: (id: string) => Promise<void>;
  refreshOccurrences: () => Promise<void>; // Função para recarregar
}

export const OccurrencesContext = createContext({} as OccurrencesContextType)

export function OccurrencesProvider({ children }: { children: React.ReactNode }) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Função que BUSCA os dados REAIS do Supabase
  async function fetchOccurrences() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Ocorrencia') // 👈 Busca da tabela 'Ocorrencia'
        .select('*')
        .order('dt_criacao', { ascending: false }); // Mais recentes primeiro

      if (error) {
        throw error;
      }

      if (data) {
        // 4. Mapeia os dados do banco para o formato que seu app espera
        const mappedData: Occurrence[] = data.map((item: any) => ({
          id: item.id.toString(),
          type: item.titulo_ocorrencia || 'Sem título',
          description: item.descricao_ocorrencia || '',
          // Pega a primeira imagem do array, se existir
          imageUrl: item.urls_imagens && item.urls_imagens.length > 0 ? item.urls_imagens[0] : undefined,
          likes: item.likes || 0,
          status: item.status || 'Em Análise'
        }));
        setOccurrences(mappedData); // 👈 Salva os dados REAIS no estado
      }
    } catch (error: any) {
      console.error('Erro ao buscar ocorrências:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar as ocorrências.');
    } finally {
      setLoading(false);
    }
  }

  // 5. Busca inicial ao carregar o app
  useEffect(() => {
    fetchOccurrences();
  }, []);

  // 6. Função que DELETA do Supabase
  async function deleteOccurrence(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('Ocorrencia')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Atualiza o estado local
      setOccurrences((current) => current.filter((item) => item.id !== id));
      Alert.alert('Sucesso', 'Ocorrência removida.');

    } catch (error: any) {
      console.error('Erro ao deletar:', error.message);
      Alert.alert('Erro', 'Não foi possível deletar a ocorrência.');
    }
  }

  return (
    <OccurrencesContext.Provider value={{ occurrences, loading, deleteOccurrence, refreshOccurrences: fetchOccurrences }}>
      {children}
    </OccurrencesContext.Provider>
  )
}

export function useOccurrences() {
  return useContext(OccurrencesContext)
}