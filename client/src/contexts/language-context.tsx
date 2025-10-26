
import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ar" | "fr";

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
    fr: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.menu": { en: "Menu", ar: "القائمة", fr: "Menu" },
  "nav.about": { en: "About", ar: "من نحن", fr: "À propos" },
  "nav.reservations": { en: "Reservations", ar: "الحجوزات", fr: "Réservations" },
  "nav.contact": { en: "Contact", ar: "اتصل بنا", fr: "Contact" },
  "nav.cart": { en: "Cart", ar: "السلة", fr: "Panier" },
  "nav.reserve": { en: "Reserve Table", ar: "احجز طاولة", fr: "Réserver une table" },

  // Hero Section
  "hero.welcome": { en: "Welcome to", ar: "مرحبا بكم في", fr: "Bienvenue à" },
  "hero.title": { en: "Crêperie Kinder 5", ar: "كريب كيندر 5", fr: "Crêperie Kinder 5" },
  "hero.description": {
    en: "Experience the authentic taste of Algeria with our handcrafted crêpes. From sweet to savory, each creation is made with traditional recipes and the finest ingredients.",
    ar: "اختبر المذاق الأصيل للجزائر مع الكريب المصنوع يدويًا. من الحلو إلى المالح، كل إبداع مصنوع بوصفات تقليدية وأفضل المكونات.",
    fr: "Découvrez le goût authentique de l'Algérie avec nos crêpes artisanales. Du sucré au salé, chaque création est faite avec des recettes traditionnelles et les meilleurs ingrédients."
  },
  "hero.viewMenu": { en: "View Menu", ar: "عرض القائمة", fr: "Voir le menu" },
  "hero.reserveTable": { en: "Reserve Table", ar: "احجز طاولة", fr: "Réserver une table" },

  // Menu
  "menu.title": { en: "Our Menu", ar: "قائمتنا", fr: "Notre Menu" },
  "menu.allCategories": { en: "All Categories", ar: "جميع الفئات", fr: "Toutes les catégories" },
  "menu.addToCart": { en: "Add to Cart", ar: "أضف إلى السلة", fr: "Ajouter au panier" },
  "menu.viewDetails": { en: "View Details", ar: "عرض التفاصيل", fr: "Voir les détails" },

  // Cart
  "cart.title": { en: "Shopping Cart", ar: "سلة التسوق", fr: "Panier" },
  "cart.empty": { en: "Your cart is empty", ar: "سلتك فارغة", fr: "Votre panier est vide" },
  "cart.emptyMessage": { en: "Add some delicious items from our menu!", ar: "أضف بعض العناصر اللذيذة من قائمتنا!", fr: "Ajoutez des articles délicieux de notre menu!" },
  "cart.continueShopping": { en: "Continue Shopping", ar: "متابعة التسوق", fr: "Continuer vos achats" },
  "cart.orderSummary": { en: "Order Summary", ar: "ملخص الطلب", fr: "Résumé de la commande" },
  "cart.total": { en: "Total", ar: "المجموع", fr: "Total" },
  "cart.checkout": { en: "Proceed to Checkout", ar: "متابعة إلى الدفع", fr: "Passer à la caisse" },
  "cart.remove": { en: "Remove", ar: "إزالة", fr: "Supprimer" },

  // Checkout
  "checkout.title": { en: "Checkout", ar: "إتمام الطلب", fr: "Paiement" },
  "checkout.customerInfo": { en: "Customer Information", ar: "معلومات العميل", fr: "Informations client" },
  "checkout.firstName": { en: "First Name", ar: "الاسم الأول", fr: "Prénom" },
  "checkout.lastName": { en: "Last Name", ar: "الاسم الأخير", fr: "Nom" },
  "checkout.phone": { en: "Phone Number", ar: "رقم الهاتف", fr: "Numéro de téléphone" },
  "checkout.email": { en: "Email", ar: "البريد الإلكتروني", fr: "Email" },
  "checkout.message": { en: "Additional Message", ar: "رسالة إضافية", fr: "Message supplémentaire" },
  "checkout.placeOrder": { en: "Place Order", ar: "تأكيد الطلب", fr: "Passer la commande" },

  // About
  "about.title": { en: "About Us", ar: "من نحن", fr: "À propos de nous" },

  // Contact
  "contact.title": { en: "Contact Us", ar: "اتصل بنا", fr: "Contactez-nous" },

  // Footer
  "footer.quickLinks": { en: "Quick Links", ar: "روابط سريعة", fr: "Liens rapides" },
  "footer.contact": { en: "Contact", ar: "اتصل بنا", fr: "Contact" },
  "footer.hours": { en: "Opening Hours", ar: "ساعات العمل", fr: "Horaires d'ouverture" },
  "footer.rights": { en: "All rights reserved", ar: "جميع الحقوق محفوظة", fr: "Tous droits réservés" },

  // Common
  "common.loading": { en: "Loading...", ar: "جاري التحميل...", fr: "Chargement..." },
  "common.close": { en: "Close", ar: "إغلاق", fr: "Fermer" },
  "common.back": { en: "Back", ar: "رجوع", fr: "Retour" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar");

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
