import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_API_KEY } from "../environments";
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const ILIGAN_CITY_LATITUDE = 8.228;
const ILIGAN_CITY_LONGITUDE = 124.2453;
const LATITUDE_DELTA = 0.0922; // Adjust for the initial zoom level
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
  latitude: ILIGAN_CITY_LATITUDE,
  longitude: ILIGAN_CITY_LONGITUDE,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const edgePaddingValue = 70;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  searchContainer: {
    position: 'absolute',
    width: '90%',
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
    top: Constants.statusBarHeight,
  },
  input: {
    borderColor: '#888',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#bbb',
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 4,
  },
  buttonText: {
    textAlign: 'center',
  },
});

export default function Driver() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const mapRef = useRef(null);

  const moveTo = async (position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };

  const edgePadding = {
    top: edgePaddingValue,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };

  const traceRouteOnReady = (args) => {
    if (args) {
      setDistance(args.distance);
      setDuration(args.duration);
    }
  };

  const traceRoute = () => {
    if (origin && destination) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
    }
  };

  const onRegionChangeComplete = (newRegion) => {
    // Enforcing zoom level by checking latitudeDelta
    if (newRegion.latitudeDelta > LATITUDE_DELTA) {
      mapRef.current.animateToRegion(INITIAL_POSITION, 100); // Reset to initial zoom level
    }
  };

  const onPlaceSelected = (details, flag) => {
    const set = flag === 'origin' ? setOrigin : setDestination;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    set(position);
    moveTo(position);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_POSITION}
        onRegionChangeComplete={onRegionChangeComplete}>
        
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} />}
        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            strokeColor="#6644ff"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>
      <View style={styles.searchContainer}>
       <Text>Origin</Text>
        <GooglePlacesAutocomplete
          styles={{ textInput: styles.input }}
          placeholder=""
          fetchDetails
          onPress={(data, details = null) => {
            onPlaceSelected(details, 'origin');
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: 'en',
            location: `${ILIGAN_CITY_LATITUDE},${ILIGAN_CITY_LONGITUDE}`,
            radius: 5000, // Set the radius to cover the area of Iligan City
          }}
        />
        <Text>Destination</Text>
        <GooglePlacesAutocomplete
          styles={{ textInput: styles.input }}
          placeholder=""
          fetchDetails
          onPress={(data, details = null) => {
            onPlaceSelected(details, 'destination');
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: 'en',
          }}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Trace route</Text>
        </TouchableOpacity>
        {distance && duration ? (
          <View>
            <Text>Distance: {distance.toFixed(2)}</Text>
            <Text>Duration: {Math.ceil(duration)} min</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
