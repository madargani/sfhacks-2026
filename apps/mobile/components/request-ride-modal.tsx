import { useState, useEffect, useRef } from "react";
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
import type { ScrollView as ScrollViewType } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { brandColors } from "@/constants/theme";
import { CreateRideRequest } from "@evergreen/shared-types";
import {
  SCROLLER_PADDING,
  getDaysInMonth,
  getScrollOffsetY,
  getScrollerIndex,
  scrollToIndex,
  useRafScrollScheduler,
} from "@/utils/web-picker";

interface RequestRideModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rideRequest: CreateRideRequest) => Promise<void>;
  userId: string;
}

export function RequestRideModal({
  visible,
  onClose,
  onSubmit,
  userId,
}: RequestRideModalProps) {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [webMonth, setWebMonth] = useState(dateTime.getMonth());
  const [webDay, setWebDay] = useState(dateTime.getDate());
  const [webHour, setWebHour] = useState(dateTime.getHours());
  const [webMinute, setWebMinute] = useState(
    Math.floor(dateTime.getMinutes() / 15) * 15
  );
  const webMonthScrollRef = useRef<ScrollViewType>(null);
  const webDayScrollRef = useRef<ScrollViewType>(null);
  const webHourScrollRef = useRef<ScrollViewType>(null);
  const webMinuteScrollRef = useRef<ScrollViewType>(null);
  const [passengers, setPassengers] = useState("1");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { schedule } = useRafScrollScheduler();

  useEffect(() => {
    console.log("RequestRideModal visible:", visible);
  }, [visible]);

  const syncWebPartsFromDate = (sourceDate: Date) => {
    setWebMonth(sourceDate.getMonth());
    setWebDay(sourceDate.getDate());
    setWebHour(sourceDate.getHours());
    setWebMinute(Math.floor(sourceDate.getMinutes() / 15) * 15);
  };

  const createDateTimeFromWebParts = (baseDate: Date) => {
    const nextDate = new Date(baseDate);
    const daysInMonth = getDaysInMonth(nextDate.getFullYear(), webMonth);
    const clampedDay = Math.min(webDay, daysInMonth);
    nextDate.setMonth(webMonth);
    nextDate.setDate(clampedDay);
    nextDate.setHours(webHour);
    nextDate.setMinutes(webMinute);
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    return nextDate;
  };

  const updateWebMonthFromOffset = (offsetY: number) => {
    const index = getScrollerIndex(offsetY);
    const clampedIndex = Math.max(0, Math.min(11, index));
    const daysInMonth = getDaysInMonth(dateTime.getFullYear(), clampedIndex);
    setWebMonth(clampedIndex);
    if (webDay > daysInMonth) {
      setWebDay(daysInMonth);
    }
  };

  const updateWebDayFromOffset = (offsetY: number) => {
    const index = getScrollerIndex(offsetY);
    const daysInMonth = getDaysInMonth(dateTime.getFullYear(), webMonth);
    const day = Math.max(1, Math.min(daysInMonth, index + 1));
    setWebDay(day);
  };

  const updateWebHourFromOffset = (offsetY: number) => {
    const index = getScrollerIndex(offsetY);
    const clampedIndex = Math.max(0, Math.min(23, index));
    setWebHour(clampedIndex);
  };

  const updateWebMinuteFromOffset = (offsetY: number) => {
    const index = getScrollerIndex(offsetY);
    const clampedIndex = Math.max(0, Math.min(3, index));
    setWebMinute(clampedIndex * 15);
  };

  const makeScrollHandler = (handler: (nextOffset: number) => void) => {
    return (event: any) => {
      const offsetY = getScrollOffsetY(event);
      schedule(offsetY, handler);
    };
  };

  const updateWebMonthFromScroll = makeScrollHandler(updateWebMonthFromOffset);
  const updateWebDayFromScroll = makeScrollHandler(updateWebDayFromOffset);
  const updateWebHourFromScroll = makeScrollHandler(updateWebHourFromOffset);
  const updateWebMinuteFromScroll = makeScrollHandler(updateWebMinuteFromOffset);

  const handleOpenDatePicker = () => {
    if (Platform.OS === "web") {
      syncWebPartsFromDate(dateTime);
    }
    setShowDatePicker(true);
  };

  const handleSubmit = async () => {
    if (!fromAddress.trim() || !toAddress.trim()) {
      alert("Please enter both pickup and destination locations");
      return;
    }

    const passengersCount = parseInt(passengers);
    if (isNaN(passengersCount) || passengersCount < 1 || passengersCount > 8) {
      alert("Please enter a valid number of passengers (1-8)");
      return;
    }

    setIsSubmitting(true);

    try {
      const rideRequest: CreateRideRequest = {
        userId,
        fromLocation: {
          address: fromAddress.trim(),
          latitude: 0,
          longitude: 0,
        },
        toLocation: {
          address: toAddress.trim(),
          latitude: 0,
          longitude: 0,
        },
        dateTime,
        passengers: passengersCount,
        notes: notes.trim() || undefined,
      };

      await onSubmit(rideRequest);
      setFromAddress("");
      setToAddress("");
      setPassengers("1");
      setNotes("");
      setDateTime(new Date());
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to request ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Request a Ride</Text>
            <View style={{ width: 30 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Pickup Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter pickup location"
                value={fromAddress}
                onChangeText={setFromAddress}
                placeholderTextColor={brandColors.beige}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Destination</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter destination"
                value={toAddress}
                onChangeText={setToAddress}
                placeholderTextColor={brandColors.beige}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Number of Passengers</Text>
              <TextInput
                style={styles.input}
                placeholder="1-8"
                value={passengers}
                onChangeText={setPassengers}
                keyboardType="number-pad"
                placeholderTextColor={brandColors.beige}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Preferred Date & Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={handleOpenDatePicker}
              >
                <Text style={styles.dateButtonText}>
                  {dateTime.toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Additional Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any special requests or preferences"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor={brandColors.beige}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Requesting..." : "Request Ride"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date/Time Picker for Native */}
      {showDatePicker && Platform.OS !== "web" && (
        <View>
          <DateTimePicker
            value={dateTime}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                const newDate = new Date(selectedDate);
                newDate.setHours(dateTime.getHours());
                newDate.setMinutes(dateTime.getMinutes());
                setDateTime(newDate);
              }
              setShowDatePicker(false);
              setShowTimePicker(true);
            }}
          />
        </View>
      )}

      {showTimePicker && Platform.OS !== "web" && (
        <View>
          <DateTimePicker
            value={dateTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              if (selectedTime) {
                const updatedDateTime = new Date(dateTime);
                updatedDateTime.setHours(selectedTime.getHours());
                updatedDateTime.setMinutes(selectedTime.getMinutes());
                setDateTime(updatedDateTime);
              }
              setShowTimePicker(false);
            }}
          />
        </View>
      )}

      {/* Web Fallback for Date/Time Picker */}
      {Platform.OS === "web" && (showDatePicker || showTimePicker) && (
        <Modal
          visible={true}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            setShowDatePicker(false);
            setShowTimePicker(false);
          }}
        >
          <View style={styles.webPickerOverlay}>
            <View style={styles.webPickerModal}>
              <Text style={styles.webPickerTitle}>
                {showDatePicker ? "Select Date" : "Select Time"}
              </Text>

              {showDatePicker && (
                <View style={styles.webPickerContent}>
                  <ScrollView
                    horizontal
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollerContainer}
                  >
                    {/* Month Scroller */}
                    <View style={styles.scrollerColumn}>
                      <Text style={styles.scrollerLabel}>Month</Text>
                      <ScrollView
                        style={styles.scroller}
                        scrollEventThrottle={16}
                        onScroll={updateWebMonthFromScroll}
                        onScrollEndDrag={updateWebMonthFromScroll}
                        onMomentumScrollEnd={updateWebMonthFromScroll}
                        ref={webMonthScrollRef}
                      >
                        <View style={{ height: SCROLLER_PADDING }} />
                        {[
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ].map((month, idx) => (
                          <TouchableOpacity
                            key={month}
                            style={[
                              styles.scrollerItem,
                              idx === webMonth && styles.scrollerItemSelected,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              const daysInMonth = getDaysInMonth(
                                dateTime.getFullYear(),
                                idx
                              );
                              setWebMonth(idx);
                              if (webDay > daysInMonth) {
                                setWebDay(daysInMonth);
                              }
                              scrollToIndex(webMonthScrollRef, idx);
                            }}
                          >
                            <Text
                              style={[
                                styles.scrollerItemText,
                                idx === webMonth &&
                                  styles.scrollerItemTextSelected,
                              ]}
                            >
                              {month}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <View style={{ height: SCROLLER_PADDING }} />
                      </ScrollView>
                    </View>

                    {/* Day Scroller */}
                    <View style={styles.scrollerColumn}>
                      <Text style={styles.scrollerLabel}>Day</Text>
                      <ScrollView
                        style={styles.scroller}
                        scrollEventThrottle={16}
                        onScroll={updateWebDayFromScroll}
                        onScrollEndDrag={updateWebDayFromScroll}
                        onMomentumScrollEnd={updateWebDayFromScroll}
                        ref={webDayScrollRef}
                      >
                        <View style={{ height: SCROLLER_PADDING }} />
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <TouchableOpacity
                              key={day}
                              style={[
                                styles.scrollerItem,
                                day === webDay && styles.scrollerItemSelected,
                              ]}
                              activeOpacity={0.7}
                              onPress={() => {
                                const daysInMonth = getDaysInMonth(
                                  dateTime.getFullYear(),
                                  webMonth
                                );
                                const clampedDay = Math.min(
                                  day,
                                  daysInMonth
                                );
                                setWebDay(clampedDay);
                                scrollToIndex(webDayScrollRef, clampedDay - 1);
                              }}
                            >
                              <Text
                                style={[
                                  styles.scrollerItemText,
                                  day === webDay &&
                                    styles.scrollerItemTextSelected,
                                ]}
                              >
                                {day}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                        <View style={{ height: SCROLLER_PADDING }} />
                      </ScrollView>
                    </View>
                  </ScrollView>

                  <View style={styles.webPickerButtonGroup}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                      }}
                      style={[
                        styles.webPickerButton,
                        styles.webPickerButtonSecondary,
                      ]}
                    >
                      <Text style={styles.webPickerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setDateTime(createDateTimeFromWebParts(dateTime));
                        setShowDatePicker(false);
                        setShowTimePicker(true);
                      }}
                      style={styles.webPickerButton}
                    >
                      <Text style={styles.webPickerButtonText}>
                        Select Date
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {showTimePicker && (
                <View style={styles.webPickerContent}>
                  <ScrollView
                    horizontal
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollerContainer}
                  >
                    {/* Hour Scroller */}
                    <View style={styles.scrollerColumn}>
                      <Text style={styles.scrollerLabel}>Hour</Text>
                      <ScrollView
                        style={styles.scroller}
                        scrollEventThrottle={16}
                        onScroll={updateWebHourFromScroll}
                        onScrollEndDrag={updateWebHourFromScroll}
                        onMomentumScrollEnd={updateWebHourFromScroll}
                        ref={webHourScrollRef}
                      >
                        <View style={{ height: SCROLLER_PADDING }} />
                        {Array.from({ length: 24 }, (_, i) => i).map(
                          (hour) => (
                            <TouchableOpacity
                              key={hour}
                              style={[
                                styles.scrollerItem,
                                hour === webHour && styles.scrollerItemSelected,
                              ]}
                              activeOpacity={0.7}
                              onPress={() => {
                                setWebHour(hour);
                                scrollToIndex(webHourScrollRef, hour);
                              }}
                            >
                              <Text
                                style={[
                                  styles.scrollerItemText,
                                  hour === webHour &&
                                    styles.scrollerItemTextSelected,
                                ]}
                              >
                                {String(hour).padStart(2, "0")}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                        <View style={{ height: SCROLLER_PADDING }} />
                      </ScrollView>
                    </View>

                    {/* Minute Scroller */}
                    <View style={styles.scrollerColumn}>
                      <Text style={styles.scrollerLabel}>Minute</Text>
                      <ScrollView
                        style={styles.scroller}
                        scrollEventThrottle={16}
                        onScroll={updateWebMinuteFromScroll}
                        onScrollEndDrag={updateWebMinuteFromScroll}
                        onMomentumScrollEnd={updateWebMinuteFromScroll}
                        ref={webMinuteScrollRef}
                      >
                        <View style={{ height: SCROLLER_PADDING }} />
                        {Array.from({ length: 4 }, (_, i) => i * 15).map(
                          (minute) => (
                            <TouchableOpacity
                              key={minute}
                              style={[
                                styles.scrollerItem,
                                minute === webMinute &&
                                  styles.scrollerItemSelected,
                              ]}
                              activeOpacity={0.7}
                              onPress={() => {
                                setWebMinute(minute);
                                scrollToIndex(webMinuteScrollRef, minute / 15);
                              }}
                            >
                              <Text
                                style={[
                                  styles.scrollerItemText,
                                  minute === webMinute &&
                                    styles.scrollerItemTextSelected,
                                ]}
                              >
                                {String(minute).padStart(2, "0")}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                        <View style={{ height: SCROLLER_PADDING }} />
                      </ScrollView>
                    </View>
                  </ScrollView>

                  <View style={styles.webPickerButtonGroup}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowDatePicker(true);
                        setShowTimePicker(false);
                      }}
                      style={[
                        styles.webPickerButton,
                        styles.webPickerButtonSecondary,
                      ]}
                    >
                      <Text style={styles.webPickerButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setDateTime(createDateTimeFromWebParts(dateTime));
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                      }}
                      style={styles.webPickerButton}
                    >
                      <Text style={styles.webPickerButtonText}>
                        Select Time
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: brandColors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.beige,
  },
  closeButton: {
    fontSize: 28,
    fontWeight: "bold",
    color: brandColors.dark,
    width: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: brandColors.dark,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: brandColors.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: brandColors.beige,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: brandColors.dark,
    backgroundColor: brandColors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: brandColors.beige,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: brandColors.white,
  },
  dateButtonText: {
    fontSize: 16,
    color: brandColors.dark,
  },
  submitButton: {
    backgroundColor: brandColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: brandColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  webPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  webPickerModal: {
    backgroundColor: brandColors.white,
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxHeight: "80%",
  },
  webPickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: brandColors.dark,
    marginBottom: 16,
    textAlign: "center",
  },
  webPickerContent: {
    marginBottom: 16,
  },
  scrollerContainer: {
    paddingHorizontal: 12,
    gap: 16,
  },
  scrollerColumn: {
    alignItems: "center",
  },
  scrollerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: brandColors.dark,
    marginBottom: 8,
  },
  scroller: {
    height: 200,
    width: 60,
  },
  scrollerItem: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollerItemText: {
    fontSize: 16,
    color: brandColors.beige,
  },
  scrollerItemSelected: {
    backgroundColor: brandColors.beige,
    borderRadius: 8,
  },
  scrollerItemTextSelected: {
    color: brandColors.white,
    fontWeight: "600",
  },
  webPickerButtonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  webPickerButton: {
    flex: 1,
    backgroundColor: brandColors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  webPickerButtonSecondary: {
    backgroundColor: brandColors.beige,
  },
  webPickerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: brandColors.white,
  },
});
