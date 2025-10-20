import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons'; // adicionar import
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

export default function HomeScreen() {
  const [posts, setPosts] = useState<Array<{ image?: string; description?: string; likes?: number }> | null>(null);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  const fetchPosts = async () => {
    setLoading(true);
    try {
      console.log('[fetchPosts] iniciando...');
      const { data, error, status } = await supabase
        .from('publicacao')
        .select('url_imagem, descricao, likes'); // ou .select('*')

      console.log('[fetchPosts] status:', status);
      console.log('[fetchPosts] error:', error);
      console.log('[fetchPosts] data (raw):', data);

      if (error) {
        console.error('[fetchPosts] erro do supabase:', error);
        setPosts([]);
        return;
      }

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log('[fetchPosts] sem dados retornados.');
        setPosts([]);
        return;
      }

      const mapped = (data as Array<any>).map(item => ({
        // Corrigindo o nome do campo para url_imagem
        image: item.url_imagem || null, // adicionar fallback para null
        description: item.descricao,
        likes: item.likes,
      }));
      setPosts(mapped);
    } catch (e) {
      console.error('[fetchPosts] exceção:', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };
  fetchPosts();
}, []);


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Arruma Ai</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.iconCircle}>
            <TouchableOpacity style={styles.iconCircle}
            onPress={() => router.push('/dados-pessoais')}>
                <AntDesign name="user" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>   

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#999" style={{ marginTop: 40 }} />
        ) : posts && posts.length > 0 ? (
          posts.map((post, idx) => (
            <View style={styles.card} key={idx}>
              <View style={styles.cardImage}>
                {post.image ? (
                  <Image source={{ uri: post.image }} style={styles.image} />
                ) : (
                  <View style={{ width: '100%', height: '100%', backgroundColor: '#DDD', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#888' }}>Nenhuma imagem</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.likes}>
                  <AntDesign name="heart" size={18} color="#3b82f6" style={{ marginRight: 8 }} />
                  <Text style={styles.likesText}>{post.likes ?? 0}</Text>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {post.description ?? 'Sem descrição.'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>Nenhum post encontrado.</Text>
        )}
        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
    backgroundColor: '#EEE',
    justifyContent: 'center', // centralizar ícone
    alignItems: 'center',     // centralizar ícone
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    height: 200, // altura fixa um pouco maior
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // garante que a imagem não vaze
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // mudando para contain ao invés de cover
    backgroundColor: '#f8f8f8', // fundo suave para imagens menores
  },
  cardFooter: {
    padding: 12,
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  likesText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  cardDescription: {
    color: '#444',
  },
});