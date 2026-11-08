import { zodResolver } from "@hookform/resolvers/zod";
import * as Crypto from "expo-crypto";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Picker } from "@react-native-picker/picker";

import { AuthRequired } from "@/components/auth-required";
import { ImagePickerGrid } from "@/components/image-picker-grid";
import { LocationPicker } from "@/components/location-picker";
import { ErrorState, LoadingState } from "@/components/screen-state";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { CATEGORIES } from "@/lib/constants";
import { useIncident } from "@/hooks/use-incidents";
import { incidentKeys } from "@/lib/incidents";
import { queryClient } from "@/lib/query-client";
import { submitIncident, updateIncident } from "@/lib/submission";
import { incidentSchema, type IncidentFormValues } from "@/lib/validation";
import { useAuth } from "@/hooks/use-auth";
import { COLORS } from "@/lib/theme";

const EMPTY_REPORT_VALUES = {
  title: "",
  description: "",
  category: "Other",
  address: null,
  images: [],
} satisfies Partial<IncidentFormValues>;

/** Collects, validates, and publishes a signed-in user's incident report. */
export default function ReportScreen() {
  const { session } = useAuth();
  const { edit: editId } = useLocalSearchParams<{ edit?: string }>();
  const incidentToEdit = useIncident(editId ?? "");
  const hydratedIncidentId = useRef<string | null>(null);
  const [incidentId, setIncidentId] = useState(() => Crypto.randomUUID());
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: EMPTY_REPORT_VALUES,
  });

  useEffect(() => {
    if (!editId) {
      if (hydratedIncidentId.current) {
        hydratedIncidentId.current = null;
        reset(EMPTY_REPORT_VALUES);
      }

      return;
    }

    const incident = incidentToEdit.data;
    if (!incident || incident.user_id !== session?.user.id) return;
    if (hydratedIncidentId.current === incident.id) return;

    // Hydrate only once per incident so realtime refreshes do not overwrite user edits.
    hydratedIncidentId.current = incident.id;
    reset({
      title: incident.title,
      description: incident.description,
      category: incident.category,
      latitude: incident.latitude,
      longitude: incident.longitude,
      address: incident.address,
      images: [],
    });
  }, [editId, incidentToEdit.data, reset, session?.user.id]);

  if (!session) return <AuthRequired route="/(tabs)/report" />;

  if (editId && incidentToEdit.isLoading) {
    return <LoadingState label="Loading report…" />;
  }

  if (editId && (incidentToEdit.isError || !incidentToEdit.data)) {
    return (
      <ErrorState
        message="This report could not be loaded for editing."
        retry={() => void incidentToEdit.refetch()}
      />
    );
  }

  if (editId && incidentToEdit.data?.user_id !== session.user.id) {
    return (
      <ErrorState
        message="You can only edit reports that you created."
        retry={() => router.back()}
      />
    );
  }

  const existingPhotoCount = incidentToEdit.data?.image_urls.length ?? 0;

  const submit = handleSubmit(async (values) => {
    try {
      if (editId) {
        await updateIncident({
          id: editId,
          userId: session.user.id,
          values,
        });
        await queryClient.invalidateQueries({ queryKey: incidentKeys.all });
        Alert.alert("Report updated", "Your changes are now public.");
        router.replace(`/incident/${editId}`);
        return;
      }

      await submitIncident({ id: incidentId, userId: session.user.id, values });
      await queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      setIncidentId(Crypto.randomUUID());
      reset(EMPTY_REPORT_VALUES);
      Alert.alert(
        "Report published",
        "Your incident is now visible to everyone.",
      );
      router.push(`/incident/${incidentId}`);
    } catch (error) {
      Alert.alert(
        "Could not publish",
        error instanceof Error
          ? `${error.message}\n\nYour form is preserved. Tap submit to retry.`
          : "Your form is preserved. Try again.",
      );
    }
  });
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
      className="flex-1 bg-canvas"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-5 p-4 pb-12"
      >
        <Text className="text-sm text-muted">
          {editId
            ? "Update the report details and location below. Existing photos are preserved."
            : "Reports are posted immediately. Descriptions, photos, your display name, and coordinates are public."}
        </Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Title"
              value={value}
              onChangeText={onChange}
              error={errors.title?.message}
              maxLength={120}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Description"
              value={value}
              onChangeText={onChange}
              error={errors.description?.message}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={2000}
            />
          )}
        />
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View className="gap-2">
              <Text className="font-semibold text-ink">Category</Text>
              <View className="rounded-xl border border-outline bg-surface">
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  dropdownIconColor={COLORS.supporting}
                  style={{ color: COLORS.text, backgroundColor: COLORS.surface }}
                >
                  {CATEGORIES.map((category) => (
                    <Picker.Item
                      key={category}
                      label={category}
                      value={category}
                      color={COLORS.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        />
        {editId ? (
          <View className="gap-2 rounded-control border border-outline bg-surface p-4">
            <Text className="font-semibold text-ink">Photos</Text>
            <Text className="text-sm text-muted">
              {existingPhotoCount
                ? `${existingPhotoCount} existing ${existingPhotoCount === 1 ? "photo" : "photos"} will be preserved.`
                : "This report has no photos."}
            </Text>
          </View>
        ) : (
          <Controller
            control={control}
            name="images"
            render={({ field: { onChange, value } }) => (
              <ImagePickerGrid images={value} onChange={onChange} />
            )}
          />
        )}
        <Controller
          control={control}
          name="latitude"
          render={({ field: latitudeField }) => (
            <Controller
              control={control}
              name="longitude"
              render={({ field: longitudeField }) => (
                <Controller
                  control={control}
                  name="address"
                  render={({ field: addressField }) => (
                    <View>
                      <LocationPicker
                        value={
                          typeof latitudeField.value === "number" &&
                          typeof longitudeField.value === "number"
                            ? {
                                latitude: latitudeField.value,
                                longitude: longitudeField.value,
                                address: addressField.value,
                              }
                            : null
                        }
                        onChange={(location) => {
                          latitudeField.onChange(location.latitude);
                          longitudeField.onChange(location.longitude);
                          addressField.onChange(location.address);
                        }}
                      />
                      {errors.latitude || errors.longitude ? (
                        <Text accessibilityRole="alert" className="mt-2 font-medium text-danger-600">
                          Choose an incident location.
                        </Text>
                      ) : null}
                    </View>
                  )}
                />
              )}
            />
          )}
        />
        <Button loading={isSubmitting} onPress={() => void submit()}>
          {editId ? "Save changes" : "Publish report"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
