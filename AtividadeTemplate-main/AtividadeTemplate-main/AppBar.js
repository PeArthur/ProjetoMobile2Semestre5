import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Appbar, ActivityIndicator, Portal, Dialog, Button, TextInput } from 'react-native-paper';
import { styles } from './css/Styles';
import ModCard from './Cards';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from './api';

const AppBar = ({ navigation }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [token, setToken] = useState(null);
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

    // Atualiza estado de login e carrega conteúdos sempre que a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            const verificarLogin = async () => {
                try {
                    const userToken = await AsyncStorage.getItem('userToken');
                    const nomeSalvo = await AsyncStorage.getItem('userName');
                    if (userToken) {
                        setIsLoggedIn(true);
                        setToken(userToken);
                        setUserName(nomeSalvo || '');
                    } else {
                        setIsLoggedIn(false);
                        setToken(null);
                        setUserName('');
                    }
                } catch (error) {
                    console.error('Erro ao verificar login no AppBar:', error);
                }
            };

            verificarLogin();
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
        if (!titulo.trim() || !imagemUrl.trim()) {
            alert('Título e URL da imagem são obrigatórios.');
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

            {/* DIALOG DE EDIÇÃO (Visível apenas quando autenticado clica em Editar) */}
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
                            <TextInput
                                label="URL da Imagem *"
                                value={imagemUrl}
                                onChangeText={setImagemUrl}
                                mode="outlined"
                                autoCapitalize="none"
                                style={estilosAba.dialogInput}
                            />
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