export const KIT_ITEMS = [
  {
    id: "water",
    label: "Water (3-day supply)",
    points: 10,
    reason: "Safe drinking water is one of the most critical emergency essentials.",
  },
  {
    id: "food",
    label: "Non-perishable food",
    points: 10,
    reason: "Food access may be disrupted during a disaster.",
  },
  {
    id: "first_aid",
    label: "First aid kit",
    points: 12,
    reason: "Basic medical supplies support early treatment of injuries.",
  },
  {
    id: "flashlight",
    label: "Flashlight",
    points: 8,
    reason: "Power outages are common during severe emergencies.",
  },
  {
    id: "batteries",
    label: "Extra batteries / power bank",
    points: 8,
    reason: "Devices and emergency tools need backup power.",
  },
  {
    id: "radio",
    label: "Battery / hand-crank radio",
    points: 10,
    reason: "Official updates may still be broadcast even if mobile networks fail.",
  },
  {
    id: "documents",
    label: "Important documents",
    points: 10,
    reason: "Identity and insurance documents may be needed for recovery.",
  },
  {
    id: "medication",
    label: "Essential medication",
    points: 12,
    reason: "Missed medication can become dangerous during prolonged disruption.",
  },
  {
    id: "cash",
    label: "Cash",
    points: 8,
    reason: "Digital payment systems may be unavailable.",
  },
  {
    id: "whistle",
    label: "Whistle",
    points: 5,
    reason: "A whistle helps signal for help if trapped or stranded.",
  },
  {
    id: "mask",
    label: "Masks / hygiene items",
    points: 4,
    reason: "Hygiene supplies help reduce illness and maintain sanitation.",
  },
  {
    id: "blanket",
    label: "Blanket / emergency foil",
    points: 6,
    reason: "Warmth and insulation are important during displacement.",
  },
];

export const DISASTER_GUIDES = [
  {
    id: "earthquake",
    title: "Earthquake Response",
    icon: "🌍",
    steps: [
      "Drop to your hands and knees.",
      "Cover your head and neck under sturdy furniture if possible.",
      "Hold on until the shaking stops.",
      "Stay away from windows, shelves, and falling objects.",
      "After the shaking stops, check for injuries and move carefully.",
    ],
  },
  {
    id: "flood",
    title: "Flood Safety",
    icon: "🌊",
    steps: [
      "Move to higher ground immediately if flooding begins.",
      "Do not walk, swim, or drive through flood water.",
      "Turn off electricity if safe to do so.",
      "Monitor official updates and avoid flooded roads.",
      "Return only when authorities indicate it is safe.",
    ],
  },
  {
    id: "fire",
    title: "Fire Emergency",
    icon: "🔥",
    steps: [
      "Leave the building immediately using the safest exit.",
      "Stay low if there is smoke.",
      "Do not use elevators.",
      "Call emergency services once safely outside.",
      "Do not re-enter the building until told it is safe.",
    ],
  },
  {
    id: "storm",
    title: "Severe Storm",
    icon: "⛈️",
    steps: [
      "Stay indoors and away from windows.",
      "Secure loose objects if safe to do so.",
      "Charge essential devices in advance.",
      "Prepare emergency supplies and monitor weather updates.",
      "Avoid outdoor travel during strong winds or lightning.",
    ],
  },
];

export const SURVIVAL_SKILLS = [
  {
    id: "bandage",
    title: "Basic Wound Bandaging",
    icon: "🩹",
    steps: [
      "Wash or sanitise your hands if possible.",
      "Apply pressure to stop bleeding.",
      "Clean the wound gently with safe water if available.",
      "Cover the wound with a sterile dressing.",
      "Secure it with a bandage and monitor for infection.",
    ],
  },
  {
    id: "shelter_setup",
    title: "Emergency Shelter Setup",
    icon: "⛺",
    steps: [
      "Choose a dry and stable location away from hazards.",
      "Use available materials to create overhead cover.",
      "Insulate yourself from the ground if possible.",
      "Keep ventilation if using enclosed shelter materials.",
      "Store key items safely inside and keep the area organised.",
    ],
  },
  {
    id: "water_safety",
    title: "Safe Water Practices",
    icon: "💧",
    steps: [
      "Use sealed or treated water whenever possible.",
      "Boil water if it may be contaminated.",
      "Store safe water in clean containers.",
      "Avoid using flood water or unclear sources without treatment.",
      "Ration water carefully in prolonged emergencies.",
    ],
  },
];

export const SHELTERS = [
  {
    id: "s1",
    name: "Community Shelter A",
    address: "10 Example Street",
    lat: 1.3004,
    lon: 103.8415,
  },
  {
    id: "s2",
    name: "Community Shelter B",
    address: "25 Relief Avenue",
    lat: 1.315,
    lon: 103.83,
  },
  {
    id: "s3",
    name: "Community Shelter C",
    address: "7 Safe Harbour Road",
    lat: 1.289,
    lon: 103.855,
  },
];

export const EMERGENCY_CONTACTS = [
  { id: "c1", name: "Emergency Services", number: "999" },
  { id: "c2", name: "Ambulance / Fire", number: "995" },
  { id: "c3", name: "Non-Emergency Ambulance", number: "1777" },
];