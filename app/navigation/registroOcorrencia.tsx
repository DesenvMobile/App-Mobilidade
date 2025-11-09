import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

// 1. Importa o 'supabase' E o 'useAuth' do seu contexto
import { supabase, useAuth } from '../contexts/AuthContext';

export default function RegistroOcorrenciaScreen() {
  // 2. Pega a sessão do usuário logado
  const { session } = useAuth();

  const [tipoOcorrencia, setTipoOcorrencia] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [imagens, setImagens] = useState<string[]>([]);
  const [localizacao, setLocalizacao] = useState<string | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [ocorrenciaOpen, setOcorrenciaOpen] = useState(false);
  const [ocorrenciaItems, setOcorrenciaItems] = useState([
    { label: "Buraco na rua", value: "Buraco na rua" },
    { label: "Buraco na calçada", value: "Buraco na calçada" },
    { label: "Poste quebrado", value: "Poste quebrado" },
    { label: "Iluminação precária", value: "Iluminação precária" },
    { label: "Sinalização precária", value: "Sinalização precária" },
  ]);

  const [bairroOpen, setBairroOpen] = useState(false);
  const [selectedBairro, setSelectedBairro] = useState<number | null>(null);
  const [bairroItems, setBairroItems] = useState<{ label: string; value: number }[]>([]);

  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [manual, setManual] = useState({ rua: '', numero: '', cep: '' });

  useEffect(() => {
    async function fetchBairros() {
      const { data, error } = await supabase
        .from('Bairro')
        .select('id, nome:nome_bairro');

      if (error) {
        Alert.alert('Erro ao carregar bairros', error.message);
      } else if (data) {
        const formattedBairros = data.map(item => ({
          label: item.nome,
          value: item.id
        }));
        setBairroItems(formattedBairros);
      }
    }
    fetchBairros();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      selectionLimit: 0,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagens([...imagens, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const usarLocalizacaoAtual = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'O app precisa da sua localização.');
      return;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = pos.coords;
    setGpsCoords({ latitude, longitude });
    setSelectedBairro(null);
    setManual({ rua: '', numero: '', cep: '' });
    const endereco = `📍 GPS: Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
    setLocalizacao(endereco);
    setModalVisivel(false);
  };

  const salvarManual = () => {
    if (!selectedBairro || !manual.rua) {
      Alert.alert('Campos obrigatórios', 'Informe pelo menos bairro e rua.');
      return;
    }
    setGpsCoords(null);
    const nomeBairro = bairroItems.find(b => b.value === selectedBairro)?.label || '';
    const endereco = `${manual.cep},${manual.rua}, ${manual.numero || 's/n'} - ${nomeBairro}`;
    setLocalizacao(endereco);
    setModalVisivel(false);
  };

  const uploadImage = async (uri: string) => {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      let uploadData: ArrayBuffer | string | Blob;
      let contentType: string;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        uploadData = blob;
        contentType = blob.type || 'image/jpeg';
      } else {
        const response = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        uploadData = decode(response);
        contentType = 'image/jpeg';
      }

      const { data, error } = await supabase.storage
        .from('ocorrencias-imagens')
        .upload(fileName, uploadData, {
          contentType: contentType,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('ocorrencias-imagens')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error.message);
      throw error;
    }
  };

  const handleSalvar = async () => {
    if (!tipoOcorrencia || !localizacao) {
      Alert.alert('Campos obrigatórios', 'Por favor, informe o Tipo e a Localização.');
      return;
    }

    // 3. Pega o ID do usuário logado
    const userId = session?.user?.id;
    if (!userId) {
      Alert.alert('Erro', 'Sessão não encontrada. Por favor, faça o login novamente.');
      return;
    }

    setIsLoading(true);
    let enderecoId = null;
    let uploadedImageUrls: string[] = [];

    try {
      if (imagens.length > 0) {
        const uploadPromises = imagens.map(imageUri => uploadImage(imageUri));
        uploadedImageUrls = await Promise.all(uploadPromises);
      }

      let enderecoData: any = {
        id_cidade: 1,
        id_estado: 1,
      };

      if (gpsCoords) {
        enderecoData = {
          ...enderecoData,
          latitude: gpsCoords.latitude,
          longitude: gpsCoords.longitude,
        };
      } else if (selectedBairro) {
        const numeroInt = manual.numero ? parseInt(manual.numero, 10) : null;
        if (manual.numero && isNaN(numeroInt!)) {
          throw new Error('O "Número" do endereço deve ser um valor numérico.');
        }

        enderecoData = {
          ...enderecoData,
          id_bairro: selectedBairro,
          rua: manual.rua,
          numero: numeroInt,
          cep: manual.cep,
        };
      } else {
        throw new Error('Dados de localização inválidos.');
      }

      const { data: enderecoSalvo, error: errorEndereco } = await supabase
        .from('Endereco')
        .insert(enderecoData)
        .select('id')
        .single();

      if (errorEndereco) throw errorEndereco;
      if (!enderecoSalvo) throw new Error("Não foi possível obter o ID do endereço salvo.");

      enderecoId = enderecoSalvo.id;

      const novaOcorrencia = {
        titulo_ocorrencia: tipoOcorrencia,
        descricao_ocorrencia: descricao,
        id_localizacao: enderecoId,
        urls_imagens: uploadedImageUrls,
        usuario_id: userId, // 👈 4. ADICIONA O ID DO USUÁRIO
      };

      const { error: errorOcorrencia } = await supabase
        .from('Ocorrencia')
        .insert(novaOcorrencia);

      if (errorOcorrencia) throw errorOcorrencia;

      setIsLoading(false);
      Alert.alert('Sucesso!', 'Ocorrência registrada.');

      setTipoOcorrencia(null);
      setDescricao('');
      setImagens([]);
      setLocalizacao(null);
      setManual({ rua: '', numero: '', cep: '' });
      setSelectedBairro(null);
      setGpsCoords(null);

    } catch (error: any) {
      setIsLoading(false);
      console.error('Erro ao salvar:', error.message);
      Alert.alert('Erro ao Salvar', `Não foi possível registrar: ${error.message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Registrar uma ocorrência</Text>

            <DropDownPicker
              open={ocorrenciaOpen}
              value={tipoOcorrencia}
              items={ocorrenciaItems}
              setOpen={setOcorrenciaOpen}
              setValue={setTipoOcorrencia}
              setItems={setOcorrenciaItems}
              placeholder="Tipo da ocorrência"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              containerStyle={{ zIndex: 3000, width: '100%' }}
              listMode="MODAL"
              onOpen={() => setBairroOpen(false)}
            />

            <TextInput
              style={styles.textArea}
              placeholder="Descrição do problema"
              placeholderTextColor="#888"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={5}
            />

            <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
              <Text style={styles.attachText}>Anexar imagem</Text>
              <MaterialIcons name="attach-file" size={22} color="#888" />
            </TouchableOpacity>

            {imagens.length > 0 && (
              <View style={{ marginBottom: 12, width: '100%' }}>
                <Text style={{ fontSize: 14, color: '#333' }}>Imagens selecionadas:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                  {imagens.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.trashButton}
                  onPress={() => setImagens(imagens.slice(0, -1))}
                >
                  <MaterialIcons name="delete" size={24} color="#e53935" />
                  <Text style={styles.trashText}>Remover última imagem</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setModalVisivel(true)}
            >
              <Text style={styles.locationText}>Adicionar Localização</Text>
              <Ionicons name="location-outline" size={22} color="#888" />
            </TouchableOpacity>

            {localizacao && (
              <Text style={{ color: '#333', marginBottom: 10 }}>
                {localizacao}
              </Text>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelButton} disabled={isLoading}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSalvar}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Modal visible={modalVisivel} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKav}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Selecionar Localização</Text>

                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={usarLocalizacaoAtual}
                  >
                    <Text style={styles.optionText}>Usar minha localização atual</Text>
                  </TouchableOpacity>

                  <Text style={{ marginVertical: 10, textAlign: 'center', color: '#888' }}>ou</Text>

                  <DropDownPicker
                    open={bairroOpen}
                    value={selectedBairro}
                    items={bairroItems}
                    setOpen={setBairroOpen}
                    setValue={setSelectedBairro}
                    setItems={setBairroItems}
                    placeholder="Selecione o bairro..."
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    containerStyle={{ zIndex: 2000, width: '100%' }}
                    listMode="MODAL"
                    searchable={true}
                    placeholderStyle={{ color: '#888' }}
                    onOpen={() => setOcorrenciaOpen(false)}
                  />

                  <TextInput
                    placeholder="Cep (opcional)"
                    style={styles.input}
                    value={manual.cep}
                    onChangeText={(t) => setManual({ ...manual, cep: t })}
                  />
                  <TextInput
                    placeholder="Rua"
                    style={styles.input}
                    value={manual.rua}
                    onChangeText={(t) => setManual({ ...manual, rua: t })}
                  />
                  <TextInput
                    placeholder="Número (opcional)"
                    style={styles.input}
                    value={manual.numero}
                    keyboardType="numeric"
                    onChangeText={(t) => setManual({ ...manual, numero: t })}
                  />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: '#e53935' }]}
                      onPress={() => setModalVisivel(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: '#43a047' }]}
                      onPress={salvarManual}
                    >
                      <Text style={styles.modalButtonText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>

        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  content: {
    width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', elevation: 5,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#333', textAlign: 'center' },
  dropdown: {
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    marginBottom: 15,
  },
  dropdownContainer: {
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  pickerContainer: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15, backgroundColor: '#fafafa', overflow: 'hidden' },
  picker: { width: '100%', height: 50, color: '#333' },
  textArea: {
    width: '100%', minHeight: 100, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15, fontSize: 16, textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  attachButton: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 12, justifyContent: 'space-between', backgroundColor: '#fafafa' },
  attachText: { fontSize: 16, color: '#333' },
  locationButton: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 18, justifyContent: 'space-between', backgroundColor: '#fafafa' },
  locationText: { fontSize: 16, color: '#333' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  cancelButton: { flex: 1, height: 45, backgroundColor: '#e53935', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cancelText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  saveButton: { flex: 1, height: 45, backgroundColor: '#43a047', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  saveButtonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  saveText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  trashButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#fff0f0' },
  trashText: { color: '#e53935', fontSize: 15, marginLeft: 6, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalKav: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10, width: '100%' },
  modalButton: { flex: 1, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  optionButton: { backgroundColor: '#eee', borderRadius: 8, padding: 12, alignItems: 'center', width: '100%' },
  optionText: { fontSize: 16, color: '#333', fontWeight: '500' },
});