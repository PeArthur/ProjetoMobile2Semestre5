
import { View, Image } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

import { styles } from './css/Styles';

const ModCard = () => {
    return (

        <Card style={styles.card}>
            <Card.Title title="Breaking Bad" subtitle="1x01 - Pilot"     titleStyle={styles.cardTitle}  />
            <Card.Cover
                style={styles.cardCover}
                source={{
                    uri: 'https://picsum.photos/700'
                }}
            />

            <Card.Actions style={styles.cardActions}>

                <Button onPress={() => console.log('Pressed')}>
                    ver
                </Button>

            </Card.Actions>

        </Card>
    );
};
export default ModCard;