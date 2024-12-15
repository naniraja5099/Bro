import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Hotel = {
  id: number;
  name: string;
  images: { id: number; image: string }[];
};

type ReserveScreenProps = {
  hotel: Hotel;
  onBack: () => void;
};

const ROOMS_URL = (hotelId: number) => `http://127.0.0.1:8000/api/floor/rooms/${hotelId}/`;

const ReserveScreen: React.FC<ReserveScreenProps> = ({ hotel, onBack }) => {
  const [floors, setFloors] = useState<number[]>([]);
  const [rooms, setRooms] = useState<{ [floor: number]: any[] }>({});
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [mealPlan, setMealPlan] = useState<string>('EP'); // Default meal plan

  React.useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(ROOMS_URL(hotel.id));
        const data = await response.json();

        const floorMap: { [key: number]: any[] } = {};
        data.forEach((room: any) => {
          if (!floorMap[room.floor]) floorMap[room.floor] = [];
          floorMap[room.floor].push(room);
        });

        const floorNumbers = Object.keys(floorMap).map(Number);
        setFloors(floorNumbers);
        setRooms(floorMap);
        setSelectedFloor(floorNumbers[0]);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch rooms for the selected hotel');
      }
    };

    fetchRooms();
  }, [hotel]);

  const handleReserve = (room: any) => {
    setSelectedRoom(room);
    setShowReserveModal(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (showDatePicker === 'checkIn') {
      setCheckInDate(selectedDate || checkInDate);
    } else if (showDatePicker === 'checkOut') {
      setCheckOutDate(selectedDate || checkOutDate);
    }
    setShowDatePicker(null); // Close the picker
  };

  const calculateAdvance = () => {
    if (checkInDate && checkOutDate && selectedRoom) {
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return (diffDays * selectedRoom.price * 0.25).toFixed(2);
    }
    return '0.00';
  };

  const currentFloorRooms = selectedFloor !== null ? rooms[selectedFloor] : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.bookingScreenContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Image source={{ uri: hotel.images[0]?.image }} style={styles.bookingImage} />
        <Text style={styles.hotelName}>{hotel.name}</Text>

        <ScrollView horizontal contentContainerStyle={styles.floorsContainer}>
          {floors.map((floor) => (
            <TouchableOpacity
              key={floor}
              style={[styles.floorPill, selectedFloor === floor && styles.selectedFloorPill]}
              onPress={() => setSelectedFloor(floor)}
            >
              <Text style={styles.floorText}>Floor {floor}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal contentContainerStyle={styles.roomsContainer}>
          {currentFloorRooms.map((room: any) => (
            <View key={room.id} style={styles.roomCard}>
              <Image
                source={{ uri: room.image || 'https://via.placeholder.com/150' }}
                style={styles.roomImage}
              />
              <Text style={styles.roomTitle}>
                Room {room.room_number} - {room.type_of_room}
              </Text>
              <Text style={styles.roomDetail}>Capacity: {room.capacity}</Text>
              <Text style={styles.roomDetail}>Price: ₹{room.price}</Text>
              <Text style={styles.roomDetail}>
                Status: {room.status === 'No' ? 'Available' : 'Booked'}
              </Text>
              {room.status === 'No' && (
                <TouchableOpacity
                  style={styles.reserveButton}
                  onPress={() => handleReserve(room)}
                >
                  <Text style={styles.reserveButtonText}>Reserve</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        <Modal visible={showReserveModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReserveModal(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Reserve Room {selectedRoom?.room_number}</Text>

              <TouchableOpacity
                onPress={() => setShowDatePicker('checkIn')}
                style={styles.dateInput}
              >
                <Text>
                  Check-In: {checkInDate ? checkInDate.toDateString() : 'Select Date'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowDatePicker('checkOut')}
                style={styles.dateInput}
              >
                <Text>
                  Check-Out: {checkOutDate ? checkOutDate.toDateString() : 'Select Date'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              <Text style={styles.sectionTitle}>Meal Plan:</Text>
              <ScrollView horizontal contentContainerStyle={styles.mealPlanContainer}>
                {['EP', 'AP', 'CP', 'MAP'].map((plan) => (
                  <TouchableOpacity
                    key={plan}
                    style={[
                      styles.mealPlanOption,
                      mealPlan === plan && styles.selectedMealPlanOption,
                    ]}
                    onPress={() => setMealPlan(plan)}
                  >
                    <Text
                      style={[
                        styles.mealPlanText,
                        mealPlan === plan && styles.selectedMealPlanText,
                      ]}
                    >
                      {plan}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.advanceText}>
                Advance: ₹{calculateAdvance()} (25%)
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flexGrow: 2,
      backgroundColor: '#f9f9f9',
      paddingHorizontal: 16,
      paddingTop: 5,
    },
    bookingScreenContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
    backButton: { marginBottom: 20 },
    backButtonText: { fontSize: 18, color: '#0077b6' },
    bookingImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 16 },
    hotelName: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    floorsContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      flexWrap: 'nowrap',
    },
    floorPill: {
      backgroundColor: '#0077b6',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 50,
      marginRight: 8,
    },
    selectedFloorPill: { backgroundColor: '#00aaff' },
    floorText: { color: '#fff' },
    roomsContainer: {
      flexDirection: 'row',
      marginTop: 16,
    },
    roomCard: {
      backgroundColor: '#fff',
      borderRadius: 10,
      marginRight: 16,
      padding: 12,
      width: 300,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    roomImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      marginBottom: 8,
    },
    roomTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    roomDetail: { fontSize: 14, marginBottom: 4 },
    reserveButton: {
      backgroundColor: '#0077b6',
      paddingVertical: 10,
      borderRadius: 25,
      alignItems: 'center',
    },
    reserveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      width: '90%',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: '#f2f2f2',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
    },
    closeButtonText: {
      color: '#333',
      fontSize: 18,
      fontWeight: 'bold',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    dateInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      width: '90%',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      alignSelf: 'flex-start',
    },
    mealPlanContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      width: '100%',
    },
    mealPlanOption: {
      backgroundColor: '#f2f2f2',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginHorizontal: 5,
    },
    selectedMealPlanOption: {
      backgroundColor: '#0077b6',
    },
    mealPlanText: {
      color: '#333',
      fontSize: 14,
    },
    selectedMealPlanText: {
      color: '#fff',
    },
    advanceText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 10,
      textAlign: 'center',
    },
  });  

export default ReserveScreen;
