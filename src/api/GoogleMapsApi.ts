import getDirections from 'react-native-maps-directions';
const API_KEY = 'AIzaSyBDGQGAeKqq8AT_YnE1o7gO-_uHmxgecyQ';

const GoogleMapsApi = {
    getRouteDetails: async () => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=Istanbul&destination=Sivas&waypoints=Ankara&key=${API_KEY}`
            );
            const data = await response.json();
            console.log('Güzergah:', data);
        } catch (error) {
            console.error('Güzergah Alınamadı:', error);
        }
    }
}

export default GoogleMapsApi;
