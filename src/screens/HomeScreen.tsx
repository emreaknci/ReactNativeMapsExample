import { useNavigation } from "@react-navigation/native";
import { Text, View, StyleSheet, Button } from "react-native";
import GoogleMapsApi from "../api/GoogleMapsApi";
import { useEffect } from "react";


export default function HomeScreen({ navigation }) {

    useEffect(() => {
        // GoogleMapsApi.getRouteDetails();
    }
        , []);

    const handleButtonPress = () => {
        navigation.navigate('Map');
    };

    return (
        <View style={styles.container}>
            <Button title="Konum Seç" onPress={handleButtonPress} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
