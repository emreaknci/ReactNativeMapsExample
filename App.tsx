import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from './src/screens/MapScreen';
import { Text, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{title:"Ana Sayfa"}} component={HomeScreen} />
        <Stack.Screen name="Map" options={{title:"Harita"}}  component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;