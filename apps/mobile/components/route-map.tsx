import MapView, { Polyline, Marker } from "react-native-maps";
import { View, Text } from "react-native";

function geojsonToLatLngs(routeGeoJson: any) {
  const coords = routeGeoJson.features?.[0]?.geometry?.coordinates ?? [];
  return coords.map(([lng, lat]: [number, number]) => ({
    latitude: lat,
    longitude: lng
  }));
}

export default function RouteMap({ routeResult }: { routeResult: any }) {
  const points = geojsonToLatLngs(routeResult);
  const props = routeResult.features?.[0]?.properties;

  if (!points.length) return <Text>No route</Text>;

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: first.latitude,
          longitude: first.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
      >
        <Marker coordinate={first} title="Start" />
        <Marker coordinate={last} title="End" />
        <Polyline
          coordinates={points}
          strokeWidth={5}
        />
      </MapView>

      <View style={{ padding: 12 }}>
        <Text>
          {props?.distance} {props?.distance_units}, {props?.time}
        </Text>
      </View>
    </View>
  );
}