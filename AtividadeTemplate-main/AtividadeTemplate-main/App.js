import { useEffect, useState } from 'react';
import SplashScreen from './SplashScreen';

import { View } from 'react-native';
//React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator,  DrawerContentScrollView } from '@react-navigation/drawer';

import { styles } from './css/Styles';
import { PaperProvider, Provider, Avatar, Text, } from 'react-native-paper';
import { theme } from './theme/theme';

// AppBar
import AppBar from './AppBar';
// Rotas
import Pesquisa from './Pesquisa';
// Acesso
import Acesso from './Acesso';
//Login 
import Login from './Login';
//Cadastro
import Cadastro from './Cadastro';
// Perfil
import { Perfil } from './Perfil';
//cabeçalho do menu
import { CabecalhoMenu } from './CabecaMenu';


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function StackNavigator() {
  return (
    <Stack.Navigator

      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={AppBar} />
      <Stack.Screen name="Pesquisa" component={Pesquisa} />
      <Stack.Screen name="Acesso" component={Acesso} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
      <Stack.Screen name="Perfil" component={Perfil} />
    </Stack.Navigator>
  );
}


function DrawerNavigation() {
  return (
    <Drawer.Navigator screenOptions={{
      headerShown: false
    }}

      drawerContent={(props) => (
        <View style={{ flex: 1 }}>

          <CabecalhoMenu />


          <DrawerContentScrollView {...props} />

        </View>
      )}
    >
      <Drawer.Screen
        name="Início"
        component={StackNavigator}
      />
      <Drawer.Screen
        name="Séries"
        component={AppBar}
      />
    </ Drawer.Navigator>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => { setLoading(false); }, 10000);
  }, []);

  if (loading) {
    return (<SplashScreen />)
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>

        <DrawerNavigation />

      </NavigationContainer>
    </PaperProvider>
  );
}


