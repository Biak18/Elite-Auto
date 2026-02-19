// app/seller/[id].tsx
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
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditCarScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    isLoading: sellerCarLoading,
    selectedCar,
    getCarById,
    getCarByOwnerId,
  } = useCarStore();

  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<SelectedImage[]>([]);

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

  useEffect(() => {
    getCarById(id);
  }, [id]);

  useEffect(() => {
    const data = selectedCar;
    if (!data) return;

    setForm({
      name: data.name,
      brand: data.brand,
      model: data.model,
      year: data.year.toString(),
      price: data.price.toString(),
      description: data.description,
      horsepower: data.horsepower,
      acceleration: data.acceleration,
      type: data.type,
      fuelType: data.fuel_type,
      transmission: data.transmission,
      seats: data.seats.toString(),
    });

    setImages(
      data.car_images.map((car, index) => ({
        uri: car.image_url,
        base64: "",
        mimeType: "image/jpeg",
        isPrimary: car.is_primary,
      })),
    );
  }, [selectedCar]);

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
        selectionLimit: 6 - images.length,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const newImages: SelectedImage[] = result.assets.map((asset) => ({
          uri: asset.uri,
          base64: asset.base64 || "",
          mimeType: asset.mimeType || "image/jpeg",
          isPrimary: false,
          isExisting: false,
        }));

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

  const getStoragePath = (url: string) => {
    const marker = "/car-images/";
    const parts = url.split(marker);
    return parts.length > 1 ? parts[1] : "";
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      showMessage(error, "warning");
      return;
    }

    setIsLoading(true);

    try {
      if (!id) throw new Error("Car ID not found");

      const carId = id;

      const { error: carError } = await supabase
        .from("cars")
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", carId);

      if (carError) throw carError;

      const { data: oldImages, error: fetchError } = await supabase
        .from("car_images")
        .select("image_url")
        .eq("car_id", carId);

      if (fetchError) throw fetchError;

      const oldStoragePaths =
        oldImages.map((img) => getStoragePath(img.image_url)).filter(Boolean) ??
        [];

      const uploadedImages: {
        car_id: string;
        image_url: string;
        is_primary: boolean;
      }[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        if (!img.base64) {
          uploadedImages.push({
            car_id: carId,
            image_url: img.uri,
            is_primary: img.isPrimary,
          });
          continue;
        }

        const publicUrl = await uploadCarImage(
          img.base64,
          img.mimeType,
          carId,
          i,
        );

        uploadedImages.push({
          car_id: carId,
          image_url: publicUrl,
          is_primary: img.isPrimary,
        });
      }

      if (oldStoragePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("car-images")
          .remove(oldStoragePaths);

        if (storageError) throw storageError;
      }

      const { error: deleteDbError } = await supabase
        .from("car_images")
        .delete()
        .eq("car_id", carId);

      if (deleteDbError) throw deleteDbError;

      const { error: insertError } = await supabase
        .from("car_images")
        .insert(uploadedImages);

      if (insertError) throw insertError;

      const primaryImage = uploadedImages.find((img) => img.is_primary);

      if (primaryImage) {
        await supabase
          .from("cars")
          .update({ image_url: primaryImage.image_url })
          .eq("id", carId);
      }

      showMessage(t("carUpdatedMessage"), "success", {
        onClose: () => {
          if (user) {
            getCarByOwnerId(user.id);
            getCarById(id);
          }
          router.back();
        },
      });
    } catch (err: any) {
      showMessage(err.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View className="flex-1">
          <View className="bg-secondary h-16 flex-row justify-between items-center px-4">
            <TouchableOpacity onPress={() => router.back()} className="w-20">
              <Ionicons name="chevron-back" size={24} color="#fbbf24" />
            </TouchableOpacity>
            <Text className="text-xl font-orbitron text-accent">Edit Car</Text>
            <View className="w-20" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                {t("carImages")}
              </Text>

              <View className="flex-row flex-wrap gap-3">
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

                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center border-2 border-primary"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}

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
                {t("tapToSetPrimary")}
              </Text>
            </View>

            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                {t("basicInformation")}
              </Text>

              <FormField
                title={t("carName")}
                value={form.name}
                placeholder="e.g. 911 GT3"
                handleChangeText={(text) => setForm({ ...form, name: text })}
                iconName="car-sport-outline"
              />

              <FormField
                title={t("brand")}
                value={form.brand}
                placeholder="e.g. Porsche"
                handleChangeText={(text) => setForm({ ...form, brand: text })}
                iconName="globe-outline"
                otherStyles="mt-4"
              />

              <FormField
                title={t("model")}
                value={form.model}
                placeholder="e.g. 911"
                handleChangeText={(text) => setForm({ ...form, model: text })}
                iconName="layers-outline"
                otherStyles="mt-4"
              />

              <View className="flex-row gap-4 mt-4">
                <View className="flex-1">
                  <FormField
                    title={t("year")}
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
                    title={t("seats")}
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

            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                {t("pricing")}
              </Text>

              <FormField
                title={t("price")}
                value={form.price}
                placeholder="e.g. 185000"
                handleChangeText={(text) => setForm({ ...form, price: text })}
                iconName="cash-outline"
                keyboardType="numeric"
              />
            </View>

            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                {t("specifications")}
              </Text>

              <DropdownPicker
                title={t("carType")}
                value={form.type}
                placeholder={t("selectCarType")}
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
                  title={t("fuelType")}
                  value={form.fuelType}
                  placeholder={t("selectFuelType")}
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
                  title={t("transmission")}
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
                title={t("horsepower")}
                value={form.horsepower}
                placeholder="e.g. 450 HP"
                handleChangeText={(text) =>
                  setForm({ ...form, horsepower: text })
                }
                iconName="speedometer-outline"
                otherStyles="mt-4"
              />

              <FormField
                title={t("acceleration")}
                value={form.acceleration}
                placeholder="e.g. 3.5s"
                handleChangeText={(text) =>
                  setForm({ ...form, acceleration: text })
                }
                iconName="flash-outline"
                otherStyles="mt-4"
              />
            </View>

            <View className="px-6 mt-6">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                {t("description")}
              </Text>

              <Text className="text-base text-gray-300 font-medium mb-2">
                {t("aboutThisCarField")}
              </Text>
              <View
                className="w-full px-4 py-3 bg-slate-900/60 rounded-2xl border border-slate-600"
                style={{ minHeight: 120 }}
              >
                <FormField
                  title=""
                  value={form.description}
                  placeholder={t("describeTheCar")}
                  handleChangeText={(text) =>
                    setForm({ ...form, description: text })
                  }
                  iconName="chatbubble-outline"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

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
                  {isLoading ? t("updating") : t("updateCar")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {isLoading && (
            <View className="absolute inset-0 bg-black/60 justify-center items-center">
              <View className="bg-secondary p-6 rounded-2xl items-center border border-slate-700">
                <ActivityIndicator color="#fbbf24" size="large" />
                <Text className="text-slate-300 text-sm mt-3">
                  {isLoading ? "Updating..." : "Loading..."}
                </Text>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
