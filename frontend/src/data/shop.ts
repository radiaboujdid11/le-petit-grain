// Informations de la boutique (FICTIVES : Le Petit Grain est une marque inventée).
// Utilisées par le pied de page et la page Contact.
// En phase 6, les horaires viendront des réglages de l'admin (API).

export const shop = {
  name: "Le Petit Grain",
  address: { street: "12, rue des Amandiers", city: "Casablanca", country: "Maroc" },
  phone: "+212 5 22 00 00 00", // numéro fictif
  email: "bonjour@lepetitgrain.example", // domaine réservé aux exemples
  whatsapp: "212600000000", // format international sans « + » (lien wa.me)
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "TikTok", href: "https://tiktok.com" },
  ],
  // Horaires d'ouverture (heure de Casablanca)
  hours: [
    { days: "Lundi – Vendredi", open: "07:30", close: "20:00" },
    { days: "Samedi – Dimanche", open: "08:00", close: "21:00" },
  ],
};
