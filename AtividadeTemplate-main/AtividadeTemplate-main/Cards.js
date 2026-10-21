import React from 'react';
import { Card, Text, Button } from 'react-native-paper';
import { styles } from './css/Styles';

const ModCard = ({ item, isLoggedIn, onEdit, onDelete }) => {
    const titulo = item?.titulo || 'Breaking Bad';
    const subtitulo = item?.categoria || item?.descricao || '1x01 - Pilot';
    const imagem = item?.imagemUrl || 'https://picsum.photos/700';
    const descricao = item?.descricao || '';

    return (
        <Card style={styles.card}>
            <Card.Title
                title={titulo}
                subtitle={subtitulo}
                titleStyle={styles.cardTitle}
            />
            <Card.Cover
                style={styles.cardCover}
                source={{ uri: imagem }}
            />

            {descricao ? (
                <Card.Content style={{ paddingTop: 8, paddingBottom: 4 }}>
                    <Text variant="bodyMedium" numberOfLines={2}>
                        {descricao}
                    </Text>
                </Card.Content>
            ) : null}

            {/* Opções de Gerenciamento de Imagens: visíveis apenas para usuários autenticados */}
            {isLoggedIn ? (
                <Card.Actions style={styles.cardActions}>
                    <Button
                        mode="outlined"
                        icon="pencil"
                        onPress={() => onEdit && onEdit(item)}
                        style={{ marginRight: 8 }}
                    >
                        Editar imagem
                    </Button>
                    <Button
                        mode="contained"
                        buttonColor="#D32F2F"
                        textColor="#FFFFFF"
                        icon="delete"
                        onPress={() => onDelete && onDelete(item)}
                    >
                        Excluir imagem
                    </Button>
                </Card.Actions>
            ) : null}
        </Card>
    );
};

export default ModCard;