import type { Language, ProductCategory } from '../types/index.ts';

export const DELIVERY_FEE_KES = 150;
export const FREE_DELIVERY_THRESHOLD_KES = 2000;

export const DELIVERY_AREAS = [
  'Kapcholyo & Kaplong',
  'Sotik Town',
  'Bomet Town',
  'Litein',
  'Kericho Town',
  'Chebilat',
  'Nakuru Town',
  'Kilimani, Nairobi',
  'Westlands, Nairobi',
  'Karen, Nairobi',
];

export interface TranslationBundle {
  utilityBanner: string;
  adminPortal: string;
  nav: {
    home: string;
    shop: string;
    track: string;
    about: string;
    contact: string;
    cart: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheading: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    stat3Label: string;
    stat3Value: string;
  };
  home: {
    cowsHeading: string;
    cowsSub: string;
    dailyYieldLabel: string;
    featuredHeading: string;
    featuredSub: string;
    viewAllShop: string;
    whyHeading: string;
    whySub: string;
    why1Title: string;
    why1Desc: string;
    why2Title: string;
    why2Desc: string;
    why3Title: string;
    why3Desc: string;
    testimonialsHeading: string;
  };
  shop: {
    heading: string;
    subheading: string;
    searchPlaceholder: string;
    allCategories: string;
    inStock: string;
    lowStock: string;
    soldOut: string;
    addToCart: string;
    added: string;
    maxInCart: string;
    emptyTitle: string;
    emptyDesc: string;
    resetFilters: string;
    categories: Record<ProductCategory, string>;
  };
  cart: {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
    browseShop: string;
    subtotal: string;
    deliveryFee: string;
    freeDeliveryUnlocked: string;
    freeDeliveryHint: string;
    total: string;
    proceedCheckout: string;
    checkoutTitle: string;
    checkoutSub: string;
    customerDetails: string;
    fullName: string;
    phoneLabel: string;
    phoneHint: string;
    areaLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    paymentTitle: string;
    mpesaTitle: string;
    mpesaDesc: string;
    codTitle: string;
    codDesc: string;
    placeOrderMpesa: string;
    placeOrderCod: string;
    submitting: string;
    waitingMpesaTitle: string;
    waitingMpesaDesc: string;
    simulateFailBtn: string;
    mpesaFailedTitle: string;
    retryMpesaBtn: string;
    switchCodBtn: string;
  };
  track: {
    heading: string;
    subheading: string;
    orderNumberLabel: string;
    phoneLabel: string;
    searchBtn: string;
    searching: string;
    sampleHint: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    contactTitle: string;
    hoursTitle: string;
    hoursDesc: string;
    rights: string;
  };
  assistant: {
    buttonLabel: string;
    title: string;
    subtitle: string;
    placeholder: string;
    welcome: string;
    send: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  en: {
    utilityBanner: 'Morning milking 5:30 AM · Free delivery on orders above KES 2,000',
    adminPortal: 'Farm Admin',
    nav: {
      home: 'Home',
      shop: 'Shop',
      track: 'Track Order',
      about: 'About',
      contact: 'Contact',
      cart: 'Cart',
    },
    hero: {
      kicker: 'CHEGOLAND Agri-Empire LTD · Kapcholyo, Kaplong, Sotik',
      headline: 'Fresh from our pasture to your table',
      subheading:
        'Pure whole cow milk, traditional mala, golden ghee, and free-range eggs—chilled within 30 minutes of milking in Kapcholyo and delivered across Sotik, Bomet, Kericho, and Nairobi.',
      ctaPrimary: 'Shop Milk',
      ctaSecondary: 'Track Order',
      stat1Label: 'Chilled at 4°C within',
      stat1Value: '30 mins',
      stat2Label: 'Zero preservatives',
      stat2Value: '100% Pure',
      stat3Label: 'Morning dispatch',
      stat3Value: '5:30 AM',
    },
    home: {
      cowsHeading: 'Meet our cows',
      cowsSub:
        'Every drop comes from our zero-grazed Friesian, Ayrshire, and Jersey herd kept in clean shaded stalls and fed freshly cut Napier grass, lucerne, and spring water.',
      dailyYieldLabel: 'L / day avg',
      featuredHeading: 'Fresh from the dairy room',
      featuredSub:
        'Harvested daily in small batches so your family enjoys rich cream, honest nutrition, and clean taste.',
      viewAllShop: 'View all products',
      whyHeading: 'Why families choose Chegoland',
      whySub: 'Direct farm accountability from our zero-grazing shed to your kitchen doorstep.',
      why1Title: 'Fresh daily',
      why1Desc:
        'Milked at dawn and dusk in Kapcholyo, Kaplong (Sotik Constituency), never stored in middleman depots or mixed with external bulk milk.',
      why2Title: 'Hygienic cold chain',
      why2Desc:
        'Stainless-steel milking parlour, rapid 4°C chilling, and food-grade sealed bottles keep natural nutrients intact.',
      why3Title: 'Delivered to your door',
      why3Desc:
        'Reliable morning routes across Kaplong, Sotik, Bomet, Kericho, and Nairobi with instant M-Pesa STK Push or Cash on Delivery.',
      testimonialsHeading: 'Trusted by Kenyan homes and cafés',
    },
    shop: {
      heading: 'Farm Shop',
      subheading:
        'Order farm-direct milk, fermented mala, natural yoghurt, clarified ghee, cultured butter, and free-range eggs.',
      searchPlaceholder: 'Search milk, mala, ghee, eggs...',
      allCategories: 'All Products',
      inStock: 'In stock',
      lowStock: 'Low stock',
      soldOut: 'Sold out',
      addToCart: 'Add to Cart',
      added: 'Added',
      maxInCart: 'Max stock in cart',
      emptyTitle: 'No farm products matched your filter',
      emptyDesc: 'Try clearing your search term or switching back to all categories.',
      resetFilters: 'Reset filters',
      categories: {
        Milk: 'Fresh Milk',
        Fermented: 'Mala & Yoghurt',
        'Cultured & Fats': 'Ghee & Butter',
        Eggs: 'Farm Eggs',
      },
    },
    cart: {
      title: 'Your Farm Basket',
      emptyTitle: 'Your basket is empty',
      emptyDesc: 'Add fresh morning milk, mala, or golden ghee from the shop to get started.',
      browseShop: 'Browse Farm Shop',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery fee',
      freeDeliveryUnlocked: 'Free delivery unlocked',
      freeDeliveryHint: 'Add {amount} more for free delivery',
      total: 'Total',
      proceedCheckout: 'Proceed to Checkout',
      checkoutTitle: 'Checkout & Delivery',
      checkoutSub: 'Complete your details below for same-morning or next-morning dispatch.',
      customerDetails: 'Customer & Delivery Details',
      fullName: 'Full Name',
      phoneLabel: 'Phone Number (M-Pesa / Call)',
      phoneHint: 'Kenyan mobile format: 0712 345 678 or +254712345678',
      areaLabel: 'Delivery Area',
      notesLabel: 'Delivery Notes (Gate, Estate, Preferred Time)',
      notesPlaceholder: 'e.g. Gate B, call security on arrival, deliver before 9 AM',
      paymentTitle: 'Payment Method',
      mpesaTitle: 'Lipa na M-Pesa (STK Push)',
      mpesaDesc: 'Receive an instant PIN prompt on your Safaricom or Airtel line.',
      codTitle: 'Cash on Delivery',
      codDesc: 'Pay our rider in cash or M-Pesa upon doorstep delivery.',
      placeOrderMpesa: 'Pay with M-Pesa',
      placeOrderCod: 'Place Cash on Delivery Order',
      submitting: 'Processing order...',
      waitingMpesaTitle: 'Waiting for M-Pesa Payment',
      waitingMpesaDesc:
        'Check your phone for the M-Pesa STK prompt and enter your PIN to confirm.',
      simulateFailBtn: 'Simulate Cancelled / Failed PIN',
      mpesaFailedTitle: 'M-Pesa Payment Did Not Complete',
      retryMpesaBtn: 'Retry M-Pesa STK Push',
      switchCodBtn: 'Switch to Cash on Delivery',
    },
    track: {
      heading: 'Track Your Order',
      subheading:
        'Enter your Chegoland order number and phone number to check live farm preparation and delivery status.',
      orderNumberLabel: 'Order Number',
      phoneLabel: 'Phone Number',
      searchBtn: 'Check Status',
      searching: 'Checking...',
      sampleHint: 'Try sample order CHG-2026-1001 with phone 0712345678',
    },
    footer: {
      tagline:
        'Clean zero-grazing dairy farming in Kapcholyo, Kaplong (Sotik) and direct delivery across Bomet, Kericho & Nairobi.',
      quickLinks: 'Explore',
      contactTitle: 'Farm & Dispatch',
      hoursTitle: 'Milking & Delivery Hours',
      hoursDesc: 'Daily dispatch 5:30 AM – 4:00 PM EAT · Sotik, Bomet, Kericho & Nairobi routes',
      rights: 'CHEGOLAND Agri-Empire LTD Dairy Farm and Shop. All rights reserved.',
    },
    assistant: {
      buttonLabel: 'Ask Chegoland',
      title: 'Ask Chegoland',
      subtitle: 'Live product stock, prices & nutrition',
      placeholder: 'Ask about milk prices, mala, or delivery...',
      welcome:
        'Jambo! Ask me about today’s milk prices, available stock, nutrition benefits, or delivery across Kaplong, Sotik, Bomet, Kericho & Nairobi.',
      send: 'Send',
    },
  },
  sw: {
    utilityBanner: 'Kukamua asubuhi saa 11:30 · Usafirishaji bure kwa oda za KES 2,000+',
    adminPortal: 'Usimamizi',
    nav: {
      home: 'Nyumbani',
      shop: 'Duka',
      track: 'Fuatilia Oda',
      about: 'Kuhusu Sisi',
      contact: 'Wasiliana',
      cart: 'Kikapu',
    },
    hero: {
      kicker: 'CHEGOLAND Agri-Empire LTD · Kapcholyo, Kaplong, Sotik',
      headline: 'Safi kutoka malishoni hadi mezani pako',
      subheading:
        'Maziwa halisi ya ng’ombe, mala asilia, samli ya dhahabu, na mayai ya kienyeji—yanapozwa ndani ya dakika 30 huko Kapcholyo na kufikishwa Sotik, Bomet, Kericho na Nairobi.',
      ctaPrimary: 'Nunua Maziwa',
      ctaSecondary: 'Fuatilia Oda',
      stat1Label: 'Hupozwa kwa 4°C ndani ya',
      stat1Value: 'Dakika 30',
      stat2Label: 'Bila kemikali yoyote',
      stat2Value: '100% Asilia',
      stat3Label: 'Usafirishaji asubuhi',
      stat3Value: '11:30 Alfajiri',
    },
    home: {
      cowsHeading: 'Kutana na ng’ombe wetu',
      cowsSub:
        'Kila tone linatoka kwa ng’ombe wetu wa ufugaji wa ndani (zero-grazing) wa Friesian, Ayrshire, na Jersey wanaolishwa nyasi mbichi za Napier, luseni, na maji safi.',
      dailyYieldLabel: 'L / siku wastani',
      featuredHeading: 'Bidhaa mpya kutoka shambani',
      featuredSub:
        'Huandaliwa kila siku kwa viwango vidogo ili familia yako ifurahie ladha halisi na lishe bora.',
      viewAllShop: 'Tazama bidhaa zote',
      whyHeading: 'Kwa nini familia huchagua Chegoland',
      whySub: 'Uwajibikaji wa moja kwa moja kutoka banda safi la zero-grazing hadi mlangoni pako.',
      why1Title: 'Safi kila siku',
      why1Desc:
        'Hukamuliwa alfajiri na jioni huko Kapcholyo, Kaplong (Sotik), bila kuchanganywa na maziwa ya walanguzi.',
      why2Title: 'Usafi wa hali ya juu',
      why2Desc:
        'Vyombo vya chuma cha pua, upoozaji wa haraka wa 4°C, na chupa zilizofungwa kwa usalama.',
      why3Title: 'Hufikishwa nyumbani',
      why3Desc:
        'Usafirishaji wa uhakika Kaplong, Sotik, Bomet, Kericho na Nairobi kwa malipo ya haraka ya M-Pesa au pesa taslimu ukipokea.',
      testimonialsHeading: 'Inaaminika na familia na mikahawa ya Kenya',
    },
    shop: {
      heading: 'Duka la Shamba',
      subheading:
        'Agiza maziwa mabichi, mala iliyochachushwa, mtindi asilia, samli, siagi, na mayai ya kienyeji.',
      searchPlaceholder: 'Tafuta maziwa, mala, samli, mayai...',
      allCategories: 'Bidhaa Zote',
      inStock: 'Inapatikana',
      lowStock: 'Inakaribia kuisha',
      soldOut: 'Imeisha',
      addToCart: 'Weka Kikapuni',
      added: 'Imeongezwa',
      maxInCart: 'Kiwango chote kipo kikapuni',
      emptyTitle: 'Hakuna bidhaa zilizolingana na utafutaji wako',
      emptyDesc: 'Jaribu kufuta maneno ya utafutaji au chagua aina zote za bidhaa.',
      resetFilters: 'Onyesha zote',
      categories: {
        Milk: 'Maziwa Mabichi',
        Fermented: 'Mala & Mtindi',
        'Cultured & Fats': 'Samli & Siagi',
        Eggs: 'Mayai ya Shambani',
      },
    },
    cart: {
      title: 'Kikapu Chako',
      emptyTitle: 'Kikapu chako hakina bidhaa',
      emptyDesc: 'Ongeza maziwa safi ya asubuhi, mala, au samli kutoka dukani ili kuendelea.',
      browseShop: 'Nenda Dukani',
      subtotal: 'Jumla ndogo',
      deliveryFee: 'Gharama ya usafirishaji',
      freeDeliveryUnlocked: 'Usafirishaji bure umefunguliwa',
      freeDeliveryHint: 'Ongeza {amount} kupata usafirishaji bure',
      total: 'Jumla kuu',
      proceedCheckout: 'Endelea Kulipa',
      checkoutTitle: 'Kamilisha Oda na Usafirishaji',
      checkoutSub: 'Jaza maelezo yako hapa chini kwa usafirishaji wa haraka.',
      customerDetails: 'Maelezo ya Mteja na Anwani',
      fullName: 'Jina Kamili',
      phoneLabel: 'Namba ya Simu (M-Pesa / Mawasiliano)',
      phoneHint: 'Mfano wa namba ya Kenya: 0712 345 678 au +254712345678',
      areaLabel: 'Eneo la Kuletewa',
      notesLabel: 'Maelekezo ya Ziada (Geti, Mtaa, Muda)',
      notesPlaceholder: 'Mfano: Geti B, piga simu ukifika, lete kabla ya saa 3 asubuhi',
      paymentTitle: 'Njia ya Malipo',
      mpesaTitle: 'Lipa na M-Pesa (STK Push)',
      mpesaDesc: 'Pokea ujumbe wa kuweka PIN moja kwa moja kwenye simu yako.',
      codTitle: 'Lipa Ukipokea (Cash on Delivery)',
      codDesc: 'Mlipe mhudumu wetu taslimu au kwa M-Pesa akifikisha mzigo.',
      placeOrderMpesa: 'Lipa kwa M-Pesa',
      placeOrderCod: 'Tuma Oda (Lipa Ukipokea)',
      submitting: 'Inashughulikia oda...',
      waitingMpesaTitle: 'Inasubiri Malipo ya M-Pesa',
      waitingMpesaDesc:
        'Angalia simu yako kwa ujumbe wa M-Pesa STK kisha weka PIN yako kuthibitisha.',
      simulateFailBtn: 'Jaribu Kushindwa kwa PIN',
      mpesaFailedTitle: 'Malipo ya M-Pesa Hayakukamilika',
      retryMpesaBtn: 'Jaribu Tena M-Pesa',
      switchCodBtn: 'Badili kuwa Lipa Ukipokea',
    },
    track: {
      heading: 'Fuatilia Oda Yako',
      subheading:
        'Weka namba yako ya oda ya Chegoland na namba ya simu ili kuona hatua ya maandalizi na usafirishaji.',
      orderNumberLabel: 'Namba ya Oda',
      phoneLabel: 'Namba ya Simu',
      searchBtn: 'Angalia Hali',
      searching: 'Inatafuta...',
      sampleHint: 'Jaribu oda ya mfano CHG-2026-1001 na simu 0712345678',
    },
    footer: {
      tagline:
        'Ufugaji bora wa zero-grazing huko Kapcholyo, Kaplong (Sotik) na usafirishaji wa moja kwa moja Bomet, Kericho na Nairobi.',
      quickLinks: 'Kurasa',
      contactTitle: 'Shamba na Usafirishaji',
      hoursTitle: 'Saa za Kukamua na Usafirishaji',
      hoursDesc: 'Kila siku saa 11:30 alfajiri – 10:00 jioni · Njia za Sotik, Bomet, Kericho na Nairobi',
      rights: 'CHEGOLAND Agri-Empire LTD Dairy Farm and Shop. Haki zote zimehifadhiwa.',
    },
    assistant: {
      buttonLabel: 'Uliza Chegoland',
      title: 'Uliza Chegoland',
      subtitle: 'Bei za leo, bidhaa zilizopo & lishe',
      placeholder: 'Uliza kuhusu bei za maziwa, mala, au usafirishaji...',
      welcome:
        'Jambo! Niulize kuhusu bei za maziwa leo, bidhaa zilizopo ghalani, faida za lishe, au muda wa kufikisha Kaplong, Sotik, Bomet, Kericho na Nairobi.',
      send: 'Tuma',
    },
  },
};
