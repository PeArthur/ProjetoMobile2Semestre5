import React from 'react';

import { View } from 'react-native';

import {
    Appbar,
    TextInput,
} from 'react-native-paper';

const Pesquisa = ({ navigation }) => {

    return (

        <View style={{ flex: 1 }}>

            <Appbar.Header>

                <Appbar.BackAction
                    onPress={() => navigation.goBack()}
                />

                <Appbar.Content
                    title="Pesquisa"
                />

            </Appbar.Header>


            <TextInput
                label="Pesquisar"
                placeholder="Digite aqui..."
                mode="outlined"
                style={{
                    margin: 20
                }}
            />

        </View>
    );
};

export default Pesquisa;