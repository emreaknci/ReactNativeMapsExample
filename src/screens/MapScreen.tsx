import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StyleSheet, Text, Linking, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DurationHelper from '../helpers/durationHelper';

const API_KEY = 'AIzaSyBDGQGAeKqq8AT_YnE1o7gO-_uHmxgecyQ';

const MapScreen = () => {
    const mapViewRef = useRef(null);

    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [loading, setLoading] = useState(false);

    const [originLocation, setOriginLocation] = useState({ latitude: 40.740799, longitude: 30.333300 }); // Origin location is Sakarya University
    const [currentLocation, setCurrentLocation] = useState(null);
    const [startingLocation, setStartingLocation] = useState(null);
    const [startingLocationAddress, setStartingLocationAddress] = useState('');
    const [destinationLocation, setDestinationLocation] = useState(null);
    const [destinationLocationAddress, setDestinationLocationAddress] = useState('');

    const [btnVisible, setBtnVisible] = useState(false);
    const [step, setStep] = useState(1);


    useEffect(() => {
        checkAndSetLocation();
    }, []);

    useEffect(() => {
        setDestinationLocation(startingLocation)
    }, [startingLocation]);

    const checkAndSetLocation = async () => {
        const isLocationEnabled = await Location.hasServicesEnabledAsync();

        if (!isLocationEnabled) {
            handleDisabledLocation();
        } else {
            handleEnabledLocation();
        }
    };

    const handleDisabledLocation = async () => {
        Alert.alert(
            'Konum Servisleri Kapalı',
            'Konum servisleri kapalı. Açmak ister misiniz?',
            [
                { text: 'Hayır', onPress: () => console.log('Konum servisleri kapalı bırakıldı') },
                { text: 'Evet', onPress: askToEnableLocation },
            ]
        );
    };

    const askToEnableLocation = async () => {
        Linking.openSettings();
        const permissionStatus = await Location.requestForegroundPermissionsAsync();

        if (permissionStatus.status === 'granted') {
            getOriginLocation();
        } else {
            showPermissionDeniedAlert();
        }
    };

    const handleEnabledLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
            getOriginLocation();
        } else {
            showPermissionDeniedAlert();
        }
    };

    const showPermissionDeniedAlert = () => {
        Alert.alert(
            'Konum İzni Reddedildi',
            'Konum bilgisini kullanmak için izin vermelisiniz.'
        );
    };

    const getOriginLocation = async () => {
        setLoading(true);
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setOriginLocation({ latitude, longitude });
        setCurrentLocation({ latitude, longitude });
        setLoading(false);
    }
    const onReady = (result) => {
        setDistance(result.distance.toFixed(2));
        setDuration(DurationHelper(result.duration));
    };

    const onError = (errorMessage) => {
        console.log('Error with directions:', errorMessage);
    };

    const animateToSelectedLocation = (location) => {
        mapViewRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    const handleLocationSelectOnSearchBox = (details, setLocation, setLocationAddress) => {
        if (setLocation) {
            const coordinate = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
            };

            setLocation(coordinate);
            animateToSelectedLocation(coordinate);
            determineSelectedAddress(coordinate, setLocationAddress);
            setBtnVisible(true);
        }
    };

    const handleStartingLocationPress = async (e) => {
        const { coordinate } = e.nativeEvent;
        setStartingLocation(coordinate);
        determineSelectedAddress(coordinate, setStartingLocationAddress);

        setBtnVisible(true);
    }

    const handleDestinationLocationPress = async (e) => {
        const { coordinate } = e.nativeEvent;
        setDestinationLocation(coordinate);
        determineSelectedAddress(coordinate, setDestinationLocationAddress);
        setBtnVisible(true);
    }

    const determineSelectedAddress = async (coordinate, addressState) => {
        try {
            const result = await Location.reverseGeocodeAsync(coordinate);
            if (result.length > 0) {
                const addressArray = [
                    result[0].street,
                    result[0].city,
                    result[0].region,
                    result[0].country,
                ];

                const nonNullValues = addressArray.filter(value => value !== null && value !== undefined);

                const address = nonNullValues.join(', ');
                addressState(address);
            }
        } catch (error) {
            console.log('Adres alınamadı:', error.message);
        }
    }

    const renderMapView = (handleMapPress = null, setLocation = null, setLocationAddress = null, showDirection = false, showSearchInput = false) => {
        return (
            <View style={{ flex: 1 }}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: originLocation.latitude,
                        longitude: originLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    onPress={handleMapPress}
                    ref={mapViewRef}
                    onMapReady={() => {
                        const coordinates = [startingLocation, destinationLocation].filter(Boolean);
                        if (coordinates.length > 1) {
                            mapViewRef.current.fitToCoordinates(coordinates, {
                                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                                animated: true,
                            });
                        }
                    }}
                >
                    {startingLocation && <Marker coordinate={startingLocation} title="Başlangıç Konumu" pinColor='red' />}
                    {destinationLocation && <Marker coordinate={destinationLocation} title="Hedef Konum" pinColor='red' />}
                    {showDirection && startingLocation && destinationLocation && (
                        <MapViewDirections
                            origin={{ latitude: startingLocation.latitude, longitude: startingLocation.longitude }}
                            destination={{ latitude: destinationLocation.latitude, longitude: destinationLocation.longitude }}
                            apikey={API_KEY}
                            strokeWidth={5}
                            strokeColor="blue"
                            language='tr'
                            miterLimit={5}
                            onReady={onReady}
                            onError={onError}
                        />
                    )}

                </MapView>

                {showSearchInput && <View style={styles.searchContainer}>
                    <GooglePlacesAutocomplete
                        placeholder="Bir konum ara..."
                        onPress={(data, details) => {

                            if (setLocation) {
                                handleLocationSelectOnSearchBox(details, setLocation, setLocationAddress);
                            }
                        }} query={{
                            key: API_KEY,
                            language: 'tr',
                        }}
                        fetchDetails
                        listViewDisplayed='auto'
                        currentLocation={false}
                        nearbyPlacesAPI='GooglePlacesSearch'
                        debounce={300}
                    />
                    <TouchableOpacity
                        style={{
                            borderRadius: 50,
                            padding: 8,
                            alignItems: "flex-end",
                        }}
                        onPress={handleCurrentLocationPress}
                    >
                        <MaterialCommunityIcons name="map-marker-account" size={50} color="blue" />
                    </TouchableOpacity>

                </View>}
            </View>

        );

    }

    const handleBtnPress = () => {
        setStep(step + 1);
        setBtnVisible(false);
    }

    const handleCurrentLocationPress = async () => {

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setCurrentLocation({ latitude, longitude });
        animateToSelectedLocation({ latitude, longitude });
    };

    const renderStep1 = () => {
        return (
            <View style={styles.container}>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoTitleText}> Başlangıç Konumunu Seçiniz</Text>
                    {startingLocationAddress !== '' && <Text style={styles.infoText}>Başlangıç Konumu: {startingLocationAddress}</Text>}
                </View>
                {renderMapView(handleStartingLocationPress, setStartingLocation, setStartingLocationAddress, false, true)}
                {startingLocation && <Marker coordinate={startingLocation} />}
                {btnVisible && <Button title="Başlangıç Konumunu Onayla" onPress={() => handleBtnPress()} />}
            </View>
        )
    }

    const renderStep2 = () => {
        return (
            <View style={styles.container}>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoTitleText}> Hedef Konumunu Seçiniz</Text>
                    {destinationLocationAddress !== '' && <Text style={styles.infoText}>Başlangıç Konumu: {destinationLocationAddress}</Text>}
                </View>
                {renderMapView(handleDestinationLocationPress, setDestinationLocation, setDestinationLocationAddress, false, true)}
                {btnVisible && <Button title="Hedef Konumu Onayla" onPress={() => handleBtnPress()} />}
            </View>
        )
    }

    const renderStep3 = () => {
        return (
            <View style={styles.container}>
                <View style={styles.infoContainer}>
                    {startingLocationAddress !== '' && <Text style={styles.infoText}>Başlangıç Konumu: {startingLocationAddress}</Text>}
                    {destinationLocationAddress !== '' && <Text style={styles.infoText}>Hedef Konum: {destinationLocationAddress}</Text>}
                    {distance !== null && <Text style={styles.infoText}>Konumlar Arası Mesafe: {distance} km ({duration})</Text>}
                </View>
                {renderMapView(null, null, null, true, false)}

            </View>
        )
    }
    return (
        <View style={styles.container}>

            {loading ?
                <>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="black" />
                        <Text>Konum bilgisi alınıyor...</Text>
                    </View>

                </> :
                <>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    infoContainer: {
        padding: 16,
    },
    infoTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
    },
    map: {
        flex: 1
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
    },
});

export default MapScreen;
