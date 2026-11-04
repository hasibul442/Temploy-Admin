// Regex-based text formatting shared across the site.

// IBANs shown in groups of four, the way banks print them.
export const groupIban = (iban = "") => iban.replace(/(.{4})(?=.)/g, "$1 ");
