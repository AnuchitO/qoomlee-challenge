export interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PassengerScenario {
  id: string;
  label: string;
  details: PassengerDetails;
}

export const passengerScenarios: PassengerScenario[] = [
  {
    id: "valid-standard",
    label: "Valid · John Doe",
    details: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "812345678",
    },
  },
  {
    id: "valid-long-name",
    label: "Valid · Long name",
    details: {
      firstName: "Krittamethawee",
      lastName: "Thanapatcharanankul",
      email: "krittamethawee.t@example.com",
      phone: "898765432",
    },
  },
  {
    id: "invalid-email",
    label: "Invalid email",
    details: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith[at]example.com",
      phone: "823456789",
    },
  },
];
