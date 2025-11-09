import { AntDesign } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react'; // 👈 Importe useEffect
import {
  ActivityIndicator,
  Alert,
  Image, // 👈 Importe ActivityIndicator
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from './contexts/AuthContext'; // 👈 Importe o supabase do AuthContext

export default function ProfileScreen() {
  const router = useRouter();

  // --- STATE ---
  const [nome, setNome] = useState(''); // 👈 Alterado
  const [email, setEmail] = useState(''); // 👈 Alterado
  const [cpf, setCpf] = useState(''); // 👈 Alterado
  const [password, setPassword] = useState(''); // Para a nova senha
  const [loading, setLoading] = useState(true); // Para carregar os dados iniciais
  const [saving, setSaving] = useState(false); // Para o botão de salvar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // URL da foto de perfil
  const [uploadingAvatar, setUploadingAvatar] = useState(false); // loading de upload

  // --- BUSCAR DADOS ---
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // 1. Pega o usuário da sessão (auth)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error(authError?.message || "Usuário não encontrado");

        setEmail(user.email || '');

        // 2. Pega os dados do perfil (tabela Perfil)
        const { data: profileData, error: profileError } = await supabase
          .from('Perfil')
          .select('nome, cpf, avatar_url') // Puxa nome, cpf e avatar
          .eq('id', user.id) // Onde o id é o mesmo do usuário logado
          .single(); // Espera apenas um resultado

        if (profileError) {
          console.warn("Não foi possível carregar o perfil:", profileError.message);
        } else if (profileData) {
          setNome(profileData.nome || '');
          setCpf(profileData.cpf || '');
          setAvatarUrl(profileData.avatar_url || null);
        }
      } catch (error: any) {
        console.error("Erro ao buscar dados do usuário:", error.message);
        // O "porteiro" no _layout já deve ter pego o erro de sessão
        // mas caso não, avisamos o usuário.
        Alert.alert('Erro', 'Não foi possível carregar seus dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []); // Roda apenas uma vez quando a tela é montada

  // --- HANDLERS ---
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Atualiza o nome na tabela 'Perfil'
      const { error: profileError } = await supabase
        .from('Perfil')
        .update({ nome: nome })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Se o campo "Nova Senha" foi preenchido, atualiza a senha
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });
        if (passwordError) throw passwordError;
      }

      Alert.alert('Sucesso', 'Dados salvos com sucesso!');
      setPassword(''); // Limpa o campo de senha

    } catch (error: any) {
      console.error("Erro ao salvar:", error.message);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    setSaving(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erro', 'Não foi possível sair.');
      setSaving(false);
    } else {
      // O _layout.tsx vai detectar a mudança de sessão e redirecionar
      router.replace('/login');
    }
  };

  // --- AVATAR UPLOAD ---
  const pickAndUploadAvatar = async () => {
    try {
      // Pede permissão à galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Conceda acesso às fotos para atualizar seu avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
        selectionLimit: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      const asset = result.assets[0];
      setUploadingAvatar(true);

      // Lê o arquivo e prepara upload
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      let uploadData: ArrayBuffer | Blob;
      let contentType = 'image/jpeg';

      if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        uploadData = blob;
        contentType = blob.type || 'image/jpeg';
      } else {
        const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
        uploadData = decode(base64);
      }

      // Faz upload no bucket (assumindo que exista 'perfil-imagens')
      const { data: uploadRes, error: uploadError } = await supabase.storage
        .from('perfil-imagens')
        .upload(fileName, uploadData, { contentType, upsert: true });

      if (uploadError) throw uploadError;

      // Obtém URL pública
      const { data: publicData } = supabase.storage
        .from('perfil-imagens')
        .getPublicUrl(uploadRes.path);

      const publicUrl = publicData.publicUrl;

      // Atualiza tabela Perfil
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada');
      const { error: updateError } = await supabase
        .from('Perfil')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      Alert.alert('Avatar atualizado!', 'Sua foto de perfil foi alterada.');
    } catch (e: any) {
      console.error('Erro ao atualizar avatar:', e.message);
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- RENDER ---

  // Mostra um loading full-screen enquanto busca os dados
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Padronizado */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleGoBack}>
            <AntDesign name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Image (clicável) */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickAndUploadAvatar} activeOpacity={0.8} style={styles.avatarWrapper}>
            <Image
              source={{ uri: avatarUrl || 'https://placehold.co/100x100/EFEFEF/333?text=Foto' }}
              style={styles.profileImage}
            />
            {uploadingAvatar && (
              <View style={styles.avatarUploadingOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Toque na foto para alterar</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo</Text>
          {/* Este campo agora é editável */}
          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Email (não editável)</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledInputText}>{email}</Text>
          </View>

          <Text style={styles.label}>CPF (não editável)</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledInputText}>{cpf}</Text>
          </View>

          <Text style={styles.label}>Nova Senha (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite uma nova senha"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={saving || loading}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>

          {/* Botão de Logout Adicionado */}
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
            disabled={saving || loading}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#e53935" />
            ) : (
              <Text style={styles.logoutButtonText}>Sair (Logout)</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  loadingContainer: { // Adicionado
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header Styles
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  // Content Styles
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarUploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHint: {
    marginTop: 10,
    fontSize: 13,
    color: '#777',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
  },
  disabledInput: {
    backgroundColor: '#EFEFEF',
    borderColor: '#E0E0E0',
  },
  disabledInputText: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: { // Adicionado
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#e53935',
    marginTop: 12,
  },
  logoutButtonText: { // Adicionado
    color: '#e53935',
    fontSize: 16,
    fontWeight: 'bold',
  },
});