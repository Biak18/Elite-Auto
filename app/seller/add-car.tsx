// app/seller/add-car.tsx
import DropdownPicker from "@/src/components/ui/DropdownPicker";
import FormField from "@/src/components/ui/FormField";
import { uploadCarImage } from "@/src/lib/api/users";
import { supabase } from "@/src/lib/supabase";
import { showMessage } from "@/src/lib/utils/dialog";
import { useAuthStore } from "@/src/store/authStore";
import { useCarStore } from "@/src/store/carStore";
import { SelectedImage } from "@/src/types/interfaces";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddCarScreen() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const { getCarByOwnerId } = useCarStore();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    description: "",
    horsepower: "",
    acceleration: "",
    type: "",
    fuelType: "",
    transmission: "",
    seats: "",
  });

  const typeOptions = [
    "Sedan",
    "SUV",
    "Sports",
    "Luxury",
    "Electric",
    "Convertible",
    "Hatchback",
  ];
  const fuelOptions = [
    "Gasoline",
    "Diesel",
    "Electric",
    "Hybrid",
    "Plug-in Hybrid",
  ];

  const transmissionOptions = ["Automatic", "Manual"];

  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showFuelPicker, setShowFuelPicker] = useState(false);
  const [showTransmissionPicker, setShowTransmissionPicker] = useState(false);

  const pickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showMessage(
          "Permission required \n Please allow access to your photos.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: true,
        selectionLimit: 6 - images.length, // Max 6 images total
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const newImages: SelectedImage[] = result.assets.map(
          (asset, index) => ({
            uri: asset.uri,
            base64: asset.base64 || "",
            mimeType: asset.mimeType || "image/jpeg",
            isPrimary: images.length === 0 && index === 0,
          }),
        );

        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      showMessage("Failed to pick images", "error");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index].isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index })),
    );
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Car name is required";
    if (!form.brand.trim()) return "Brand is required";
    if (!form.model.trim()) return "Model is required";
    if (!form.year.trim()) return "Year is required";
    if (
      isNaN(Number(form.year)) ||
      Number(form.year) < 1900 ||
      Number(form.year) > 2026
    )
      return "Please enter a valid year";
    if (!form.price.trim()) return "Price is required";
    if (isNaN(Number(form.price)) || Number(form.price) <= 0)
      return "Please enter a valid price";
    if (!form.type) return "Please select a car type";
    if (!form.fuelType) return "Please select a fuel type";
    if (!form.transmission) return "Please select a transmission type";
    if (images.length === 0) return "Please add at least one image";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      showMessage(error, "warning");
      return;
    }

    setIsLoading(true);
    try {
      // const primaryIndex = images.findIndex((img) => img.isPrimary);

      const { data: carData, error: carError } = await supabase
        .from("cars")
        .insert({
          name: form.name.trim(),
          brand: form.brand.trim(),
          model: form.model.trim(),
          year: Number(form.year),
          price: Number(form.price),
          description: form.description.trim(),
          horsepower: form.horsepower.trim() || null,
          acceleration: form.acceleration.trim() || null,
          type: form.type,
          fuel_type: form.fuelType,
          transmission: form.transmission,
          seats: form.seats ? Number(form.seats) : null,
          owner_id: user?.id,
          status: "pending",
          featured: false,
          available: true,
          image_url: "",
        })
        .select("id")
        .single();

      if (carError) throw carError;

      const carId = carData.id;

      for (let i = 0; i < images.length; i++) {
        const publicUrl = await uploadCarImage(
          images[i].base64,
          images[i].mimeType,
          carId,
          i,
        );

        await supabase.from("car_images").insert({
          car_id: carId,
          image_url: publicUrl,
          is_primary: images[i].isPrimary,
        });

        if (images[i].isPrimary) {
          await supabase
            .from("cars")
            .update({ image_url: publicUrl })
            .eq("id", carId);
        }
      }

      showMessage(
        "Car Submitted! \n Your car has been submitted successfully. It will appear on the marketplace after admin review.",
        "success",
        {
          onClose: () => {
            if (user) {
              getCarByOwnerId(user.id);
            }

            router.back();
          },
        },
      );
    } catch (error: any) {
      showMessage(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={10}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1">
          {/* Top Bar */}
          <View className="bg-secondary h-16 flex-row justify-between items-center px-4">
            <TouchableOpacity onPress={() => router.back()} className="w-20">
              <Ionicons name="chevron-back" size={24} color="#fbbf24" />
            </TouchableOpacity>
            <Text className="text-xl font-orbitron-bold text-accent">
              Add Car
            </Text>
            <View className="w-20" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/*  Images  */}
            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Car Images
              </Text>

              <View className="flex-row flex-wrap gap-3">
                {/* Existing images */}
                {images.map((img, index) => (
                  <View key={index} className="relative">
                    <TouchableOpacity
                      onPress={() => setPrimary(index)}
                      className={`rounded-xl overflow-hidden border-2 ${
                        img.isPrimary ? "border-accent" : "border-slate-700/30"
                      }`}
                    >
                      <Image
                        source={{ uri: img.uri }}
                        className="w-24 h-24"
                        resizeMode="cover"
                      />
                      {img.isPrimary && (
                        <View className="absolute bottom-1 left-1 bg-accent px-2 py-0.5 rounded-md">
                          <Text className="text-primary text-xs font-bold">
                            Primary
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Remove button */}
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center border-2 border-primary"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add image button */}
                {images.length < 6 && (
                  <TouchableOpacity
                    onPress={pickImages}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-600 items-center justify-center"
                  >
                    <Ionicons name="camera-outline" size={28} color="#64748b" />
                    <Text className="text-slate-500 text-xs mt-1">Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text className="text-slate-500 text-xs mt-3">
                Tap an image to set as primary. Max 6 images.
              </Text>
            </View>

            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Basic Information
              </Text>

              <FormField
                title="Car Name"
                value={form.name}
                placeholder="e.g. 911 GT3"
                handleChangeText={(text) => setForm({ ...form, name: text })}
                iconName="car-sport-outline"
              />

              <FormField
                title="Brand"
                value={form.brand}
                placeholder="e.g. Porsche"
                handleChangeText={(text) => setForm({ ...form, brand: text })}
                iconName="globe-outline"
                otherStyles="mt-4"
              />

              <FormField
                title="Model"
                value={form.model}
                placeholder="e.g. 911"
                handleChangeText={(text) => setForm({ ...form, model: text })}
                iconName="layers-outline"
                otherStyles="mt-4"
              />

              <View className="flex-row gap-4 mt-4">
                <View className="flex-1">
                  <FormField
                    title="Year"
                    value={form.year}
                    placeholder="2024"
                    handleChangeText={(text) =>
                      setForm({ ...form, year: text })
                    }
                    iconName="calendar-outline"
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <FormField
                    title="Seats"
                    value={form.seats}
                    placeholder="5"
                    handleChangeText={(text) =>
                      setForm({ ...form, seats: text })
                    }
                    iconName="people-outline"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/*  Price  */}
            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Pricing
              </Text>

              <FormField
                title="Price (USD)"
                value={form.price}
                placeholder="e.g. 185000"
                handleChangeText={(text) => setForm({ ...form, price: text })}
                iconName="cash-outline"
                keyboardType="numeric"
              />
            </View>

            {/*  Specs  */}
            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Specifications
              </Text>

              <DropdownPicker
                title="Car Type"
                value={form.type}
                placeholder="Select car type"
                options={typeOptions}
                iconName="car-sport-outline"
                showPicker={showTypePicker}
                onToggle={() => {
                  setShowTypePicker(!showTypePicker);
                  setShowFuelPicker(false);
                  setShowTransmissionPicker(false);
                }}
                onSelect={(value) => {
                  setForm({ ...form, type: value });
                  setShowTypePicker(false);
                }}
              />

              <View className="mt-4">
                <DropdownPicker
                  title="Fuel Type"
                  value={form.fuelType}
                  placeholder="Select fuel type"
                  options={fuelOptions}
                  iconName="water-outline"
                  showPicker={showFuelPicker}
                  onToggle={() => {
                    setShowFuelPicker(!showFuelPicker);
                    setShowTypePicker(false);
                    setShowTransmissionPicker(false);
                  }}
                  onSelect={(value) => {
                    setForm({ ...form, fuelType: value });
                    setShowFuelPicker(false);
                  }}
                />
              </View>

              <View className="mt-4">
                <DropdownPicker
                  title="Transmission"
                  value={form.transmission}
                  placeholder="Select transmission"
                  options={transmissionOptions}
                  iconName="settings-outline"
                  showPicker={showTransmissionPicker}
                  onToggle={() => {
                    setShowTransmissionPicker(!showTransmissionPicker);
                    setShowTypePicker(false);
                    setShowFuelPicker(false);
                  }}
                  onSelect={(value) => {
                    setForm({ ...form, transmission: value });
                    setShowTransmissionPicker(false);
                  }}
                />
              </View>

              <FormField
                title="Horsepower"
                value={form.horsepower}
                placeholder="e.g. 450 HP"
                handleChangeText={(text) =>
                  setForm({ ...form, horsepower: text })
                }
                iconName="speedometer-outline"
                otherStyles="mt-4"
              />

              <FormField
                title="0-60 mph"
                value={form.acceleration}
                placeholder="e.g. 3.5s"
                handleChangeText={(text) =>
                  setForm({ ...form, acceleration: text })
                }
                iconName="flash-outline"
                otherStyles="mt-4"
              />
            </View>

            {/*  Description  */}
            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Description
              </Text>

              <Text className="text-base text-gray-300 font-medium mb-2">
                About This Car
              </Text>
              <View
                className="w-full px-4 py-3 bg-slate-900/60 rounded-2xl border border-slate-600"
                style={{ minHeight: 120 }}
              >
                <FormField
                  title=""
                  value={form.description}
                  placeholder="Describe the car..."
                  handleChangeText={(text) =>
                    setForm({ ...form, description: text })
                  }
                  iconName="chatbubble-outline"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/*  Submit Button  */}
            <View className="px-6 py-8">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className="bg-accent rounded-2xl py-4 flex-row items-center justify-center"
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color="#020617"
                />
                <Text className="text-primary font-bold text-lg ml-2">
                  {isLoading ? "Submitting..." : "Submit Car"}
                </Text>
              </TouchableOpacity>

              <Text className="text-slate-500 text-xs text-center mt-3">
                Your car will appear after admin review
              </Text>
            </View>
          </ScrollView>

          {/* Loading Overlay */}
          {isLoading && (
            <View className="absolute inset-0 bg-black/60 justify-center items-center">
              <View className="bg-secondary p-6 rounded-2xl items-center border border-slate-700">
                <ActivityIndicator color="#fbbf24" size="large" />
                <Text className="text-slate-300 text-sm mt-3">
                  Uploading...
                </Text>
              </View>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
