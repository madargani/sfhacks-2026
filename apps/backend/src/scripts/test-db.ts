import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel, RideRequestModel, RideOfferModel } from "../models";

// Load environment variables
dotenv.config();

/**
 * Test script to verify database connectivity and basic operations
 * Run: npx ts-node src/scripts/test-db.ts
 */
const testDatabase = async (): Promise<void> => {
  let testUserId: string | null = null;
  let testRequestId: string | null = null;
  let testOfferId: string | null = null;

  try {
    // Check connection state
    const state = mongoose.connection.readyState;
    console.log(
      "Database connection state:",
      state === 1 ? "Connected ✅" : "Not connected ❌",
    );

    if (state !== 1) {
      console.error("Database is not connected. Cannot run tests.");
      return;
    }

    console.log("\n--- Testing Database Operations ---\n");

    // Clean up any existing test data first
    await UserModel.deleteMany({ email: /test.*@example\.com/ });
    await RideRequestModel.deleteMany({
      "fromLocation.address": /123 Start St/,
    });
    await RideOfferModel.deleteMany({
      "fromLocation.address": /789 Offer Blvd/,
    });
    console.log("🧹 Cleaned up old test data");

    // Test User creation with unique email
    const uniqueEmail = `test${Date.now()}@example.com`;
    const testUser = await UserModel.create({
      name: "Test User",
      email: uniqueEmail,
      phone: "+1234567890",
    });
    testUserId = testUser._id.toString();
    console.log("✅ User created:", testUserId);

    // Test Ride Request creation
    const testRequest = await RideRequestModel.create({
      userId: testUser._id.toString(),
      fromLocation: {
        address: "123 Start St, City",
        latitude: 37.7749,
        longitude: -122.4194,
      },
      toLocation: {
        address: "456 End Ave, City",
        latitude: 37.7849,
        longitude: -122.4094,
      },
      dateTime: new Date(),
      passengers: 2,
      status: "pending",
    });
    testRequestId = testRequest._id.toString();
    console.log("✅ Ride request created:", testRequestId);

    // Test Ride Offer creation
    const testOffer = await RideOfferModel.create({
      userId: testUserId,
      fromLocation: {
        address: "789 Offer Blvd, City",
        latitude: 37.7649,
        longitude: -122.4294,
      },
      toLocation: {
        address: "321 Dest Rd, City",
        latitude: 37.7549,
        longitude: -122.4394,
      },
      dateTime: new Date(),
      availableSeats: 3,
      price: 15.5,
      status: "pending",
    });
    testOfferId = testOffer._id.toString();
    console.log("✅ Ride offer created:", testOfferId);

    // Test queries
    const users = await UserModel.find();
    const requests = await RideRequestModel.find();
    const offers = await RideOfferModel.find();

    console.log("\n--- Database Query Results ---");
    console.log(`Users: ${users.length}`);
    console.log(`Ride requests: ${requests.length}`);
    console.log(`Ride offers: ${offers.length}`);

    // Cleanup (remove test data)
    if (testUserId) await UserModel.findByIdAndDelete(testUserId);
    if (testRequestId) await RideRequestModel.findByIdAndDelete(testRequestId);
    if (testOfferId) await RideOfferModel.findByIdAndDelete(testOfferId);

    console.log("\n✅ Test data cleaned up");
    console.log("\n🎉 Database is working correctly!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
};

// Run if called directly
if (require.main === module) {
  const { connectDB } = require("../config/database");
  connectDB().then(() => {
    testDatabase();
  });
}

export default testDatabase;
