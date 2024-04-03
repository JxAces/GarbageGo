import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
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
  button: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  marker: {
    backgroundColor: 'blue',
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 5,
  },
});

export default function Driver() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [intermediaryPoints, setIntermediaryPoints] = useState([]);
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    // Set the hardcoded points
    setOrigin({
      latitude: 8.23706,
      longitude: 124.251,
    });
    setDestination({
      latitude: 8.26912,
      longitude: 124.29494,
    });
    setIntermediaryPoints([
      //create a algorithm here to make an optimal sequence of all the nodes
      // here are the list of nodes
      { latitude: 8.21593, longitude: 124.23881 },
      { latitude: 8.21749, longitude: 124.23986 },
      { latitude: 8.24351, longitude: 124.25945 },
      { latitude: 8.22894, longitude: 124.23356 },
      { latitude: 8.22944, longitude: 124.23521 },
      { latitude: 8.2273, longitude: 124.24065 },
      { latitude: 8.23105, longitude: 124.23541 },
      { latitude: 8.22885, longitude: 124.23841 },
    ]);
  }, []);

  // Nearest Neighbor Algorithm to optimize route sequence
  const nearestNeighbor = (points) => {
    const visited = new Set();
    let currentPoint = points[0];
    const optimizedSequence = [currentPoint];

    visited.add(currentPoint);

    while (visited.size < points.length) {
      let nearest = null;
      let nearestDistance = Number.MAX_VALUE;

      points.forEach((point) => {
        if (!visited.has(point)) {
          const distance = getDistance(currentPoint, point);
          if (distance < nearestDistance) {
            nearest = point;
            nearestDistance = distance;
          }
        }
      });

      optimizedSequence.push(nearest);
      visited.add(nearest);
      currentPoint = nearest;
    }

    return optimizedSequence;
  };

  // Helper function to calculate distance between two points
  const getDistance = (point1, point2) => {
    const lat1 = point1.latitude;
    const lon1 = point1.longitude;
    const lat2 = point2.latitude;
    const lon2 = point2.longitude;

    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
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
      const optimizedSequence = nearestNeighbor([
        origin,
        ...intermediaryPoints,
        destination,
      ]);
      mapRef.current?.fitToCoordinates(optimizedSequence, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_POSITION}>
        
        {origin && <Marker coordinate={origin} title="Origin" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
        {intermediaryPoints.map((point, index) => (
          <Marker key={index} coordinate={point} pinColor="blue" title={`Point ${index + 1}`} />
        ))}
        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            waypoints={intermediaryPoints}
            apikey={GOOGLE_API_KEY}
            strokeColor="#6644ff"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>
      {distance && duration ? (
        <View>
          <Text>Distance: {distance.toFixed(2)}</Text>
          <Text>Duration: {Math.ceil(duration)} min</Text>
        </View>
      ) : null}
      {!showDirections && (
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Trace route</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}