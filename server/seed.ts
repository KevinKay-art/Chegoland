import type {
  ChegolandDatabase,
  ContactMessage,
  Cow,
  MilkRecord,
  Order,
  Product,
} from '../src/types/index.ts';

function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function isoTimestampDaysAgo(daysAgo: number, hour = 8, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const FARM_IMAGE_ASSETS = {
  heroPasture: '/src/assets/images/hero_pasture_cows_1794817658643.jpg',
  cowFriesian: '/src/assets/images/cow_friesian_portrait_1794817658243.jpg',
  cowAyrshire: '/src/assets/images/cow_ayrshire_portrait_1794817658460.jpg',
  cowJersey: '/src/assets/images/cow_jersey_portrait_1794817659529.jpg',
  freshMilk: '/src/assets/images/product_fresh_milk_1794817659179.jpg',
  malaYoghurt: '/src/assets/images/product_mala_yoghurt_1794817659247.jpg',
  gheeButter: '/src/assets/images/product_ghee_butter_1794817659885.jpg',
  farmEggs: '/src/assets/images/product_farm_eggs_1794817660006.jpg',
} as const;

export function createSeedDatabase(): ChegolandDatabase {
  const products: Product[] = [
    {
      id: 'prod-milk-1l',
      name: 'Fresh Whole Milk',
      nameSw: 'Maziwa Halisi Mabichi',
      category: 'Milk',
      unit: '1L',
      priceKes: 120,
      stock: 48,
      lowStockThreshold: 12,
      description:
        'Unblended morning-milked whole cow milk, chilled within 30 minutes at 4°C. Rich natural cream line for tea, ugali accompaniments, and family breakfasts.',
      descriptionSw:
        'Maziwa halisi yaliyokamuliwa asubuhi na kupozwa hadi 4°C ndani ya dakika 30. Mazito yenye krimu asilia kwa chai na familia.',
      image: FARM_IMAGE_ASSETS.freshMilk,
      featured: true,
      nutritionHighlight: '3.9% natural butterfat · 3.3g protein per 100ml · Rich in calcium & Vitamin B12',
    },
    {
      id: 'prod-milk-500ml',
      name: 'Fresh Whole Milk',
      nameSw: 'Maziwa Halisi Mabichi',
      category: 'Milk',
      unit: '500ml',
      priceKes: 65,
      stock: 64,
      lowStockThreshold: 15,
      description:
        'Single-day household bottle of pure pasteurized farm milk with zero preservatives or water dilution.',
      descriptionSw:
        'Chupa ndogo ya maziwa safi ya shambani yaliyochemshwa kitaalamu bila kemikali yoyote.',
      image: FARM_IMAGE_ASSETS.freshMilk,
      featured: false,
      nutritionHighlight: '3.9% natural butterfat · Zero additives · Chilled cold-chain',
    },
    {
      id: 'prod-milk-5l',
      name: 'Fresh Whole Milk Jerrycan',
      nameSw: 'Maziwa Halisi (Kopo Kubwa)',
      category: 'Milk',
      unit: '5L',
      priceKes: 560,
      stock: 16,
      lowStockThreshold: 5,
      description:
        'Food-grade sealed 5-litre family & café pack. Ideal for large households, offices, and specialty coffee shops.',
      descriptionSw:
        'Kopo la lita 5 lililofungwa kwa usalama kwa familia kubwa, ofisi, na mikahawa.',
      image: FARM_IMAGE_ASSETS.freshMilk,
      featured: true,
      nutritionHighlight: '5 litres pure herd milk · Saves KES 40 vs 1L packs',
    },
    {
      id: 'prod-mala-1l',
      name: 'Traditional Mala (Fermented Milk)',
      nameSw: 'Maziwa Mala Asilia',
      category: 'Fermented',
      unit: '1L',
      priceKes: 160,
      stock: 28,
      lowStockThreshold: 8,
      description:
        'Thick, tangy cultured lala milk fermented slowly in small stainless-steel vats for authentic Kenyan richness and gut-friendly probiotics.',
      descriptionSw:
        'Maziwa mala mazito yaliyochachushwa taratibu kwa ladha halisi ya Kikenya na probiotiki bora kwa tumbo.',
      image: FARM_IMAGE_ASSETS.malaYoghurt,
      featured: true,
      nutritionHighlight: 'Live probiotic cultures · High digestibility · Great with ugali & greens',
    },
    {
      id: 'prod-yoghurt-500ml',
      name: 'Creamy Natural Yoghurt',
      nameSw: 'Mtindi Asilia Mzito',
      category: 'Fermented',
      unit: '500ml',
      priceKes: 140,
      stock: 7,
      lowStockThreshold: 10,
      description:
        'Velvety unsweetened farm yoghurt cultured from whole Jersey & Friesian milk. No thickeners, starch, or artificial flavours.',
      descriptionSw:
        'Mtindi mzito bila sukari ya ziada, uliotengenezwa kutokana na maziwa halisi bila wanga.',
      image: FARM_IMAGE_ASSETS.malaYoghurt,
      featured: false,
      nutritionHighlight: 'Live active cultures · No refined sugar · 4.2g protein per 100g',
    },
    {
      id: 'prod-yoghurt-strawberry',
      name: 'Highland Berry Yoghurt',
      nameSw: 'Mtindi wa Matunda ya Mlimani',
      category: 'Fermented',
      unit: '500ml',
      priceKes: 165,
      stock: 0,
      lowStockThreshold: 8,
      description:
        'Small-batch strawberry-compote farm yoghurt blended weekly. Next fresh batch chills tomorrow morning.',
      descriptionSw:
        'Mtindi mtamu uliotiwa matunda ya stroberi ya shambani. Toleo jipya kesho asubuhi.',
      image: FARM_IMAGE_ASSETS.malaYoghurt,
      featured: false,
      nutritionHighlight: 'Real highland fruit puree · Live dairy cultures',
    },
    {
      id: 'prod-ghee-300g',
      name: 'Golden Clarified Ghee',
      nameSw: 'Samli Halisi ya Ng’ombe',
      category: 'Cultured & Fats',
      unit: '300g Jar',
      priceKes: 650,
      stock: 18,
      lowStockThreshold: 6,
      description:
        'Slow-simmered golden cow ghee made from pasture-fed cream. Fragrant, shelf-stable, and rich in fat-soluble vitamins A, D, and K2.',
      descriptionSw:
        'Samli safi ya dhahabu iliyopikwa polepole kutoka krimu ya ng’ombe wanaokula nyasi za kijani.',
      image: FARM_IMAGE_ASSETS.gheeButter,
      featured: true,
      nutritionHighlight: '100% pure clarified butterfat · Lactose-free · High smoke point',
    },
    {
      id: 'prod-butter-250g',
      name: 'Cultured Farm Butter',
      nameSw: 'Siagi Safi ya Shambani',
      category: 'Cultured & Fats',
      unit: '250g',
      priceKes: 380,
      stock: 21,
      lowStockThreshold: 6,
      description:
        'Hand-churned, lightly salted golden butter from fresh pasture cream. Spreads smoothly on warm toast or mandazi.',
      descriptionSw:
        'Siagi tamu ya manjano iliyotengenezwa kwa krimu halisi na chumvi kidogo.',
      image: FARM_IMAGE_ASSETS.gheeButter,
      featured: false,
      nutritionHighlight: '82% butterfat · Natural beta-carotene from highland grass',
    },
    {
      id: 'prod-eggs-30',
      name: 'Free-Range Farm Eggs',
      nameSw: 'Mayai Safi ya Kuku wa Kienyeji',
      category: 'Eggs',
      unit: 'Tray (30)',
      priceKes: 480,
      stock: 25,
      lowStockThreshold: 8,
      description:
        'Deep-amber yolk eggs from hens roaming Chegoland’s clover paddocks, collected every morning and packed clean.',
      descriptionSw:
        'Mayai yenye kiini cha manjano iliyokolea kutoka kuku wanaozunguka malishoni.',
      image: FARM_IMAGE_ASSETS.farmEggs,
      featured: false,
      nutritionHighlight: '30 large eggs · Rich in Omega-3 & choline · Morning-collected',
    },
  ];

  const cows: Cow[] = [
    {
      id: 'cow-neema',
      name: 'Neema',
      tagNumber: 'CHG-014',
      breed: 'Friesian',
      ageYears: 4,
      status: 'Lactating',
      dailyLitresAvg: 28.5,
      photo: FARM_IMAGE_ASSETS.cowFriesian,
      bio: 'Lead morning milker from our highland Friesian line; loves lucerne hay and Napier grass.',
    },
    {
      id: 'cow-baraka',
      name: 'Baraka',
      tagNumber: 'CHG-021',
      breed: 'Ayrshire',
      ageYears: 5,
      status: 'Lactating',
      dailyLitresAvg: 24.0,
      photo: FARM_IMAGE_ASSETS.cowAyrshire,
      bio: 'Steady South Rift Ayrshire known for balanced protein and effortless pasture grazing in Kapcholyo.',
    },
    {
      id: 'cow-tamu',
      name: 'Tamu',
      tagNumber: 'CHG-008',
      breed: 'Jersey',
      ageYears: 3,
      status: 'Lactating',
      dailyLitresAvg: 19.5,
      photo: FARM_IMAGE_ASSETS.cowJersey,
      bio: 'Produces our richest, high-butterfat cream used specifically for Chegoland Golden Ghee and butter.',
    },
    {
      id: 'cow-zawadi',
      name: 'Zawadi',
      tagNumber: 'CHG-033',
      breed: 'Friesian',
      ageYears: 6,
      status: 'Lactating',
      dailyLitresAvg: 26.2,
      photo: FARM_IMAGE_ASSETS.cowFriesian,
      bio: 'Calm matriarch of the morning parlour with consistent milk quality year-round.',
    },
    {
      id: 'cow-wema',
      name: 'Wema',
      tagNumber: 'CHG-041',
      breed: 'Ayrshire',
      ageYears: 5,
      status: 'Dry',
      dailyLitresAvg: 0,
      photo: FARM_IMAGE_ASSETS.cowAyrshire,
      bio: 'Currently on maternity dry-off rest in the lower clover paddock ahead of her next calf.',
    },
  ];

  // Seed 30 days of milk records (daysAgo 29 down to 0)
  const milkRecords: MilkRecord[] = [];
  const lactatingCows = cows.filter((c) => c.status === 'Lactating');
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = isoDateDaysAgo(daysAgo);
    lactatingCows.forEach((cow, idx) => {
      // Deterministic gentle daily variance so charts look realistic and consistent
      const wave = Math.sin((daysAgo + idx) * 0.65) * 1.4;
      const trend = (29 - daysAgo) * 0.04;
      const daily = Math.max(15, Number((cow.dailyLitresAvg + wave + trend).toFixed(1)));
      const morningLitres = Number((daily * 0.56).toFixed(1));
      const eveningLitres = Number((daily - morningLitres).toFixed(1));
      milkRecords.push({
        id: `mr-${date}-${cow.id}`,
        cowId: cow.id,
        cowName: cow.name,
        date,
        morningLitres,
        eveningLitres,
        totalLitres: Number((morningLitres + eveningLitres).toFixed(1)),
        notes: daysAgo === 0 ? 'Morning & evening parlour log' : undefined,
      });
    });
  }

  // Seed 30 days of orders (24 historical delivered orders + 3 active orders + today's orders)
  const sampleCustomers = [
    { name: 'Wanjiku Mwangi', phone: '0712345678', area: 'Kilimani, Nairobi' },
    { name: 'Brian Kiprop', phone: '0722987654', area: 'Kapcholyo & Kaplong' },
    { name: 'Amina Hassan', phone: '0733456789', area: 'Sotik Town' },
    { name: 'David Ochieng', phone: '0701122334', area: 'Kericho Town' },
    { name: 'Grace Chebet', phone: '0724556677', area: 'Bomet Town' },
    { name: 'Samuel Njoroge', phone: '0718990011', area: 'Litein' },
  ];

  const orders: Order[] = [];
  let seq = 975;

  for (let daysAgo = 29; daysAgo >= 1; daysAgo--) {
    // Seed ~1 order most days, 2 orders on busy weekends
    const countToday = daysAgo % 3 === 0 ? 2 : 1;
    for (let k = 0; k < countToday; k++) {
      seq++;
      const cust = sampleCustomers[(daysAgo + k) % sampleCustomers.length];
      const milkQty = 2 + ((daysAgo + k) % 4);
      const hasGhee = (daysAgo + k) % 3 === 0;
      const hasMala = (daysAgo + k) % 2 === 0;
      const items = [
        {
          productId: 'prod-milk-1l',
          name: 'Fresh Whole Milk',
          unit: '1L',
          priceKes: 120,
          quantity: milkQty,
        },
        ...(hasMala
          ? [
              {
                productId: 'prod-mala-1l',
                name: 'Traditional Mala (Fermented Milk)',
                unit: '1L',
                priceKes: 160,
                quantity: 1,
              },
            ]
          : []),
        ...(hasGhee
          ? [
              {
                productId: 'prod-ghee-300g',
                name: 'Golden Clarified Ghee',
                unit: '300g Jar',
                priceKes: 650,
                quantity: 1,
              },
            ]
          : []),
      ];
      const subtotalKes = items.reduce((sum, i) => sum + i.priceKes * i.quantity, 0);
      const deliveryFeeKes = subtotalKes >= 2000 ? 0 : 150;
      const totalKes = subtotalKes + deliveryFeeKes;

      const status =
        daysAgo === 1 && k === 0
          ? 'Out for Delivery'
          : daysAgo === 1 && k === 1
          ? 'Preparing'
          : 'Delivered';

      const ts = isoTimestampDaysAgo(daysAgo, 7 + k * 4, 20);
      orders.push({
        id: `ord-${seq}`,
        orderNumber: `CHG-2026-${seq}`,
        customerName: cust.name,
        phone: cust.phone,
        deliveryArea: cust.area,
        deliveryNotes: 'Call gate security on arrival.',
        items,
        subtotalKes,
        deliveryFeeKes,
        totalKes,
        paymentMethod: (daysAgo + k) % 4 === 0 ? 'Cash on Delivery' : 'M-Pesa',
        paymentStatus: status === 'Delivered' || (daysAgo + k) % 4 !== 0 ? 'Paid' : 'Pending',
        mpesaReceipt: (daysAgo + k) % 4 !== 0 ? `UAK${seq}MP9X` : undefined,
        status,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  }

  // Add 3 crisp, easy-to-test orders for today
  const todayOrders: Order[] = [
    {
      id: 'ord-1001',
      orderNumber: 'CHG-2026-1001',
      customerName: 'Wanjiku Mwangi',
      phone: '0712345678',
      deliveryArea: 'Kilimani, Nairobi',
      deliveryNotes: 'Deliver to Gate B, Rose Avenue apartments.',
      items: [
        { productId: 'prod-milk-5l', name: 'Fresh Whole Milk Jerrycan', unit: '5L', priceKes: 560, quantity: 1 },
        { productId: 'prod-mala-1l', name: 'Traditional Mala (Fermented Milk)', unit: '1L', priceKes: 160, quantity: 2 },
        { productId: 'prod-ghee-300g', name: 'Golden Clarified Ghee', unit: '300g Jar', priceKes: 650, quantity: 1 },
      ],
      subtotalKes: 1530,
      deliveryFeeKes: 150,
      totalKes: 1680,
      paymentMethod: 'M-Pesa',
      paymentStatus: 'Paid',
      mpesaReceipt: 'UBK49201XY',
      status: 'Out for Delivery',
      createdAt: isoTimestampDaysAgo(0, 6, 45),
      updatedAt: isoTimestampDaysAgo(0, 8, 15),
    },
    {
      id: 'ord-1002',
      orderNumber: 'CHG-2026-1002',
      customerName: 'Brian Kiprop',
      phone: '0722987654',
      deliveryArea: 'Kapcholyo & Kaplong',
      deliveryNotes: 'Leave with caretaker if I am in a meeting.',
      items: [
        { productId: 'prod-milk-1l', name: 'Fresh Whole Milk', unit: '1L', priceKes: 120, quantity: 4 },
        { productId: 'prod-eggs-30', name: 'Free-Range Farm Eggs', unit: 'Tray (30)', priceKes: 480, quantity: 1 },
      ],
      subtotalKes: 960,
      deliveryFeeKes: 150,
      totalKes: 1110,
      paymentMethod: 'M-Pesa',
      paymentStatus: 'Paid',
      mpesaReceipt: 'UBK49288ZT',
      status: 'Preparing',
      createdAt: isoTimestampDaysAgo(0, 7, 30),
      updatedAt: isoTimestampDaysAgo(0, 8, 0),
    },
    {
      id: 'ord-1003',
      orderNumber: 'CHG-2026-1003',
      customerName: 'Amina Hassan',
      phone: '0733456789',
      deliveryArea: 'Westlands, Nairobi',
      deliveryNotes: 'Morning delivery preferred before 11am.',
      items: [
        { productId: 'prod-butter-250g', name: 'Cultured Farm Butter', unit: '250g', priceKes: 380, quantity: 2 },
        { productId: 'prod-yoghurt-500ml', name: 'Creamy Natural Yoghurt', unit: '500ml', priceKes: 140, quantity: 2 },
      ],
      subtotalKes: 1040,
      deliveryFeeKes: 150,
      totalKes: 1190,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      status: 'Received',
      createdAt: isoTimestampDaysAgo(0, 8, 20),
      updatedAt: isoTimestampDaysAgo(0, 8, 20),
    },
  ];

  orders.push(...todayOrders);

  const messages: ContactMessage[] = [
    {
      id: 'msg-1',
      name: 'Peter Kamau — Kahawa Roasters',
      phone: '0721445566',
      email: 'procurement@kahawaroasters.co.ke',
      subject: 'Daily 5L Milk Supply for Westlands Café',
      message:
        'Hello Chegoland team, we run a specialty espresso bar in Westlands and would like to arrange 4 jerrycans (20L total) of your whole milk every Monday, Wednesday, and Friday morning.',
      read: false,
      createdAt: isoTimestampDaysAgo(0, 7, 10),
    },
    {
      id: 'msg-2',
      name: 'Mercy Muthoni',
      phone: '0715889922',
      email: 'mercy.muthoni@example.co.ke',
      subject: 'Weekend Farm Visit & Ghee Bulk Order',
      message:
        'Hi! Do you host small family farm tours in Kapcholyo, Kaplong on Saturdays? Also interested in ordering 6 jars of Golden Clarified Ghee for our parents.',
      read: false,
      createdAt: isoTimestampDaysAgo(1, 14, 25),
    },
    {
      id: 'msg-3',
      name: 'Dr. Collins Bett',
      phone: '0728334455',
      email: 'cbett@example.org',
      subject: 'Compliment on the Traditional Mala',
      message:
        'Just wanted to say your fermented mala tastes just like home in Sotik. Our whole family switched to weekly deliveries.',
      read: true,
      createdAt: isoTimestampDaysAgo(3, 11, 5),
    },
  ];

  return {
    products,
    cows,
    milkRecords,
    orders,
    messages,
  };
}
