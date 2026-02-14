// Rough emission factors (example values)
const EMISSION_PER_KM_CAR = 0.192; // kg CO2 per km (average car)
const EMISSION_PER_KM_PER_PASSENGER = 0.192; // baseline driver

export function calculateCarbonSaved(params: {
  distanceKm: number;
  passengers: number; // number of riders excluding driver
}) {
  const { distanceKm, passengers } = params;

  if (passengers <= 0) return 0;

  // If each passenger drove alone:
  const soloEmissions = distanceKm * EMISSION_PER_KM_CAR * passengers;

  // In carpool, emissions are shared
  const carpoolEmissions = distanceKm * EMISSION_PER_KM_CAR;

  const saved = soloEmissions - carpoolEmissions;

  return Math.max(saved, 0); // kg CO2 saved
}