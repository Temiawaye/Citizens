import { Image } from "expo-image";
import { cssInterop } from "nativewind";
import MapView from "react-native-maps";

cssInterop(Image, { className: "style" });
cssInterop(MapView, { className: "style" });
