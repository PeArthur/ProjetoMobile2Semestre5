import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
    Appbar,
    TextInput,
    Text,
    ActivityIndicator,
    Portal,
    Dialog,
    Button,
} from 'react-native-paper';
import { useAuth } from './AuthContext';
import API_URL from './api';
import ModCard from './Cards';

const Pesquisa = ({ navigation }) => {
    const { isLoggedIn, token } = useAuth();
    const [termo, setTermo] = useState('');
    const [resultados, setResultados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [jaPesquisou, setJaPesquisou] = useState(false);

    // Modal de Edição
    const [modalEditVisivel, setModalEditVisivel] = useState(false);
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

    // Executa a busca no backend
    const executarPesquisa = async (termoBusca) => {
        const busca = termoBusca !== undefined ? termoBusca : termo;
        if (!busca.trim()) {
            setResultados([]);
            setJaPesquisou(false);
            return;
        }

        setCarregando(true);
        setJaPesquisou(true);
        try {
            const resposta = await fetch(`${API_URL}/contents?busca=${encodeURIComponent(busca.trim())}`);
            if (resposta.ok) {
                const dados = await resposta.json();
                setResultados(dados);
            } else {
                alert('Erro ao realizar pesquisa.');
            }
        } catch (error) {
            console.error('Erro na pesquisa:', error);
            alert('Não foi possível conectar ao servidor.');
        } finally {
            setCarregando(false);
        }
    };

    // Ações de edição e exclusão para usuários logados
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
                executarPesquisa();
            } else {
                const dados = await resposta.json();
                alert(dados.mensagem || 'Erro ao editar conteúdo.');
            }
        } catch (error) {
            console.error('Erro ao editar:', error);
            alert('Não foi possível conectar ao servidor.');
        } finally {
            setSalvando(false);
        }
    };

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
                executarPesquisa();
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

    return (
        <View style={estilos.container}>
            <Appbar.Header style={estilos.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Pesquisa" />
            </Appbar.Header>

            <View style={estilos.campoBuscaContainer}>
                <TextInput
                    label="Pesquisar por título ou descrição"
                    placeholder="Digite o termo e pressione buscar..."
                    value={termo}
                    onChangeText={(texto) => {
                        setTermo(texto);
                        if (!texto.trim()) {
                            setResultados([]);
                            setJaPesquisou(false);
                        }
                    }}
                    onSubmitEditing={() => executarPesquisa()}
                    mode="outlined"
                    right={
                        <TextInput.Icon
                            icon="magnify"
                            onPress={() => executarPesquisa()}
                        />
                    }
                    style={estilos.inputBusca}
                />
            </View>

            <ScrollView contentContainerStyle={estilos.scrollContent}>
                {carregando ? (
                    <ActivityIndicator size="large" color="#F2A900" style={{ marginTop: 30 }} />
                ) : jaPesquisou && resultados.length === 0 ? (
                    <Text style={estilos.mensagemVazio}>
                        Nenhum registro correspondente encontrado para "{termo}".
                    </Text>
                ) : !jaPesquisou ? (
                    <Text style={estilos.mensagemAjuda}>
                        Digite um termo acima para pesquisar registros de conteúdos e séries.
                    </Text>
                ) : (
                    resultados.map((item) => (
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

            {/* MODAL DE EDIÇÃO */}
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
                                style={estilos.dialogInput}
                            />
                            <TextInput
                                label="Categoria"
                                value={categoria}
                                onChangeText={setCategoria}
                                mode="outlined"
                                style={estilos.dialogInput}
                            />
                            <TextInput
                                label="URL da Imagem *"
                                value={imagemUrl}
                                onChangeText={setImagemUrl}
                                mode="outlined"
                                autoCapitalize="none"
                                style={estilos.dialogInput}
                            />
                            <TextInput
                                label="Descrição"
                                value={descricao}
                                onChangeText={setDescricao}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={estilos.dialogInput}
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

                {/* CONFIRMAÇÃO DE EXCLUSÃO */}
                <Dialog
                    visible={dialogExcluirVisivel}
                    onDismiss={() => setDialogExcluirVisivel(false)}
                >
                    <Dialog.Title>Confirmar Exclusão</Dialog.Title>
                    <Dialog.Content>
                        <Text>Deseja realmente excluir "{itemExcluir?.titulo}"?</Text>
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
    header: {
        backgroundColor: '#C0C0C0',
    },
    campoBuscaContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 5,
        backgroundColor: '#FFFFFF',
    },
    inputBusca: {
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 30,
    },
    mensagemVazio: {
        textAlign: 'center',
        marginTop: 40,
        color: '#666666',
        fontSize: 16,
    },
    mensagemAjuda: {
        textAlign: 'center',
        marginTop: 40,
        color: '#888888',
        fontSize: 15,
    },
    dialogInput: {
        marginBottom: 10,
        backgroundColor: '#FFFFFF',
    },
});

export default Pesquisa;