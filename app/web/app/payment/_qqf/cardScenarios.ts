export interface CardDetails {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  agreed: boolean;
  promoCode?: string;
}

export interface CardScenario {
  id: string;
  label: string;
  details: CardDetails;
}

export const cardScenarios: CardScenario[] = [
  {
    id: "valid-card",
    label: "Valid · Visa test card",
    details: {
      cardName: "John Doe",
      cardNumber: "4242 4242 4242 4242",
      expiry: "12/29",
      cvv: "123",
      agreed: true,
    },
  },
  {
    id: "valid-card-promo",
    label: "Valid · With promo code",
    details: {
      cardName: "Jane Smith",
      cardNumber: "4242 4242 4242 4242",
      expiry: "12/29",
      cvv: "123",
      agreed: true,
      promoCode: "QOOMFIRST",
    },
  },
  {
    id: "invalid-card",
    label: "Invalid · Incomplete card",
    details: {
      cardName: "",
      cardNumber: "4242 4242",
      expiry: "13/29",
      cvv: "12",
      agreed: false,
    },
  },
];
