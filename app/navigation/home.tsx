import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// 1. ✅ Importe o Contexto de Ocorrências
import { useOccurrences, Occurrence } from '../contexts/occurrencesContext';
// 2. ✅ Importe o Supabase central do AuthContext
import { supabase } from '../contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  // 3. ✅ Use os dados do Contexto
  const { occurrences, loading: contextLoading, refreshOccurrences } = useOccurrences();
  const [refreshing, setRefreshing] = useState(false);

  // 4. ✅ Adiciona a função de Like
  const handleLike = async (id: string) => {
    try {
      // Chama a função SQL 'increment_like' que criamos no Supabase
      const { error } = await supabase.rpc('increment_like', {
        ocorrencia_id_param: id
      });

      if (error) {
        throw error;
      }

      // Atualiza a lista localmente após o sucesso
      refreshOccurrences();

    } catch (error: any) {
      console.error("Erro ao curtir:", error.message);
      Alert.alert('Erro', 'Não foi possível registrar seu like.');
    }
  };

  // 5. ✅ Adiciona a função de "Puxar para atualizar"
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOccurrences(); // Recarrega os dados do contexto
    setRefreshing(false);
  }, []);

  // 6. ✅ Renderiza cada item do feed
  const renderItem = ({ item }: { item: Occurrence }) => (
    <View style={styles.card}>
      {/* Imagem */}
      <View style={styles.cardImage}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={50} color="#ccc" />
          </View>
        )}
      </View>

      {/* Conteúdo (Tipo, Descrição, Likes) */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardType} numberOfLines={1}>{item.type}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description ?? 'Sem descrição.'}
        </Text>

        <View style={styles.actionsRow}>
          {/* Botão de Like */}
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
            <AntDesign name="like" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>{item.likes ?? 0}</Text>
          </TouchableOpacity>

          {/* Status */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

      </View>
    </View>
  );

  // --- RENDER PRINCIPAL ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Arruma Ai</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => router.push('/dados-pessoais')}
          >
            <AntDesign name="user" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {contextLoading && occurrences.length === 0 ? (
        <ActivityIndicator size="large" color="#6200ee" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={occurrences}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6200ee']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma ocorrência registrada.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90, // Espaço para a barra de tabs
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardImage: {
    height: 220,
    backgroundColor: '#EEE',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    padding: 14,
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    color: '#3b82f6',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: '#FFC107',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
  },
});