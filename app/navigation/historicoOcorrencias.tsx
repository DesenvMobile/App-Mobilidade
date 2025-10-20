import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOccurrences } from "../contexts/occurrencesContext";

interface Occurrence {
  id: string;
  type: string;          // tipo da ocorrência
  imageUrl?: string;     // URL absoluta ou relativa da imagem
  likes: number;
  status: string;        // Ex: 'Em Análise', 'Concluído'
}

const API_BASE = 'https://seu-backend.com/api'; // ajuste
console.log('Teste')
console.log(process.env.EXPO_PUBLIC_USE_BACKEND)
const USE_BACKEND = JSON.parse(process.env.EXPO_PUBLIC_USE_BACKEND!);

export default function HistoricoOcorrenciasScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { occurrences: data, deleteOccurrence } = useOccurrences();


  const onRefresh = useCallback(() => {
    setRefreshing(false);
  }, []);

  // const handleLike = async (id: string) => {
  //   // Otimista
  //   setData(prev => prev.map(o => o.id === id ? { ...o, likes: o.likes + 1 } : o));
  //   try {
  //     await fetch(`${API_BASE}/occurrences/${id}/like`, { method: 'POST' });
  //   } catch {
  //     // Reverter se falhar (simplificado)
  //     setData(prev => prev.map(o => o.id === id ? { ...o, likes: o.likes - 1 } : o));
  //   }
  // };

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

      {item.imageUrl ? (
        <Image
          source={require('../../assets/images/cratera.webp')}
          style={styles.occurrenceImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.occurrenceImage, styles.imagePlaceholder]}>
          <Ionicons name="image" size={42} color="#888" />
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.iconButton}>
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
        <Text style={styles.cardTitle}>Histórico de Ocorrências</Text>
      </View>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}
      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Erro: {error}</Text>
          <TouchableOpacity style={styles.retryBtn}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}
      {!loading && !error && (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={data.length === 0 ? styles.emptyContainer : undefined}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma ocorrência ainda.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
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
    maxWidth: 500,
    width: '90%',          // largura responsiva
    alignSelf: 'center',   // centraliza horizontalmente
  },
  occurrenceHeader: {
    alignItems: 'center',
    marginBottom: 10,
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
  },
  occurrenceImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  iconButton: { flexDirection: 'row', alignItems: 'center' },
  iconCounter: { marginLeft: 4, fontSize: 13, fontWeight: '600', color: '#1976d2' },
  statusBadge: {
    paddingHorizontal: 26,
    paddingVertical: 10,
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
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#777', fontSize: 15 },
});
