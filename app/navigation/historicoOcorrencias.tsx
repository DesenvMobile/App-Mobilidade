import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCallback, useState, useEffect } from 'react'; // 👈 Importe useEffect
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl // 👈 Importe RefreshControl
} from 'react-native';
import { useAuth, supabase } from "../contexts/AuthContext"; // 👈 Use o AuthContext

// Interface atualizada para incluir a descrição
interface Occurrence {
  id: string;
  type: string;
  description: string; // 👈 Adicionado
  imageUrl?: string;
  likes: number;
  status: string;
}

export default function HistoricoOcorrenciasScreen() {
  const [loading, setLoading] = useState(true); // Começa como true
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [myOccurrences, setMyOccurrences] = useState<Occurrence[]>([]); // 👈 Estado local
  const { session } = useAuth(); // 👈 Pega a sessão do usuário

  // Função para buscar APENAS as ocorrências do usuário
  const fetchMyOccurrences = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      setError("Usuário não autenticado.");
      return;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('Ocorrencia')
        .select('*')
        .eq('usuario_id', session.user.id) // 👈 O FILTRO MÁGICO!
        .order('dt_criacao', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Mapeia os dados do banco para o formato que seu app espera
        const mappedData: Occurrence[] = data.map((item: any) => ({
          id: item.id.toString(),
          type: item.titulo_ocorrencia || 'Sem título',
          description: item.descricao_ocorrencia || 'Sem descrição', // 👈 Adicionado
          imageUrl: item.urls_imagens && item.urls_imagens.length > 0 ? item.urls_imagens[0] : undefined,
          likes: item.likes || 0,
          status: item.status || 'Em Análise'
        }));
        setMyOccurrences(mappedData);
      }
    } catch (error: any) {
      console.error('Erro ao buscar ocorrências:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Busca inicial quando a tela carrega
  useEffect(() => {
    setLoading(true);
    fetchMyOccurrences();
  }, [session]); // Roda sempre que a sessão mudar

  // Função para "Puxar para atualizar"
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyOccurrences();
  }, [session]); // Garante que temos a sessão mais recente

  // Função local para deletar
  const deleteOccurrence = async (id: string) => {
    try {
      const { error } = await supabase
        .from('Ocorrencia')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualiza o estado local
      setMyOccurrences((current) => current.filter((item) => item.id !== id));
      Alert.alert('Sucesso', 'Ocorrência removida.');
    } catch (error: any) {
      console.error('Erro ao deletar:', error.message);
      Alert.alert('Erro', 'Não foi possível deletar.');
    }
  }

  function showDeleteAlert(id: string) {
    if (Platform.OS === 'web') {
      const result = confirm("Excluir item?");
      if (result) deleteOccurrence(id)
      return;
    }

    Alert.alert(
      'Excluir item',
      'Tem certeza que deseja excluir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteOccurrence(id) },
      ],
      { cancelable: true }
    );
  }

  const renderItem = ({ item }: { item: Occurrence }) => (
    <View style={styles.occurrenceCard}>
      <View style={styles.occurrenceHeader}>
        <Text style={styles.typeBadge}>{item.type}</Text>
      </View>

      {/* Descrição adicionada */}
      <Text style={styles.descriptionText}>{item.description}</Text>

      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }} // 👈 Corrigido para usar a URL do item
          style={styles.occurrenceImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.occurrenceImage, styles.imagePlaceholder]}>
          <Ionicons name="image" size={42} color="#888" />
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.iconButton} disabled={true}>
          <Ionicons name="thumbs-up" size={22} color="#1976d2" />
          <Text style={styles.iconCounter}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => showDeleteAlert(item.id)}>
          <MaterialIcons name="delete" size={24} color="#555" />
        </TouchableOpacity>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Minhas Ocorrências</Text>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Erro: {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchMyOccurrences}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={myOccurrences} // 👈 Corrigido para usar o estado local
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={myOccurrences.length === 0 ? styles.emptyContainer : styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh} // 👈 Corrigido para usar a função certa
          ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não registrou ocorrências.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: { // 👈 Adicionado para padding
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginTop: 25,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  occurrenceCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  occurrenceHeader: {
    alignItems: 'flex-start', // 👈 Alinhado à esquerda
    marginBottom: 10,
  },
  descriptionText: { // 👈 Adicionado
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#fafafa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    alignSelf: 'flex-start', // 👈 Garante que ele não estique
  },
  occurrenceImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, // 👈 Alterado para 'space-between'
  iconButton: { flexDirection: 'row', alignItems: 'center' },
  iconCounter: { marginLeft: 4, fontSize: 13, fontWeight: '600', color: '#1976d2' },
  statusBadge: {
    paddingHorizontal: 12, // 👈 Diminuído
    paddingVertical: 8,  // 👈 Diminuído
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fafafa',
  },
  statusText: { fontSize: 14, fontWeight: '600', color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#d32f2f', marginBottom: 12, fontSize: 16, fontWeight: '600' },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#6200ee',
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  emptyText: { color: '#777', fontSize: 15 },
});