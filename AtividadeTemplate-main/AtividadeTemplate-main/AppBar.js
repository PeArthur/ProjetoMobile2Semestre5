import * as React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Appbar } from 'react-native-paper';
import { styles } from './css/Styles';
import ModCard from './Cards';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppBar = ({ navigation }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');

useEffect(() => {
        const carregarUsuario = async () => {
            try {
                const nomeSalvo = await AsyncStorage.getItem('userName');
                if (nomeSalvo) {
                    setUserName(nomeSalvo);
                }
            } catch (error) {
                console.error('Erro ao carregar o nome do usuário:', error);
            }
        };
        carregarUsuario();
    }, []);

useEffect(() => {
    async function checkLogin() {
        const token = await AsyncStorage.getItem('userToken');
        const name = await AsyncStorage.getItem('userName');
        if (token) {
            setIsLoggedIn(true);
            setUserName(name);
        }
    }
    checkLogin();
}, []);

    return (
        <>
            <Appbar.Header style={styles.header}>
                <Appbar.Action icon="menu" iconColor="white" onPress={() => navigation.openDrawer()} />
                <Appbar.Content title="Technologic" style={styles.title} />
                <Appbar.Action icon="magnify"  onPress={() => navigation.navigate('Pesquisa')} />
                <Appbar.Action icon="account" onPress={() => navigation.navigate('Acesso')} />
            </Appbar.Header>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                style={styles.tabs}
                contentContainerStyle={styles.tabsContent}>

                <View style={styles.tab}>
                    <Text style={styles.tabText}>TELA 01</Text>
                </View>

                <View style={styles.tab}>
                    <Text style={styles.tabText}>TELA 02</Text>
                </View>

                <View style={styles.tab}>
                    <Text style={styles.tabText}>TELA 03</Text>
                </View>
                <View style={styles.tab}>
                    <Text style={styles.tabText}>TELA 04</Text>
                </View>
                <View style={styles.tab}>
                    <Text style={styles.tabText}>TELA 05</Text>
                </View>
            </ScrollView>

       

            <ScrollView
                style={styles.cards}
                contentContainerStyle={styles.cardsContent}
            >
                <ModCard />
                <ModCard />
                <ModCard />
            </ScrollView>
        </>
    );
}

export default AppBar;