import React from 'react';
import { View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { styles } from './css/Styles';

const Acesso = ({ navigation }) => {
    return (
        <View style={{ flex: 1, backgroundColor: '#EEEEEE' }}>
            {/* APPBAR */}
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction
                    iconColor="white"
                    onPress={() => navigation.goBack()}
                />
                <Appbar.Content
                    title="Acesso"
                    titleStyle={styles.title}
                />
            </Appbar.Header>

            {/* CONTEÚDO */}
            <View style={styles.acesso}>
                <Text
                    variant="headlineSmall"
                    style={styles.acessoTitulo}
                >
                    Bem-vindo!
                </Text>
                <Text
                    variant="bodyLarge"
                    style={styles.acessoTexto}
                >
                    Você já possui uma conta?
                </Text>
                
                {/* JÁ TENHO CADASTRO */}
                <Button
                    mode="contained"
                    icon="login"
                    style={styles.acessoButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    JÁ TENHO CADASTRO
                </Button>

                {/* NÃO TENHO CADASTRO */}
                <Button
                    mode="outlined"
                    icon="account-plus"
                    style={styles.acessoButton}
                    onPress={() => navigation.navigate('Cadastro')}
                >
                    NÃO TENHO CADASTRO
                </Button>
            </View>
        </View>
    );
};

export default Acesso;