import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Modal, StyleSheet, Text, Image, ScrollView, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons for breadcrumb
import CustomerScreen from '../../components/CustomerScreen'; // Assuming this is the path

const Tab = createBottomTabNavigator();

const windowWidth = Dimensions.get('window').width; // For responsive design

const TabNavigator = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isHomeScreen, setIsHomeScreen] = useState<boolean>(true); // Track if it's the Home screen

  const dummyMessages = [
    { id: 1, text: "Hello! How can I help you today?", sender: "bot" },
    { id: 2, text: "I need some assistance with my order.", sender: "user" },
    { id: 3, text: "Sure! What do you need help with?", sender: "bot" },
  ];

  const sendMessage = () => {
    if (message.trim()) {
      dummyMessages.push({ id: dummyMessages.length + 1, text: message, sender: "user" });
      setMessage('');
    }
  };

  const handleNavigationBack = () => {
    // Logic for back navigation
    setIsHomeScreen(false); // Example, this simulates the behavior when it's not on Home screen
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleNavigationBack}>
          {isHomeScreen ? (
            <MaterialIcons name="menu" size={24} color="#000" />  /* Breadcrumb icon */
          ) : (
            <Ionicons name="chevron-back-outline" size={24} color="#000" />  /* Back arrow icon */
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
        />
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Bottom Tabs */}
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { height: 60 },
          tabBarShowLabel: false, // Removes tab titles
        }}
      >
        <Tab.Screen
          name="Home"
          component={CustomerScreen} // Home renders CustomerScreen
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={() => <PlaceholderScreen title="Bookings" />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Feed"
          component={() => <PlaceholderScreen title="Feed" />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="newspaper-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Logo"
          component={() => <PlaceholderScreen title="Logo Placeholder" />}
          options={{
            tabBarIcon: () => (
              <View style={styles.logoTabContainer}>
                <Image
                  source={require('../../assets/images/logo.png')} // Replace with the path to your logo
                  style={styles.logo}
                />
              </View>
            ),
            tabBarButton: () => (
              <TouchableOpacity style={styles.logoTabContainer} onPress={() => setModalVisible(true)}>
                <Image
                  source={require('../../assets/images/logo.png')} // Replace with the path to your logo
                  style={styles.logo}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Order"
          component={() => <PlaceholderScreen title="Order Food" />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="fast-food-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Transport Booking"
          component={() => <PlaceholderScreen title="Transport Booking" />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="car-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Checkout"
          component={() => <PlaceholderScreen title="Checkout" />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cash-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Chat Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.chatContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="#000" />
            </TouchableOpacity>

            {/* Chat messages */}
            <ScrollView contentContainerStyle={styles.chatMessages}>
              {dummyMessages.map((message) => (
                <View
                  key={message.id}
                  style={[styles.message, message.sender === "user" ? styles.userMessage : styles.botMessage]}
                >
                  <Text>{message.text}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Input area */}
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.micButton}>
                <Ionicons name="mic-outline" size={24} color="#000" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message"
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Ionicons name="send-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TabNavigator;

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.screenContainer}>
    <Text>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchBar: {
    flex: 1,
    marginHorizontal: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxWidth: windowWidth * 0.6, // Adjust based on screen size for responsiveness
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTabContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -45,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatContainer: {
    backgroundColor: '#fff',
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  chatMessages: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  message: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#b3e5fc',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  micButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    borderRadius: 20,
    padding: 10,
  },
});
