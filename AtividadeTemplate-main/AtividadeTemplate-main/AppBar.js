import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Appbar, ActivityIndicator, Portal, Dialog, Button, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './css/Styles';
import ModCard from './Cards';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import API_URL from './api';

const AppBar = ({ navigation }) => {
    const { user, isLoggedIn, token } = useAuth();
    const [conteudos, setConteudos] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [categoriaAtiva, setCategoriaAtiva] = useState('TODAS');

    // Estado do Modal de Edição
    const [modalEditVisivel, setModalEditVisivel] = useState(false);
    const [itemEditando, setItemEditando] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [imagemUrl, setImagemUrl] = useState('');
    const [categoria, setCategoria] = useState('');
    const [salvando, setSalvando] = useState(false);

    // Estado do Dialog de Exclusão
    const [dialogExcluirVisivel, setDialogExcluirVisivel] = useState(false);
    const [itemExcluir, setItemExcluir] = useState(null);
    const [excluindo, setExcluindo] = useState(false);

    // Recarrega conteúdos sempre que a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            carregarConteudos();
        }, [])
    );

    const carregarConteudos = async () => {
        setCarregando(true);
        try {
            const resposta = await fetch(`${API_URL}/contents`);
            if (resposta.ok) {
                const dados = await resposta.json();
                setConteudos(dados);
            } else {
                console.error('Erro ao buscar conteúdos do servidor');
            }
        } catch (error) {
            console.error('Erro de conexão ao carregar conteúdos:', error);
        } finally {
            setCarregando(false);
        }
    };

    // Selecionar imagem usando expo-image-picker
    const selecionarImagem = async () => {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissao.granted) {
            alert('Precisamos de permissão para acessar a galeria de fotos.');
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

    // Ações de Edição
    const abrirEditar = (item) => {
        setItemEditando(item);
        setTitulo(item.titulo || '');
        setDescricao(item.descricao || '');
        setImagemUrl(item.imagemUrl || '');
        setCategoria(item.categoria || '');
        setModalEditVisivel(true);
    };

    const salvarEdicao = async () => {
        if (!titulo.trim() || !imagemUrl) {
            alert('Título e imagem são obrigatórios.');
            return;
        }

        setSalvando(true);
        try {
            const resposta = await fetch(`${API_URL}/contents/${itemEditando._id}`, {
                method: 'PUT',
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

            if (resposta.ok) {
                alert('Conteúdo atualizado com sucesso!');
                setModalEditVisivel(false);
                carregarConteudos();
            } else {
                const dados = await resposta.json();
                alert(dados.mensagem || 'Erro ao editar conteúdo.');
            }
        } catch (error) {
            console.error('Erro ao atualizar conteúdo:', error);
            alert('Não foi possível conectar ao servidor.');
        } finally {
            setSalvando(false);
        }
    };

    // Ações de Exclusão
    const abrirExcluir = (item) => {
        setItemExcluir(item);
        setDialogExcluirVisivel(true);
    };

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

            if (resposta.ok) {
                alert('Conteúdo excluído com sucesso!');
                setDialogExcluirVisivel(false);
                setItemExcluir(null);
                carregarConteudos();
            } else {
                const dados = await resposta.json();
                alert(dados.mensagem || 'Erro ao excluir.');
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Não foi possível conectar ao servidor.');
        } finally {
            setExcluindo(false);
        }
    };

    // Categorias para as abas
    const abas = ['TODAS', 'SÉRIES', 'TECNOLOGIA', 'AÇÃO', 'OUTROS'];

    // Filtra conteúdos pela aba selecionada
    const conteudosFiltrados = conteudos.filter((item) => {
        if (categoriaAtiva === 'TODAS') return true;
        return (item.categoria || '').toUpperCase().includes(categoriaAtiva);
    });

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header style={styles.header}>
                <Appbar.Action
                    icon="menu"
                    iconColor="white"
                    onPress={() => navigation.openDrawer()}
                />
                <Appbar.Content
                    title="Technologic"
                    titleStyle={styles.title}
                />
                <Appbar.Action
                    icon="magnify"
                    iconColor="white"
                    onPress={() => navigation.navigate('Pesquisa')}
                />
                {isLoggedIn ? (
                    <Appbar.Action
                        icon="shield-account"
                        iconColor="white"
                        onPress={() => navigation.navigate('AreaAdministrativa')}
                    />
                ) : null}
                <Appbar.Action
                    icon="account"
                    iconColor="white"
                    onPress={() => {
                        if (isLoggedIn) {
                            navigation.navigate('Perfil');
                        } else {
                            navigation.navigate('Acesso');
                        }
                    }}
                />
            </Appbar.Header>

            {/* Abas de Categorias */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabs}
                contentContainerStyle={styles.tabsContent}
            >
                {abas.map((aba) => (
                    <TouchableOpacity
                        key={aba}
                        onPress={() => setCategoriaAtiva(aba)}
                        style={[
                            styles.tab,
                            categoriaAtiva === aba && estilosAba.tabAtiva,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                categoriaAtiva === aba && estilosAba.tabTextAtiva,
                            ]}
                        >
                            {aba}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Lista de Cards de Conteúdo / Imagens */}
            <ScrollView
                style={styles.cards}
                contentContainerStyle={styles.cardsContent}
                refreshControl={
                    <RefreshControl
                        refreshing={carregando}
                        onRefresh={carregarConteudos}
                        colors={['#F2A900']}
                    />
                }
            >
                {carregando && conteudos.length === 0 ? (
                    <ActivityIndicator size="large" color="#F2A900" style={{ marginTop: 30 }} />
                ) : conteudosFiltrados.length === 0 ? (
                    <View style={estilosAba.vazioContainer}>
                        <Text style={estilosAba.vazioTexto}>
                            Nenhum conteúdo encontrado.
                        </Text>
                        {isLoggedIn ? (
                            <Button
                                mode="contained"
                                buttonColor="#F2A900"
                                textColor="#FFFFFF"
                                icon="plus"
                                style={{ marginTop: 15 }}
                                onPress={() => navigation.navigate('AreaAdministrativa')}
                            >
                                CADASTRAR CONTEÚDO
                            </Button>
                        ) : null}
                    </View>
                ) : (
                    conteudosFiltrados.map((item) => (
                        <ModCard
                            key={item._id}
                            item={item}
                            isLoggedIn={isLoggedIn}
                            onEdit={abrirEditar}
                            onDelete={abrirExcluir}
                        />
                    ))
                )}
            </ScrollView>

            {/* DIALOG DE EDIÇÃO */}
            <Portal>
                <Dialog
                    visible={modalEditVisivel}
                    onDismiss={() => setModalEditVisivel(false)}
                >
                    <Dialog.Title>Editar Conteúdo / Imagem</Dialog.Title>
                    <Dialog.ScrollArea>
                        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                            <TextInput
                                label="Título *"
                                value={titulo}
                                onChangeText={setTitulo}
                                mode="outlined"
                                style={estilosAba.dialogInput}
                            />
                            <TextInput
                                label="Categoria"
                                value={categoria}
                                onChangeText={setCategoria}
                                mode="outlined"
                                style={estilosAba.dialogInput}
                            />
                            {/* CAMPO DE UPLOAD DE IMAGEM */}
                            <View style={{ marginBottom: 12 }}>
                                <Text variant="labelLarge" style={{ marginBottom: 6, color: '#444444' }}>
                                    Imagem do Conteúdo *
                                </Text>

                                {imagemUrl ? (
                                    <View style={{ alignItems: 'center' }}>
                                        <Image
                                            source={{ uri: imagemUrl }}
                                            style={{ width: '100%', height: 150, borderRadius: 8, backgroundColor: '#E0E0E0' }}
                                        />
                                        <Button
                                            mode="outlined"
                                            icon="camera"
                                            onPress={selecionarImagem}
                                            style={{ marginTop: 8 }}
                                        >
                                            Trocar Imagem
                                        </Button>
                                    </View>
                                ) : (
                                    <Button
                                        mode="outlined"
                                        icon="image-plus"
                                        onPress={selecionarImagem}
                                        style={{ borderColor: '#F2A900', paddingVertical: 8 }}
                                    >
                                        Selecionar Imagem da Galeria
                                    </Button>
                                )}
                            </View>
                            <TextInput
                                label="Descrição"
                                value={descricao}
                                onChangeText={setDescricao}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={estilosAba.dialogInput}
                            />
                        </ScrollView>
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={() => setModalEditVisivel(false)} disabled={salvando}>
                            Cancelar
                        </Button>
                        <Button
                            mode="contained"
                            buttonColor="#F2A900"
                            textColor="#FFFFFF"
                            onPress={salvarEdicao}
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
                        <Text>Deseja realmente excluir o conteúdo "{itemExcluir?.titulo}"?</Text>
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

const estilosAba = StyleSheet.create({
    tabAtiva: {
        backgroundColor: '#F2A900',
        borderColor: '#F2A900',
    },
    tabTextAtiva: {
        color: '#FFFFFF',
    },
    vazioContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    vazioTexto: {
        color: '#666666',
        fontSize: 16,
    },
    dialogInput: {
        marginBottom: 10,
        backgroundColor: '#FFFFFF',
    },
});

export default AppBar;