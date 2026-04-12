const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "jskjageer@gmail.com,kalimdon07@gmail.com").split(",").map(e => e.trim());

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const ADMIN_CREDENTIALS = [
  { email: "jskjageer@gmail.com", password: "Jsk@786" },
  { email: "kalimdon07@gmail.com", password: "Kalim@786" },
];

export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  } else if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
};

export const formatDate = (timestamp: { toDate?: () => Date } | Date | string): string => {
  let date: Date;
  if (timestamp && typeof timestamp === "object" && "toDate" in timestamp && typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp as string);
  }
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const cn = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(" ");
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

export const CAR_BRANDS = [
  "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Kia", "Honda", "Toyota",
  "Volkswagen", "Skoda", "Mercedes-Benz", "BMW", "Audi", "Ford", "Renault",
  "Nissan", "Jeep", "MG", "Volvo", "Jaguar", "Land Rover", "Others",
];
