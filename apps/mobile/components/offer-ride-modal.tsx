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
  FlatList,
  Dimensions,
} from "react-native";
import type { ScrollView as ScrollViewType } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { brandColors } from "@/constants/theme";
import { CreateRideOffer } from "@evergreen/shared-types";
import {
  SCROLLER_PADDING,
  getDaysInMonth,
  getScrollOffsetY,
  getScrollerIndex,
  scrollToIndex,
  useRafScrollScheduler,
} from "@/utils/web-picker";

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
  const { schedule } = useRafScrollScheduler();
  const [availableSeats, setAvailableSeats] = useState("1");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("OfferRideModal visible:", visible);
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
              onPress={handleOpenDatePicker}
            >
              <Text style={styles.dateTimeText}>{formatDateTime(dateTime)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && Platform.OS !== "web" && (
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

          {showTimePicker && Platform.OS !== "web" && (
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
                            {['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'
                            ].map((month, idx) => (
                              <TouchableOpacity
                                key={month}
                                style={[
                                  styles.scrollerItem,
                                  idx === webMonth && styles.scrollerItemSelected
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
                                <Text style={[
                                  styles.scrollerItemText,
                                  idx === webMonth && styles.scrollerItemTextSelected
                                ]}>
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
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <TouchableOpacity
                            key={day}
                            style={[
                              styles.scrollerItem,
                              day === webDay && styles.scrollerItemSelected
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              const daysInMonth = getDaysInMonth(
                                dateTime.getFullYear(),
                                webMonth
                              );
                              const clampedDay = Math.min(day, daysInMonth);
                              setWebDay(clampedDay);
                              scrollToIndex(webDayScrollRef, clampedDay - 1);
                            }}
                          >
                            <Text style={[
                              styles.scrollerItemText,
                              day === webDay && styles.scrollerItemTextSelected
                            ]}>
                              {day}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <View style={{ height: SCROLLER_PADDING }} />
                      </ScrollView>
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    onPress={() => {
                      setDateTime(createDateTimeFromWebParts(dateTime));
                      setShowDatePicker(false);
                      setShowTimePicker(true);
                    }}
                    style={styles.webPickerButton}
                  >
                    <Text style={styles.webPickerButtonText}>Select Date</Text>
                  </TouchableOpacity>
                </View>
              )}

                  {showTimePicker && (
                    <View style={styles.webPickerContent}>
                      <ScrollView 
                        horizontal 
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
                            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                              <TouchableOpacity
                                key={hour}
                                style={[
                                  styles.scrollerItem,
                                  hour === webHour && styles.scrollerItemSelected
                                ]}
                                activeOpacity={0.7}
                                onPress={() => {
                                  setWebHour(hour);
                                  scrollToIndex(webHourScrollRef, hour);
                                }}
                              >
                                <Text style={[
                                  styles.scrollerItemText,
                                  hour === webHour && styles.scrollerItemTextSelected
                                ]}>
                                  {String(hour).padStart(2, "0")}
                                </Text>
                              </TouchableOpacity>
                            ))}
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
                            {Array.from({ length: 4 }, (_, i) => i * 15).map((minute) => (
                              <TouchableOpacity
                                key={minute}
                                style={[
                                  styles.scrollerItem,
                                  minute === webMinute && styles.scrollerItemSelected
                                ]}
                                activeOpacity={0.7}
                                onPress={() => {
                                  setWebMinute(minute);
                                  scrollToIndex(webMinuteScrollRef, minute / 15);
                                }}
                              >
                                <Text style={[
                                  styles.scrollerItemText,
                                  minute === webMinute && styles.scrollerItemTextSelected
                                ]}>
                                  {String(minute).padStart(2, "0")}
                                </Text>
                              </TouchableOpacity>
                            ))}
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
                          style={[styles.webPickerButton, styles.webPickerButtonSecondary]}
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
                          <Text style={styles.webPickerButtonText}>Select Time</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </Modal>
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
  webPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  webPickerModal: {
    backgroundColor: brandColors.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  webPickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: brandColors.dark,
    marginBottom: 24,
    textAlign: "center",
  },
  webPickerContent: {
    marginBottom: 24,
  },
  scrollerContainer: {
    gap: 16,
    paddingHorizontal: 12,
  },
  scrollerColumn: {
    alignItems: "center",
    minWidth: 100,
  },
  scrollerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: brandColors.beige,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  scroller: {
    height: 200,
    width: 80,
    borderWidth: 1,
    borderColor: brandColors.beige,
    borderRadius: 8,
  },
  scrollerItem: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollerItemSelected: {
    backgroundColor: brandColors.primary,
    borderRadius: 4,
  },
  scrollerItemText: {
    fontSize: 18,
    fontWeight: "500",
    color: brandColors.dark,
  },
  scrollerItemTextSelected: {
    color: brandColors.white,
    fontWeight: "700",
  },
  dateInputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  timeInputGroup: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    marginBottom: 24,
  },
  dateInputField: {
    alignItems: "center",
    flex: 1,
  },
  timeInputField: {
    alignItems: "center",
  },
  dateInputLabel: {
    fontSize: 13,
    color: brandColors.beige,
    marginBottom: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  numberInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  numberButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brandColors.beige,
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    fontSize: 28,
    color: brandColors.primary,
    fontWeight: "bold",
  },
  numberDisplay: {
    fontSize: 20,
    fontWeight: "600",
    color: brandColors.dark,
    minWidth: 60,
    textAlign: "center",
  },
  webPickerButton: {
    backgroundColor: brandColors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  webPickerButtonSecondary: {
    backgroundColor: brandColors.beige,
  },
  webPickerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: brandColors.white,
  },
  webPickerButtonGroup: {
    flexDirection: "row",
    gap: 12,
  },
});
