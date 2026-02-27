export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const isPM = hour >= 12;
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${isPM ? "PM" : "AM"}`;
};

const isValidMyanmarPhone = (phone: string) => {
  if (!phone) return false;

  const cleaned = phone.replace(/[\s-]/g, "");

  // Local format: 09xxxxxxxx
  const localRegex = /^09\d{7,9}$/;

  // International format: +959xxxxxxxx
  const intlRegex = /^\+959\d{7,9}$/;

  return localRegex.test(cleaned) || intlRegex.test(cleaned);
};

export const normalizeMyanmarPhone = (phone: string) => {
  const cleaned = phone.replace(/[\s-]/g, "");

  if (cleaned.startsWith("+959")) return cleaned;
  if (cleaned.startsWith("09")) {
    return "+959" + cleaned.slice(2);
  }

  return null; // invalid
};
