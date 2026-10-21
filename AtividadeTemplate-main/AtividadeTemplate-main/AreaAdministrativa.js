import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
    Appbar,
    Card,
    Text,
    Button,
    TextInput,
    Portal,
    Dialog,
    ActivityIndicator,
    IconButton,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from './api';

const AreaAdministrativa = ({ navigation }) => {
    const [token, setToken] = useState(null);
    const [verificandoAuth, setVerificandoAuth] = useState(true);
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

    // Verifica autenticação sempre que a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            const verificarAcesso = async () => {
                setVerificandoAuth(true);
                try {
                    const userToken = await AsyncStorage.getItem('userToken');
                    if (!userToken) {
                        alert('Acesso negado: Somente usuários autenticados podem acessar a área administrativa.');
                        navigation.replace('Login');
                        return;
                    }
                    setToken(userToken);
                    carregarConteudos();
                } catch (error) {
                    console.error('Erro ao verificar autenticação:', error);
                    navigation.replace('Login');
                } finally {
                    setVerificandoAuth(false);
                }
            };

            verificarAcesso();
        }, [navigation])
    );

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
        if (!titulo.trim() || !imagemUrl.trim()) {
            alert('Por favor, preencha o título e a URL da imagem.');
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
                    imagemUrl: imagemUrl.trim(),
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

    if (verificandoAuth) {
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
                        {itemEditando ? 'Editar Conteúdo / Imagem' : 'Novo Conteúdo'}
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
                            <TextInput
                                label="URL da Imagem *"
                                placeholder="Ex: https://picsum.photos/700"
                                value={imagemUrl}
                                onChangeText={setImagemUrl}
                                mode="outlined"
                                autoCapitalize="none"
                                style={estilos.input}
                            />
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
        maxHeight: '80%',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
    },
});

export default AreaAdministrativa;
