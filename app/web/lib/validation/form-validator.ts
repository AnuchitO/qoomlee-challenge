import { CardFormFields } from "../forms/cardFormatting";

export interface ValidationResult<T> {
  value: T;
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidator<T> {
  (value: T[keyof T], fieldName: keyof T): string | null;
}

export class FormValidator<T> {
  private validators: Partial<Record<keyof T, FieldValidator<T>[]>> = {};

  addField<K extends keyof T>(field: K, ...validators: FieldValidator<T>[]): this {
    if (!this.validators[field]) {
      this.validators[field] = [];
    }
    this.validators[field]!.push(...validators);
    return this;
  }

  validate(data: T): ValidationResult<T> {
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const fieldName in this.validators) {
      if (Object.prototype.hasOwnProperty.call(this.validators, fieldName)) {
        const fieldValidators = this.validators[fieldName as keyof T];
        const key = fieldName as keyof T;
        const value = data[key];

        for (const validator of fieldValidators || []) {
          const error = validator(value, key);
          if (error) {
            errors[fieldName] = error;
            isValid = false;
            break; // Stop at first error for this field
          }
        }
      }
    }

    return { value: data, isValid, errors };
  }
}

// Usage example for card form validation
export const cardFormValidator = new FormValidator<CardFormFields>()
  .addField("cardName", (value) => {
    if (!value.trim()) return "Name on card is required";
    return null;
  })
  .addField("cardNumber", (value) => {
    const digits = value.replace(/\s/g, "");
    if (digits.length !== 16) return "Card number must be 16 digits";
    if (!/^\d+$/.test(digits)) return "Card number must contain only digits";
    return null;
  })
  .addField("expiry", (value) => {
    if (!/^\d{2}\/\d{2}$/.test(value)) return "Use MM/YY format";
    const parts = value.split("/");
    const month = parseInt(parts[0] || "", 10);
    const year = parseInt(parts[1] || "", 10);

    if (isNaN(month) || isNaN(year)) return "Invalid date format";
    if (month < 1 || month > 12) return "Month must be between 01-12";
    return null;
  })
  .addField("cvv", (value) => {
    if (!/^\d{3,4}$/.test(value)) return "CVV must be 3 or 4 digits";
    return null;
  });
