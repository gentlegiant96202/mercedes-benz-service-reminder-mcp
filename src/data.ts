// Facts sourced from SilberArrows published articles and the bundled interval dataset only.

export const SOURCES = {
  serviceA: "https://mercedes-benz.silberarrows.com/blog/mercedes-benz-service-a-costs-in-dubai-a-detailed-breakdown",
  plans: "https://mercedes-benz.silberarrows.com/blog/mercedes-benz-service-plans-in-dubai-are-they-worth-it",
  brakes: "https://mercedes-benz.silberarrows.com/blog/understanding-mercedes-benz-brake-service-costs-in-dubai",
  maintenance: "https://mercedes-benz.silberarrows.com/services/scheduled-maintenance",
};

export const SERVICES = {
  A: {
    title: "Mercedes-Benz Service A",
    overview:
      "Service A is the smaller routine maintenance interval for Mercedes-Benz vehicles, typically due after approximately 15,000 km or one year, depending on driving conditions and the vehicle's ASSYST service calculations.",
    typicallyIncludes: [
      "Engine oil replacement (low-ash oils such as MB 229.52 specification 5W-30 are commonly used on modern models)",
      "Engine oil filter replacement",
      "Fluid level inspection and correction, with minor top-ups where required",
      "Tyre condition and pressure checks",
      "Brake inspection",
      "Visual inspection of key systems and components",
      "Maintenance counter reset",
    ],
    notes: [
      "Services usually alternate A and B, so Service B normally follows a Service A.",
      "The UAE's climate places additional stress on engine oil and cooling systems, particularly during extended summer driving and heavy traffic.",
    ],
    sources: [SOURCES.serviceA, SOURCES.maintenance],
  },
  B: {
    title: "Mercedes-Benz Service B",
    overview:
      "Service B is the more extensive interval: it includes additional maintenance items and inspections compared with Service A. It normally follows a Service A at the next interval (approximately 15,000 km or 12 months later on most models).",
    typicallyIncludes: [
      "The routine Service A items (engine oil and oil filter replacement, fluid checks, tyre and brake inspection, maintenance counter reset)",
      "Additional maintenance items and inspections, which vary by model, age and mileage",
    ],
    notes: [
      "The exact requirements vary depending on model, age and mileage; the vehicle's service indicator shows what is due.",
      "Brake fluid replacement is typically recommended every two years regardless of mileage.",
    ],
    sources: [SOURCES.maintenance, SOURCES.brakes, SOURCES.plans],
  },
} as const;

export const WARNING_LIGHTS: Record<string, { name: string; aliases: string[]; meaning: string; advice: string }> = {
  check_engine_steady: {
    name: "Check engine lamp (steady)",
    aliases: ["check engine", "engine light", "engine management", "cel", "mil"],
    meaning: "An engine or emissions fault has been stored. One common cause is a misfire, where the engine may stutter, jerk or lose power.",
    advice: "Have the car diagnosed promptly with Mercedes-Benz diagnostic equipment. A diagnostic scan reads stored faults so the cause can be identified accurately.",
  },
  check_engine_flashing: {
    name: "Check engine lamp (flashing)",
    aliases: ["flashing check engine", "flashing engine light", "blinking engine light"],
    meaning: "On some cars the lamp flashes during a severe misfire. Unburned fuel can enter the exhaust, overheat and damage the catalytic converter.",
    advice: "Treat as urgent: reduce load, stop driving when it is safe to do so, and arrange diagnosis before continuing.",
  },
  reduced_power: {
    name: "Reduced power / limp mode message",
    aliases: ["limp mode", "reduced power", "limp home", "loss of power"],
    meaning: "The car switches into a reduced-power mode to protect the engine and gearbox. Common triggers include boost pressure faults, sensor failures, gearbox issues and, on diesel engines, particulate filter or AdBlue system faults.",
    advice: "The car may still be drivable at reduced speed, but diagnosis is needed. Avoid long journeys until it has been checked.",
  },
  brake_abs_esp: {
    name: "Brake, ABS or ESP warning",
    aliases: ["abs", "esp", "brake", "brake warning", "brake light", "traction"],
    meaning: "On modern Mercedes-Benz vehicles, braking is closely integrated with electronic safety systems such as ABS, ESP and Brake Assist, so a warning may relate to brake wear, fluid or one of these systems.",
    advice: "Braking is safety-critical: drive cautiously and have the braking system inspected and diagnosed without delay. If the brake warning shows with a change in pedal feel, stop when it is safe to do so.",
  },
  battery_electrical: {
    name: "Battery / electrical warning messages",
    aliases: ["battery", "electrical", "start-stop", "start stop", "voltage"],
    meaning: "A modern Mercedes-Benz is especially sensitive to battery health. A weak battery can cause warning messages, start-stop not working, or electrical faults that appear unrelated.",
    advice: "Have the battery and charging system tested, and a diagnostic scan carried out to check for stored faults.",
  },
  service_due: {
    name: "Service due indicator (ASSYST)",
    aliases: ["service", "service due", "assyst", "spanner", "wrench", "service a", "service b"],
    meaning: "The ASSYST system is indicating that Service A or Service B is due, based on time and mileage.",
    advice: "Book the service shown on the display. You can use the get_next_service tool to estimate timing between services.",
  },
};

export const SPECIALIST = {
  name: "SilberArrows - Mercedes-Benz Service Centre",
  address: "Al Manara St, Al Quoz Industrial Area 1, Dubai, United Arab Emirates",
  phone: "+971 4 380 5515",
  openingHours: { "Monday-Saturday": "08:00-18:00", Sunday: "Closed" },
  website: "https://mercedes-benz.silberarrows.com/",
  groupWebsite: "https://www.silberarrows.com/",
  services: "Mercedes-Benz Service A and Service B, diagnostics, brake service and general Mercedes-Benz maintenance in Dubai.",
};
