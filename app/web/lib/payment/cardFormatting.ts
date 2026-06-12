export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function formatCvv(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

export interface CardFormFields {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface CardFieldErrors {
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

export function validateCardFields(fields: CardFormFields): CardFieldErrors {
  const errors: CardFieldErrors = {};
  if (!fields.cardName.trim()) errors.cardName = "Required";
  if (fields.cardNumber.replace(/\s/g, "").length !== 16) {
    errors.cardNumber = "Enter a valid 16-digit card number";
  }
  if (!/^\d{2}\/\d{2}$/.test(fields.expiry)) errors.expiry = "Use MM/YY format";
  if (!/^\d{3,4}$/.test(fields.cvv)) errors.cvv = "3 or 4 digits required";
  return errors;
}
