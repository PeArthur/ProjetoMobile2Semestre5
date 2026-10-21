import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import {
    Appbar,
    Card,
    Text,
    Button,
    TextInput,
    Portal,
    Dialog,
    ActivityIndicator,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from './AuthContext';
import API_URL from './api';

const AreaAdministrativa = ({ navigation }) => {
    const { token, isLoggedIn, loadingAuth } = useAuth();
    const [conteudos, setConteudos] = useState([]);
    const [carregando, setCarregando] = useState(false);

    // Modal de Cadastro/Edição
    const [modalFormVisivel, setModalFormVisivel] = useState(false);
    const [itemEditando, setItemEditando] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [imagemUrl, setImagemUrl] = useState('');
    const [categoria, setCategoria] = useState('');
    const [salvando, setSalvando] = useState(false);

    // Dialog de Exclusão
    const [dialogExcluirVisivel, setDialogExcluirVisivel] = useState(false);
    const [itemExcluir, setItemExcluir] = useState(null);
    const [excluindo, setExcluindo] = useState(false);

    // Proteção de rota via AuthContext
    useEffect(() => {
        if (!loadingAuth && !isLoggedIn) {
            alert('Acesso negado: Somente usuários autenticados podem acessar a área administrativa.');
            navigation.replace('Login');
        } else if (isLoggedIn) {
            carregarConteudos();
        }
    }, [isLoggedIn, loadingAuth, navigation]);

    // Carregar conteúdos do backend
    const carregarConteudos = async () => {
        setCarregando(true);
        try {
            const resposta = await fetch(`${API_URL}/contents`);
            if (resposta.ok) {
                const dados = await resposta.json();
                setConteudos(dados);
            } else {
                alert('Erro ao carregar conteúdos.');
            }
        } catch (error) {
            console.error('Erro ao buscar conteúdos:', error);
            alert('Não foi possível conectar ao servidor.');
        } finally {
            setCarregando(false);
        }
    };

    // Selecionar imagem usando expo-image-picker
    const selecionarImagem = async () => {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissao.granted) {
            alert('Precisamos de permissão para acessar suas fotos.');
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
            base64: true,
        });

        if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
            const asset = resultado.assets[0];
            const fotoUri = asset.base64
                ? `data:image/jpeg;base64,${asset.base64}`
                : asset.uri;
            setImagemUrl(fotoUri);
        }
    };

    // Abrir formulário para novo conteúdo
    const abrirNovo = () => {
        setItemEditando(null);
        setTitulo('');
        setDescricao('');
        setImagemUrl('');
        setCategoria('');
        setModalFormVisivel(true);
    };

    // Abrir formulário para edição de conteúdo
    const abrirEditar = (item) => {
        setItemEditando(item);
        setTitulo(item.titulo || '');
        setDescricao(item.descricao || '');
        setImagemUrl(item.imagemUrl || '');
        setCategoria(item.categoria || '');
        setModalFormVisivel(true);
    };

    // Salvar (Criar ou Atualizar)
    const salvarConteudo = async () => {
        if (!titulo.trim() || !imagemUrl) {
            alert('Por favor, preencha o título e selecione uma imagem.');
            return;
        }

        setSalvando(true);
        try {
            const url = itemEditando
                ? `${API_URL}/contents/${itemEditando._id}`
                : `${API_URL}/contents`;
            const method = itemEditando ? 'PUT' : 'POST';

            const resposta = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    titulo: titulo.trim(),
                    descricao: descricao.trim(),
                    imagemUrl: imagemUrl,
                    categoria: categoria.trim(),
                }),
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert(itemEditando ? 'Conteúdo atualizado com sucesso!' : 'Conteúdo cadastrado com sucesso!');
                setModalFormVisivel(false);
                carregarConteudos();
            } else {
                alert(dados.mensagem || 'Erro ao salvar conteúdo.');
            }
        } catch (error) {
            console.error('Erro ao salvar conteúdo:', error);
            alert('Não foi possível conectar ao servidor.');
        } finally {
            setSalvando(false);
        }
    };

    // Confirmar exclusão
    const abrirConfirmarExclusao = (item) => {
        setItemExcluir(item);
        setDialogExcluirVisivel(true);
    };

    // Executar exclusão
    const confirmarExclusao = async () => {
        if (!itemExcluir) return;

        setExcluindo(true);
        try {
            const resposta = await fetch(`${API_URL}/contents/${itemExcluir._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert('Conteúdo excluído com sucesso!');
                setDialogExcluirVisivel(false);
                setItemExcluir(null);
                carregarConteudos();
            } else {
                alert(dados.mensagem || 'Erro ao excluir conteúdo.');
            }
        } catch (error) {
            console.error('Erro ao excluir conteúdo:', error);
            alert('Não foi possível conectar ao servidor.');
        } finally {
            setExcluindo(false);
        }
    };

    if (loadingAuth || !isLoggedIn) {
        return (
            <View style={estilos.carregandoContainer}>
                <ActivityIndicator size="large" color="#F2A900" />
                <Text style={{ marginTop: 15 }}>Verificando permissões de acesso...</Text>
            </View>
        );
    }

    return (
        <View style={estilos.container}>
            {/* CABEÇALHO */}
            <Appbar.Header style={estilos.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Área Administrativa" subtitle="Gerenciamento de conteúdos" />
                <Appbar.Action icon="refresh" onPress={carregarConteudos} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={estilos.content}>
                {/* BOTÃO CADASTRAR NOVO */}
                <Button
                    mode="contained"
                    icon="plus"
                    buttonColor="#F2A900"
                    textColor="#FFFFFF"
                    style={estilos.botaoNovo}
                    onPress={abrirNovo}
                >
                    CADASTRAR NOVO CONTEÚDO
                </Button>

                <Text variant="titleMedium" style={estilos.subtitulo}>
                    Conteúdos Cadastrados ({conteudos.length})
                </Text>

                {carregando ? (
                    <ActivityIndicator size="small" color="#F2A900" style={{ marginTop: 20 }} />
                ) : conteudos.length === 0 ? (
                    <Text style={estilos.vazioTexto}>
                        Nenhum conteúdo cadastrado ainda. Clique no botão acima para adicionar.
                    </Text>
                ) : (
                    conteudos.map((item) => (
                        <Card key={item._id} style={estilos.card}>
                            <Card.Title
                                title={item.titulo}
                                subtitle={item.categoria || 'Sem categoria'}
                            />
                            {item.imagemUrl ? (
                                <Card.Cover source={{ uri: item.imagemUrl }} style={estilos.cardCover} />
                            ) : null}

                            {item.descricao ? (
                                <Card.Content style={{ paddingTop: 8 }}>
                                    <Text variant="bodyMedium">{item.descricao}</Text>
                                </Card.Content>
                            ) : null}

                            <Card.Actions style={estilos.cardActions}>
                                <Button
                                    mode="outlined"
                                    icon="pencil"
                                    onPress={() => abrirEditar(item)}
                                    style={{ marginRight: 8 }}
                                >
                                    Editar imagem
                                </Button>
                                <Button
                                    mode="contained"
                                    buttonColor="#D32F2F"
                                    textColor="#FFFFFF"
                                    icon="delete"
                                    onPress={() => abrirConfirmarExclusao(item)}
                                >
                                    Excluir imagem
                                </Button>
                            </Card.Actions>
                        </Card>
                    ))
                )}
            </ScrollView>

            {/* MODAL / FORMULÁRIO DE CADASTRO E EDIÇÃO */}
            <Portal>
                <Dialog
                    visible={modalFormVisivel}
                    onDismiss={() => setModalFormVisivel(false)}
                    style={estilos.dialog}
                >
                    <Dialog.Title>
                        {itemEditando ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                    </Dialog.Title>
                    <Dialog.ScrollArea>
                        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                            <TextInput
                                label="Título *"
                                placeholder="Ex: Breaking Bad"
                                value={titulo}
                                onChangeText={setTitulo}
                                mode="outlined"
                                style={estilos.input}
                            />
                            <TextInput
                                label="Categoria"
                                placeholder="Ex: Série, Tecnologia, Ação"
                                value={categoria}
                                onChangeText={setCategoria}
                                mode="outlined"
                                style={estilos.input}
                            />

                            {/* CAMPO DE UPLOAD DE IMAGEM COM EXPO-IMAGE-PICKER */}
                            <View style={estilos.uploadContainer}>
                                <Text variant="labelLarge" style={estilos.uploadLabel}>
                                    Imagem do Conteúdo *
                                </Text>

                                {imagemUrl ? (
                                    <View style={estilos.previewContainer}>
                                        <Image
                                            source={{ uri: imagemUrl }}
                                            style={estilos.previewImagem}
                                        />
                                        <Button
                                            mode="outlined"
                                            icon="camera"
                                            onPress={selecionarImagem}
                                            style={estilos.botaoTrocarImagem}
                                        >
                                            Trocar Imagem
                                        </Button>
                                    </View>
                                ) : (
                                    <Button
                                        mode="outlined"
                                        icon="image-plus"
                                        onPress={selecionarImagem}
                                        style={estilos.botaoUpload}
                                    >
                                        Selecionar Imagem da Galeria
                                    </Button>
                                )}
                            </View>

                            <TextInput
                                label="Descrição"
                                placeholder="Breve descrição do conteúdo"
                                value={descricao}
                                onChangeText={setDescricao}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={estilos.input}
                            />
                        </ScrollView>
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={() => setModalFormVisivel(false)} disabled={salvando}>
                            Cancelar
                        </Button>
                        <Button
                            mode="contained"
                            buttonColor="#F2A900"
                            textColor="#FFFFFF"
                            onPress={salvarConteudo}
                            loading={salvando}
                            disabled={salvando}
                        >
                            Salvar
                        </Button>
                    </Dialog.Actions>
                </Dialog>

                {/* DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO */}
                <Dialog
                    visible={dialogExcluirVisivel}
                    onDismiss={() => setDialogExcluirVisivel(false)}
                >
                    <Dialog.Title>Confirmar Exclusão</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Deseja realmente excluir o conteúdo "{itemExcluir?.titulo}"?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogExcluirVisivel(false)} disabled={excluindo}>
                            Cancelar
                        </Button>
                        <Button
                            buttonColor="#D32F2F"
                            textColor="#FFFFFF"
                            mode="contained"
                            onPress={confirmarExclusao}
                            loading={excluindo}
                            disabled={excluindo}
                        >
                            Excluir
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const estilos = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    carregandoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#C0C0C0',
    },
    content: {
        padding: 15,
        paddingBottom: 40,
    },
    botaoNovo: {
        marginBottom: 15,
        borderRadius: 5,
        paddingVertical: 4,
    },
    subtitulo: {
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333333',
    },
    vazioTexto: {
        textAlign: 'center',
        color: '#666666',
        marginTop: 20,
    },
    card: {
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        elevation: 3,
    },
    cardCover: {
        height: 180,
    },
    cardActions: {
        justifyContent: 'flex-end',
        padding: 8,
    },
    dialog: {
        maxHeight: '85%',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
    },
    uploadContainer: {
        marginBottom: 12,
    },
    uploadLabel: {
        marginBottom: 6,
        color: '#444444',
    },
    botaoUpload: {
        borderColor: '#F2A900',
        paddingVertical: 8,
    },
    previewContainer: {
        alignItems: 'center',
    },
    previewImagem: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
    },
    botaoTrocarImagem: {
        marginTop: 8,
    },
});

export default AreaAdministrativa;
