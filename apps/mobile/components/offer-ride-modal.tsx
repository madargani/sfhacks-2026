import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { brandColors } from "@/constants/theme";
import { CreateRideOffer } from "@evergreen/shared-types";

interface OfferRideModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rideOffer: CreateRideOffer) => Promise<void>;
  userId: string;
}

export function OfferRideModal({
  visible,
  onClose,
  onSubmit,
  userId,
}: OfferRideModalProps) {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [availableSeats, setAvailableSeats] = useState("1");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("OfferRideModal visible:", visible);
  }, [visible]);

  const handleSubmit = async () => {
    if (!fromAddress.trim() || !toAddress.trim()) {
      alert("Please enter both pickup and destination locations");
      return;
    }

    const seats = parseInt(availableSeats);
    if (isNaN(seats) || seats < 1 || seats > 8) {
      alert("Please enter a valid number of seats (1-8)");
      return;
    }

    setIsSubmitting(true);

    try {
      const rideOffer: CreateRideOffer = {
        userId,
        fromLocation: {
          address: fromAddress.trim(),
          latitude: 0, // TODO: Get actual coordinates from geocoding
          longitude: 0,
        },
        toLocation: {
          address: toAddress.trim(),
          latitude: 0, // TODO: Get actual coordinates from geocoding
          longitude: 0,
        },
        dateTime,
        availableSeats: seats,
        notes: notes.trim() || undefined,
      };

      await onSubmit(rideOffer);

      // Reset form
      setFromAddress("");
      setToAddress("");
      setDateTime(new Date());
      setAvailableSeats("1");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Error creating ride offer:", error);
      alert("Failed to create ride offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Offer a Ride</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.doneButton}
          >
            <Text
              style={[
                styles.doneText,
                isSubmitting && styles.doneTextDisabled,
              ]}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* From Location */}
          <View style={styles.section}>
            <Text style={styles.label}>From</Text>
            <View style={styles.inputContainer}>
              <View
                style={[styles.locationDot, { backgroundColor: brandColors.primary }]}
              />
              <TextInput
                style={styles.input}
                placeholder="Pickup location"
                placeholderTextColor={brandColors.beige}
                value={fromAddress}
                onChangeText={setFromAddress}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* To Location */}
          <View style={styles.section}>
            <Text style={styles.label}>To</Text>
            <View style={styles.inputContainer}>
              <View
                style={[styles.locationDot, { backgroundColor: brandColors.dark }]}
              />
              <TextInput
                style={styles.input}
                placeholder="Destination"
                placeholderTextColor={brandColors.beige}
                value={toAddress}
                onChangeText={setToAddress}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Date and Time */}
          <View style={styles.section}>
            <Text style={styles.label}>When</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>{formatDateTime(dateTime)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event: any, selectedDate?: Date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setDateTime(selectedDate);
                  if (Platform.OS !== "ios") {
                    setShowTimePicker(true);
                  }
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dateTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event: any, selectedDate?: Date) => {
                setShowTimePicker(false);
                if (selectedDate) {
                  setDateTime(selectedDate);
                }
              }}
            />
          )}

          {/* Available Seats */}
          <View style={styles.section}>
            <Text style={styles.label}>Available Seats</Text>
            <View style={styles.seatsContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.seatButton,
                    availableSeats === num.toString() && styles.seatButtonActive,
                  ]}
                  onPress={() => setAvailableSeats(num.toString())}
                >
                  <Text
                    style={[
                      styles.seatButtonText,
                      availableSeats === num.toString() &&
                        styles.seatButtonTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Any additional details..."
              placeholderTextColor={brandColors.beige}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.beige,
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    color: brandColors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: brandColors.black,
  },
  doneButton: {
    padding: 4,
  },
  doneText: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.primary,
  },
  doneTextDisabled: {
    color: brandColors.beige,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: brandColors.black,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: brandColors.white,
    borderWidth: 1,
    borderColor: brandColors.beige,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: brandColors.black,
    padding: 0,
  },
  dateTimeButton: {
    backgroundColor: brandColors.white,
    borderWidth: 1,
    borderColor: brandColors.beige,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateTimeText: {
    fontSize: 16,
    color: brandColors.black,
  },
  seatsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  seatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brandColors.white,
    borderWidth: 1,
    borderColor: brandColors.beige,
    alignItems: "center",
    justifyContent: "center",
  },
  seatButtonActive: {
    backgroundColor: brandColors.primary,
    borderColor: brandColors.primary,
  },
  seatButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.dark,
  },
  seatButtonTextActive: {
    color: brandColors.white,
  },
  notesInput: {
    height: 80,
    paddingTop: 14,
  },
});
