import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Recupera a sessão persistida no AsyncStorage ao iniciar o aplicativo
    useEffect(() => {
        const carregarSessao = async () => {
            try {
                const tokenSalvo = await AsyncStorage.getItem('userToken');
                const nomeSalvo = await AsyncStorage.getItem('userName');
                const emailSalvo = await AsyncStorage.getItem('userEmail');
                const idSalvo = await AsyncStorage.getItem('userId');

                if (tokenSalvo && nomeSalvo) {
                    setToken(tokenSalvo);
                    setUser({
                        id: idSalvo || '',
                        nome: nomeSalvo,
                        email: emailSalvo || '',
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar sessão do AsyncStorage:', error);
            } finally {
                setLoadingAuth(false);
            }
        };

        carregarSessao();
    }, []);

    // Função de login: atualiza o estado global e persiste no AsyncStorage
    const login = async (novoToken, novoUsuario) => {
        try {
            const nome = novoUsuario?.nome || 'Usuário';
            const email = novoUsuario?.email || '';
            const id = novoUsuario?.id || novoUsuario?._id || '';

            await AsyncStorage.setItem('userToken', novoToken);
            await AsyncStorage.setItem('userName', nome);
            await AsyncStorage.setItem('userEmail', email);
            if (id) await AsyncStorage.setItem('userId', id);

            setToken(novoToken);
            setUser({ id, nome, email });
        } catch (error) {
            console.error('Erro ao salvar dados de autenticação:', error);
        }
    };

    // Função de logout: limpa o estado global e remove os dados do AsyncStorage
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userName');
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.removeItem('userId');

            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Erro ao limpar dados de autenticação:', error);
        }
    };

    // Atualização dos dados do perfil caso o usuário altere seu nome ou email
    const atualizarUsuario = async (dadosNovos) => {
        try {
            const usuarioAtualizado = { ...user, ...dadosNovos };
            if (dadosNovos.nome) await AsyncStorage.setItem('userName', dadosNovos.nome);
            if (dadosNovos.email) await AsyncStorage.setItem('userEmail', dadosNovos.email);
            setUser(usuarioAtualizado);
        } catch (error) {
            console.error('Erro ao atualizar usuário no context:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoggedIn: !!token && !!user,
                loadingAuth,
                login,
                logout,
                atualizarUsuario,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
