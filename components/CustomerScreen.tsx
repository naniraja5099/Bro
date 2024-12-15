import React, { useState, useEffect } from 'react';
import ReserveScreen from './ReserveScreen'; // Import the ReserveScreen component
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = 'http://127.0.0.1:8000/api/cities/';
const DESTINATION_URL = (cityId: number) =>
  `http://127.0.0.1:8000/api/cities/${cityId}/popular-destinations/`;
const HOTEL_URL = (cityId: number) => `http://127.0.0.1:8000/api/hotels/${cityId}`;
const ROOMS_URL = (hotelId: number) => `http://127.0.0.1:8000/api/floor/rooms/${hotelId}/`;

type City = {
  id: number;
  name: string;
  lat: string;
  long: string;
};

type Destination = {
  id: number;
  name: string;
  images: { id: number; image: string }[];
};

type Hotel = {
  id: number;
  name: string;
  owner_name: string;
  contact: string;
  address: string;
  amenities: string;
  price_range: string;
  images: { id: number; image: string }[];
};

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const CustomerScreen: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<Destination[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [floors, setFloors] = useState<number[]>([]); // Represents an array of floor numbers
  const [rooms, setRooms] = useState<{ [floor: number]: any[] }>({}); // Keyed by floor number
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(API_URL);
        const data: City[] = await response.json();
        setCities(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch cities');
      }
    };

    fetchCities();
  }, []);

  const handleLocate = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const currentLocationCity: City = {
        id: 0,
        name: 'Your Location',
        lat: latitude.toString(),
        long: longitude.toString(),
      };

      setCities((prev) => [currentLocationCity, ...prev]);
      Alert.alert('Location Acquired', `Added your current location`);
    } catch (error) {
      Alert.alert('Error', 'Failed to acquire location');
    }
  };

  const handleCitySelect = async (city: City) => {
    setSelectedCity(city);
    try {
      const response = await fetch(DESTINATION_URL(city.id));
      const data: Destination[] = await response.json();
      setPopularDestinations(data);

      const hotelsResponse = await fetch(HOTEL_URL(city.id));
      const hotelsData: Hotel[] = await hotelsResponse.json();
      setHotels(hotelsData);

      setSelectedDestination(data[0]);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data for the selected city');
    }
  };

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination);
    setImageIndex(0);
  };

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
  };

  const handleBack = () => {
    setSelectedHotel(null);
  };

  // Render ReserveScreen if a hotel is selected
  if (selectedHotel) {
    return <ReserveScreen hotel={selectedHotel} onBack={handleBack} />;
  }

  // Existing CustomerScreen logic
  return (
    <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.locateButton} onPress={handleLocate}>
          <Icon name="location-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <ScrollView
          horizontal
          contentContainerStyle={styles.circlesContainer}
          showsHorizontalScrollIndicator={false}
          style={styles.cityCirclesScrollView}
        >
          {cities.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={styles.cityCircle}
              onPress={() => handleCitySelect(city)}
            >
              <Text style={styles.cityText}>{city.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedCity && popularDestinations.length > 0 && (
        <View style={styles.pillsContainer}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.pillsScrollView}
            showsHorizontalScrollIndicator={false}
          >
            {popularDestinations.map((destination) => (
              <TouchableOpacity
                key={destination.id}
                style={styles.pill}
                onPress={() => handleDestinationSelect(destination)}
              >
                <Text style={styles.pillText}>{destination.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedDestination && selectedDestination.images.length > 0 && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedDestination.images[imageIndex].image }}
            style={styles.image}
          />
          <View style={styles.imageControls}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => setImageIndex((prev) => (prev > 0 ? prev - 1 : 0))}
            >
              <Icon name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() =>
                setImageIndex((prev) =>
                  prev < selectedDestination.images.length - 1 ? prev + 1 : prev
                )
              }
            >
              <Icon name="arrow-forward" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {hotels.length > 0 && (
        <View style={styles.hotelsContainer}>
          <Text style={styles.sectionTitle}>Hotels in {selectedCity?.name}</Text>
          <ScrollView contentContainerStyle={styles.hotelCards}>
            {hotels.map((hotel) => (
              <TouchableOpacity
                key={hotel.id}
                style={styles.hotelCard}
                onPress={() => handleHotelSelect(hotel)}
              >
                <Image
                  source={{ uri: hotel.images[0]?.image }}
                  style={styles.hotelImage}
                />
                <View style={styles.hotelDescription}>
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <Text style={styles.hotelOwner}>Owner: {hotel.owner_name}</Text>
                  <Text style={styles.hotelContact}>Contact: {hotel.contact}</Text>
                  <Text style={styles.hotelAddress}>{hotel.address}</Text>
                  <Text style={styles.hotelAmenities}>Amenities: {hotel.amenities}</Text>
                  <Text style={styles.hotelPriceRange}>Price: {hotel.price_range}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingTop: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locateButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00aaff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cityCirclesScrollView: {
    flexGrow: 1,
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cityCircle: {
    backgroundColor: '#0077b6',
    width: 50,
    height: 50,
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cityText: {
    color: '#fff',
    fontSize: 12,
  },
  pillsContainer: {
    marginBottom: 20,
  },
  pillsScrollView: {
    flexDirection: 'row',
  },
  pill: {
    backgroundColor: '#0077b6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
    marginRight: 8,
  },
  pillText: {
    color: '#fff',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    width: windowWidth - 32,
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
  imageControls: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  arrowButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 50,
  },
  hotelsContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  hotelCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hotelCard: {
    width: windowWidth - 32,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  hotelImage: {
    width: '100%',
    height: 150,
  },
  hotelDescription: {
    padding: 12,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom:12,
  },
  hotelOwner: {
    fontSize: 14,
  },
  hotelContact: {
    fontSize: 14,
  },
  hotelAddress: {
    fontSize: 14,
  },
  hotelAmenities: {
    fontSize: 14,
  },
  hotelPriceRange: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default CustomerScreen;
