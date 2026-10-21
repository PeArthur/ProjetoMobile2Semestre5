import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Avatar, Text, TextInput, Button, Divider, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from './AuthContext';

//campo  de imagem
import * as ImagePicker from 'expo-image-picker';

const Perfil = ({ navigation }) => {
    const { user, atualizarUsuario } = useAuth();

    // Dados do usuário
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');

    // Imagem do usuário
    const [imagem, setImagem] = useState(null);

    useEffect(() => {
        if (user) {
            if (user.nome) setNome(user.nome);
            if (user.email) setEmail(user.email);
        }
    }, [user]);

    // ==============================
    // ESCOLHER IMAGEM
    // ==============================

    const editarFoto = async () => {
        // Solicita permissão para acessar a galeria
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissao.granted) {
            alert('Precisamos de permissão para acessar suas fotos.');
            return;
        }
        // Abre a galeria
        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        // Verifica se o usuário escolheu uma imagem
        if (!resultado.canceled) {
            setImagem(resultado.assets[0].uri);
        }

    };

    // ==============================
    // SALVAR PERFIL
    // ==============================

    const salvarPerfil = async () => {
        console.log('Dados do perfil:', {
            nome,
            email,
            telefone,
            cpf,
            senha,
            imagem,
        });

        await atualizarUsuario({ nome, email });
        alert('Perfil atualizado com sucesso!');
    };


    return (
        <ScrollView style={styles.container}>
            {/* CABEÇALHO */}
            <View style={styles.cabecalho}>
                {/* AVATAR */}
                <View style={styles.avatarContainer}>
                    { imagem ?( 
                          // Mostra a imagem escolhida
                        <Image
                            source={{ uri: imagem }}
                            style={styles.avatarImagem}
                        />) : (
                        // Avatar padrão
                        <Avatar.Icon
                            size={100}
                            icon="account"
                            style={styles.avatar}
                        />

                    )}
                    {/* BOTÃO EDITAR */}
                    <IconButton
                        icon="pencil"
                        iconColor="white"
                        size={18}
                        style={styles.botaoEditar}
                        onPress={editarFoto}
                    />

                </View>


                {/* TÍTULO */}

                <Text
                    variant="headlineSmall"
                    style={styles.titulo}
                >
                    Meu Perfil
                </Text>


                <Text style={styles.subtitulo}>
                    Atualize seus dados pessoais
                </Text>

            </View>


            <Divider />


            {/* ============================= */}
            {/* FORMULÁRIO */}
            {/* ============================= */}

            <View style={styles.formulario}>

                {/* NOME */}

                <TextInput
                    label="Nome"
                    value={nome}
                    onChangeText={setNome}
                    mode="outlined"
                    left={
                        <TextInput.Icon icon="account" />
                    }
                    style={styles.input}
                />


                {/* E-MAIL */}

                <TextInput
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    left={
                        <TextInput.Icon icon="email" />
                    }
                    style={styles.input}
                />


                {/* TELEFONE */}

                <TextInput
                    label="Telefone"
                    value={telefone}
                    onChangeText={setTelefone}
                    mode="outlined"
                    keyboardType="phone-pad"
                    left={
                        <TextInput.Icon icon="phone" />
                    }
                    style={styles.input}
                />


                {/* CPF */}

                <TextInput
                    label="CPF"
                    value={cpf}
                    onChangeText={setCpf}
                    mode="outlined"
                    keyboardType="numeric"
                    left={
                        <TextInput.Icon icon="card-account-details" />
                    }
                    style={styles.input}
                />


                {/* NOVA SENHA */}

                <TextInput
                    label="Nova senha"
                    value={senha}
                    onChangeText={setSenha}
                    mode="outlined"
                    secureTextEntry
                    left={
                        <TextInput.Icon icon="lock" />
                    }
                    style={styles.input}
                />


                {/* ============================= */}
                {/* SALVAR */}
                {/* ============================= */}

                <Button
                    mode="contained"
                    icon="content-save"
                    onPress={salvarPerfil}
                    style={styles.botao}
                >
                    Salvar alterações
                </Button>


                {/* ============================= */}
                {/* VOLTAR */}
                {/* ============================= */}

                <Button
                    mode="outlined"
                    icon="arrow-left"
                    onPress={() => navigation.goBack()}
                    style={styles.botaoVoltar}
                >
                    Voltar
                </Button>

            </View>

        </ScrollView>
    );
};


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },


    // ==============================
    // CABEÇALHO
    // ==============================

    cabecalho: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#C0C0C0',
    },


    // ==============================
    // AVATAR
    // ==============================

    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },


    avatar: {
        backgroundColor: '#F2A900',
    },


    // Imagem escolhida
    avatarImagem: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },


    // ==============================
    // BOTÃO EDITAR
    // ==============================

    botaoEditar: {
        position: 'absolute',

        right: -8,
        bottom: -8,

        backgroundColor: '#555555',

        margin: 0,

        borderWidth: 2,
        borderColor: '#FFFFFF',
    },


    // ==============================
    // TÍTULO
    // ==============================

    titulo: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },


    subtitulo: {
        color: '#FFFFFF',
        marginTop: 5,
    },


    // ==============================
    // FORMULÁRIO
    // ==============================

    formulario: {
        padding: 20,
    },


    input: {
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
    },


    // ==============================
    // BOTÃO SALVAR
    // ==============================

    botao: {
        marginTop: 10,
        paddingVertical: 5,
        backgroundColor: '#F2A900',
    },


    // ==============================
    // BOTÃO VOLTAR
    // ==============================

    botaoVoltar: {
        marginTop: 15,
        paddingVertical: 5,
    },

});


export { Perfil };

