import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Avatar, Text, IconButton, Portal, Dialog, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CabecalhoMenu = () => {
  const [nome, setNome] = useState('Visitante');
  const [email, setEmail] = useState('Toque para entrar');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigation = useNavigation();
  const [dialogSair, setDialogSair] = useState(false);

  // Buscar dados do usuário logado no AsyncStorage
  const carregarUsuarioLogado = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const nomeSalvo = await AsyncStorage.getItem('userName');
      const emailSalvo = await AsyncStorage.getItem('userEmail');

      if (token && nomeSalvo) {
        setNome(nomeSalvo);
        setEmail(emailSalvo || '');
        setIsLoggedIn(true);
      } else {
        setNome('Visitante');
        setEmail('Toque para entrar');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário no menu:', error);
    }
  };

  useEffect(() => {
    carregarUsuarioLogado();
    const unsubscribe = navigation.addListener('focus', carregarUsuarioLogado);
    return unsubscribe;
  }, [navigation]);

  const irParaAreaAdministrativa = () => {
    if (isLoggedIn) {
      navigation.navigate('AreaAdministrativa');
    } else {
      alert('Acesso restrito: Somente usuários autenticados podem acessar a área administrativa.');
      navigation.navigate('Login');
    }
  };

  const confirmarSaida = async () => {
    setDialogSair(false);
    try {
      // Limpa os dados de sessão ao sair
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('userEmail');
      setNome('Visitante');
      setEmail('Toque para entrar');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>

      {/* Área do usuário (Identificação do Usuário) */}
      <Pressable
        style={styles.usuario}
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('Perfil');
          } else {
            navigation.navigate('Acesso');
          }
        }}
      >
        {/* Avatar */}
        <Avatar.Icon
          size={65}
          icon="account"
          style={styles.avatar}
        />

        {/* Nome e e-mail */}
        <View style={styles.informacoes}>
          <Text
            variant="titleMedium"
            style={styles.nome}
            numberOfLines={1}
          >
            {nome}
          </Text>

          <Text
            variant="bodyMedium"
            style={styles.email}
            numberOfLines={1}
          >
            {email}
          </Text>
        </View>
      </Pressable>

      {/* Opção Início */}
      <View style={styles.perfil}>
        <Text variant="bodyMedium" style={styles.perfilTexto}>
          Início
        </Text>
        <IconButton
          icon="home"
          iconColor="white"
          size={24}
          onPress={() => navigation.navigate('Home')}
        />
      </View>

      {/* Opção Área Administrativa (Protegida) */}
      <View style={styles.perfil}>
        <Text variant="bodyMedium" style={styles.perfilTexto}>
          Área Administrativa
        </Text>
        <IconButton
          icon="shield-account"
          iconColor="white"
          size={24}
          onPress={irParaAreaAdministrativa}
        />
      </View>

      {/* Área do Pesquisa */}
      <View style={styles.perfil}>
        <Text variant="bodyMedium" style={styles.perfilTexto}>
          Pesquisa
        </Text>
        <IconButton
          icon="magnify"
          iconColor="white"
          size={24}
          onPress={() => navigation.navigate('Pesquisa')}
        />
      </View>

      {/* Área do perfil */}
      <View style={styles.perfil}>
        <Text variant="bodyMedium" style={styles.perfilTexto}>
          Meu perfil
        </Text>
        <IconButton
          icon="account-circle"
          iconColor="white"
          size={24}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate('Perfil');
            } else {
              navigation.navigate('Login');
            }
          }}
        />
      </View>

      {/* Área de Sair ou Entrar */}
      {isLoggedIn ? (
        <View style={styles.perfil}>
          <Text variant="bodyMedium" style={styles.perfilTexto}>
            Sair
          </Text>
          <IconButton
            icon="logout"
            iconColor="white"
            size={24}
            onPress={() => setDialogSair(true)}
          />
        </View>
      ) : (
        <View style={styles.perfil}>
          <Text variant="bodyMedium" style={styles.perfilTexto}>
            Entrar / Cadastrar
          </Text>
          <IconButton
            icon="login"
            iconColor="white"
            size={24}
            onPress={() => navigation.navigate('Acesso')}
          />
        </View>
      )}

      {/* Dialog de confirmação de saída */}
      <Portal>
        <Dialog
          visible={dialogSair}
          onDismiss={() => setDialogSair(false)}>
          <Dialog.Title>Confirmar saída</Dialog.Title>
          <Dialog.Content>
            <Text>
              Deseja realmente sair da sua conta?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogSair(false)}>
              Cancelar
            </Button>
            <Button onPress={confirmarSaida}>
              Sair
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#C0C0C0',
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  usuario: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatar: {
    backgroundColor: '#F2A900',
  },
  informacoes: {
    flex: 1,
    marginLeft: 15,
  },
  nome: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 19,
  },
  email: {
    color: '#FFFFFF',
    marginTop: 3,
  },
  perfil: {
    marginTop: 15,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  perfilTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export { CabecalhoMenu };