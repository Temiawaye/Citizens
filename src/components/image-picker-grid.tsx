import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { MAX_IMAGES } from '@/lib/constants';

export function ImagePickerGrid({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const add = async (source: 'camera' | 'library') => {
    const permission = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', `Allow ${source === 'camera' ? 'camera' : 'photo library'} access in Settings to attach evidence.`, [{ text: 'Cancel' }, { text: 'Open Settings', onPress: () => void Linking.openSettings() }]);
    const result = source === 'camera' ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsMultipleSelection: true, selectionLimit: MAX_IMAGES - images.length });
    if (!result.canceled) onChange([...images, ...result.assets.map((asset) => asset.uri)].slice(0, MAX_IMAGES));
  };
  return <View className="gap-3"><Text className="font-semibold text-slate-700">Photos ({images.length}/{MAX_IMAGES})</Text><View className="flex-row flex-wrap gap-3">{images.map((uri, index) => <View key={uri} className="relative"><Image source={uri} className="h-24 w-24 rounded-xl" /><Pressable accessibilityLabel={`Remove photo ${index + 1}`} onPress={() => onChange(images.filter((item) => item !== uri))} className="absolute -right-2 -top-2 h-8 w-8 items-center justify-center rounded-full bg-red-600"><Text className="font-bold text-white">×</Text></Pressable></View>)}</View>{images.length < MAX_IMAGES ? <View className="flex-row gap-3"><Pressable onPress={() => void add('camera')} className="min-h-11 flex-1 items-center justify-center rounded-xl bg-slate-200"><Text className="font-semibold">Take photo</Text></Pressable><Pressable onPress={() => void add('library')} className="min-h-11 flex-1 items-center justify-center rounded-xl bg-slate-200"><Text className="font-semibold">Choose photos</Text></Pressable></View> : null}</View>;
}
