import React from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    Appbar,
    TextInput,
    Button,
    Text,
} from 'react-native-paper';

import { styles } from './css/Styles';

const Login = ({ navigation }) => {

    const [email, setEmail] = React.useState('');
    const [senha, setSenha] = React.useState('');
    const [mostrarSenha, setMostrarSenha] = React.useState(false);

    const entrar = async () => {
        try {
            const resposta = await fetch('http://127.0.0.1:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                await AsyncStorage.setItem('userToken', dados.token);
                await AsyncStorage.setItem('userName', dados.usuario?.nome || 'Usuário');
                await AsyncStorage.setItem('userEmail', dados.usuario?.email || '');
                alert('Login realizado com sucesso!');

                navigation.navigate('home');
            } else {
                alert(dados.mensagem || 'Erro ao fazer login.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Não foi possível conectar ao servidor.');
        }
    };

    return (

        <View style={styles.loginContainer}>

            {/* APPBAR */}

            <Appbar.Header >

                <Appbar.BackAction
                    iconColor="black"
                    onPress={() => navigation.goBack()}
                />

                <Appbar.Content
                    title="Login"
                    titleStyle={styles.title}
                />

            </Appbar.Header>


            {/* FORMULÁRIO */}

            <View style={styles.loginContent}>

                <Text
                    variant="headlineMedium"
                    style={styles.loginTitulo}
                >
                    Bem-vindo!
                </Text>


                <Text
                    variant="bodyLarge"
                    style={styles.loginTexto}
                >
                    Entre com sua conta
                </Text>


                {/* E-MAIL */}

                <TextInput
                    label="E-mail"
                    placeholder="Digite seu e-mail"
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


                {/* SENHA */}

                <TextInput
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChangeText={setSenha}
                    mode="outlined"
                    secureTextEntry={!mostrarSenha}
                    left={
                        <TextInput.Icon icon="lock" />
                    }
                    right={
                        <TextInput.Icon
                            icon={mostrarSenha ? 'eye-off' : 'eye'}
                            onPress={() =>
                                setMostrarSenha(!mostrarSenha)
                            }
                        />
                    }
                    style={styles.input}
                />


                {/* ENTRAR */}

                <Button
                    mode="contained"
                    icon="login"
                    style={styles.loginButton}
                    onPress={entrar}
                >
                    ENTRAR
                </Button>

                {/* CADASTRO */}

                <Button
                    mode="text"
                    icon="account-plus"
                    onPress={() => navigation.navigate('Cadastro')}
                >
                    NÃO TENHO CADASTRO
                </Button>

            </View>

        </View>
    );
};

export default Login;