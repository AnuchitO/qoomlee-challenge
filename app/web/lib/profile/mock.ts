export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

export const mockProfile: ProfileData = {
  fullName: "Jonathan Doe",
  email: "jonathan.doe@email.com",
  phone: "+66 81 234 5678",
  nationality: "Thai",
  passportNumber: "AA123456",
  passportExpiry: "2030-12-31",
};

export function getProfile(): ProfileData {
  return mockProfile;
}
