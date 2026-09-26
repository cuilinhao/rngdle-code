// Public placement keys and exact HTTPS URLs from Adsterra's Get Code dialog.
// These are not Publisher account credentials.
export const adUnits = {
  top: {
    key: "94acbb97e647008551663f9c3ba5f0c6",
    src: "https://www.highrevenueformat.com/94acbb97e647008551663f9c3ba5f0c6/invoke.js",
    format: "banner",
    width: 320,
    height: 50,
  },
  rectangle: {
    key: "f607cb178a1601c4c12680757d48e794",
    src: "https://www.highrevenueformat.com/f607cb178a1601c4c12680757d48e794/invoke.js",
    format: "banner",
    width: 300,
    height: 250,
  },
  native: {
    key: "2fa98dc65174516569957aa123f3650b",
    src: "https://pl31520216.profitableratecpmnetwork.com/2fa98dc65174516569957aa123f3650b/invoke.js",
    format: "native",
  },
} as const;

export type AdPlacement = keyof typeof adUnits;
