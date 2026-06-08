export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const AIRPORTS: Airport[] = [
  { code: "BKK", name: "Suvarnabhumi Airport",                   city: "Bangkok",       country: "Thailand"     },
  { code: "SIN", name: "Singapore Changi Airport",               city: "Singapore",     country: "Singapore"    },
  { code: "HKG", name: "Hong Kong International Airport",        city: "Hong Kong",     country: "China"        },
  { code: "NRT", name: "Narita International Airport",           city: "Tokyo",         country: "Japan"        },
  { code: "KUL", name: "Kuala Lumpur International Airport",     city: "Kuala Lumpur",  country: "Malaysia"     },
  { code: "CGK", name: "Soekarno-Hatta International Airport",   city: "Jakarta",       country: "Indonesia"    },
  { code: "MNL", name: "Ninoy Aquino International Airport",     city: "Manila",        country: "Philippines"  },
];

export function findAirport(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code.toUpperCase());
}
