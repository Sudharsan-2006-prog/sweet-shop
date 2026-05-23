import { SweetItem, Order } from '../types';

export const SWEETS_CATALOG: SweetItem[] = [
  {
    id: "sweet-01",
    name: "Royal Golden Kesar Peda",
    category: "Traditional",
    price: 320,
    weight: "250g Box",
    description: "Handcrafted milk fudge infused with premium Kashmiri saffron strands, green cardamom, and layered with pure 24-karat edible gold dust.",
    imageUrl: "https://images.pexels.com/photos/14477960/pexels-photo-14477960.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Pure Condensed Milk (Khoya)", "Kashmiri Indigo Saffron", "Green Cardamom", "Organic Sugar", "Edible Gold Dust"],
    nutritionalDetails: { calories: 145, protein: "4.2g", carbs: "18.5g", fat: "5.8g", sugar: "12.0g" },
    flavorProfile: ["Saffron Richness", "Velvety Fudge", "Cardamom Notes"],
    pairings: ["Premium Almond Flakes", "Indian Masala Chai"],
    rating: 4.9,
    isPopular: true
  },
  {
    id: "sweet-02",
    name: "Artisanal Pistachio Baklava",
    category: "Festive Specials",
    price: 450,
    weight: "250g Box",
    description: "Crisp phyllo pastry stuffed with crushed Iranian pistachios, brushed with organic ghee and drizzled with rosewater honey syrup.",
    imageUrl: "https://images.pexels.com/photos/7474372/pexels-photo-7474372.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Phyllo Pastry", "Iranian Pistachios", "Organic Ghee", "Rosewater", "Acacia Honey"],
    nutritionalDetails: { calories: 180, protein: "3.5g", carbs: "21.0g", fat: "9.2g", sugar: "11.5g" },
    flavorProfile: ["Nutty Crunch", "Ghee Luxury", "Delicate Rosewater"],
    pairings: ["Saffron Rose Kulfi", "Black Turkish Coffee"],
    rating: 4.8,
    isPopular: true
  },
  {
    id: "sweet-03",
    name: "Pure Silver Leaf Kaju Katli",
    category: "Traditional",
    price: 280,
    weight: "250g Box",
    description: "Classic cashew fudge made of premium slow-roasted Goan cashews, hand-pressed with pure vegetarian silver sterling vark.",
    imageUrl: "https://images.pexels.com/photos/8887288/pexels-photo-8887288.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Goan Cashew Nuts", "Organic Cane Sugar", "Clarified Butter", "Vegetarian Silver Leaf"],
    nutritionalDetails: { calories: 128, protein: "3.2g", carbs: "15.0g", fat: "6.5g", sugar: "9.8g" },
    flavorProfile: ["Buttery Cashew", "Melt-In-Mouth", "Delicate Sweetness"],
    pairings: ["Spicy Cashews", "Warm Saffron Milk"],
    rating: 4.9,
    isPopular: true
  },
  {
    id: "sweet-04",
    name: "Organic Anjeer Khajur Roll",
    category: "Sugar-Free",
    price: 380,
    weight: "250g Box",
    description: "A guilt-free roll of dehydrated Turkish figs, Medjool dates, dry-roasted almonds, walnuts, and pistachio layers. No added sugar.",
    imageUrl: "https://images.pexels.com/photos/6832131/pexels-photo-6832131.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Turkish Dried Figs", "Medjool Dates", "California Walnuts", "Almonds", "Pistachios"],
    nutritionalDetails: { calories: 110, protein: "2.8g", carbs: "13.2g", fat: "4.5g", sugar: "0.0g (Added)" },
    flavorProfile: ["Fig Earthiness", "Date Sweetness", "Roasted Crunch"],
    pairings: ["Green Herbal Tea", "Rosewater Spritzer"],
    rating: 4.7
  },
  {
    id: "sweet-05",
    name: "Stevia Almond Peda",
    category: "Sugar-Free",
    price: 340,
    weight: "250g Box",
    description: "Premium almond and cream condensed fudge sweetened with organic green-leaf Stevia. Soft, textured, and diabetic-safe.",
    imageUrl: "https://images.pexels.com/photos/7474373/pexels-photo-7474373.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["California Sweet Almonds", "Low-Fat Skimmed Milk", "Stevia Extract", "Pistachio Dust"],
    nutritionalDetails: { calories: 115, protein: "5.1g", carbs: "10.2g", fat: "5.0g", sugar: "0.0g (Fruit sugar only)" },
    flavorProfile: ["Dense Almond", "Lightly Sweet", "Milky Fudge"],
    pairings: ["Sugar-free Motichoor Laddu", "Warm Almond Milk"],
    rating: 4.6
  },
  {
    id: "sweet-06",
    name: "Rose Petal Gulkand Laddu",
    category: "Festive Specials",
    price: 310,
    weight: "250g Box",
    description: "Premium bundi laddus stuffed with fresh rose-petal compote (Gulkand) and sun-dried pistachio granules in pure cow ghee.",
    imageUrl: "https://images.pexels.com/photos/14477974/pexels-photo-14477974.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Gram Flour Bundi", "Crimson Rose Petals (Gulkand)", "Pure Cow Ghee", "Pistachios", "Saffron Paste"],
    nutritionalDetails: { calories: 165, protein: "3.0g", carbs: "20.1g", fat: "7.5g", sugar: "13.5g" },
    flavorProfile: ["Rose Perfume", "Gulkand Sweetness", "Buttery Bundi"],
    pairings: ["Saffron Thandai", "Spiced Masala Almonds"],
    rating: 4.8,
    isPopular: true
  },
  {
    id: "sweet-07",
    name: "Ivory Malai Peda",
    category: "Traditional",
    price: 290,
    weight: "250g Box",
    description: "Caramelized cream disks embellished with organic cardamom pods for a melt-in-mouth, classic sweet experience.",
    imageUrl: "https://images.pexels.com/photos/10580261/pexels-photo-10580261.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Slow-Caramelized Malai Khoya", "Cardamom Pods", "Saffron Dust", "Pistachio"],
    nutritionalDetails: { calories: 138, protein: "3.9g", carbs: "17.2g", fat: "6.2g", sugar: "10.5g" },
    flavorProfile: ["Creamy Malai", "Rich Milk", "Cardamom"],
    pairings: ["Gold Leaf Kaju Katli", "Plain Chai"],
    rating: 4.7
  },
  {
    id: "sweet-08",
    name: "Sugar-Free Kesar Motichoor Laddu",
    category: "Sugar-Free",
    price: 350,
    weight: "250g Box",
    description: "Tiny gram-flour pearls fried in pure cow ghee and bound with erythritol-coconut nectar, flavored with organic saffron.",
    imageUrl: "https://images.pexels.com/photos/9609854/pexels-photo-9609854.jpeg?auto=compress&cs=tinysrgb&w=600",
    ingredients: ["Organic Gram Flour", "Grass-Fed Ghee", "Saffron Strands", "Erythritol Sweetener"],
    nutritionalDetails: { calories: 120, protein: "2.5g", carbs: "12.0g", fat: "6.8g", sugar: "0.0g (Keto-friendly)" },
    flavorProfile: ["Melt-in-mouth Bundi", "Ghee Glaze", "Saffron"],
    pairings: ["Anjeer Khajur Roll", "Fresh Mint Tea"],
    rating: 4.5
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    orderId: "ORD-9841",
    customerName: "Rohan Gupta",
    email: "rohan.gupta@outlook.com",
    items: [
      { name: "Royal Golden Kesar Peda", quantity: 2, price: 320 },
      { name: "Pure Silver Leaf Kaju Katli", quantity: 1, price: 280 }
    ],
    subtotal: 920,
    tax: 46,
    deliveryCharge: 60,
    total: 1026,
    status: "DELIVERED",
    date: "2026-05-18",
    deliveryAddress: "Apartment 4B, Silver Oak Residency, HSR Layout, Bengaluru, Karnataka - 560102",
    estimatedDeliveryDate: "Completed on 21 May 2026",
  },
  {
    orderId: "ORD-2034",
    customerName: "Deepika Sharma",
    email: "deepika22@gmail.com",
    items: [
      { name: "Artisanal Pistachio Baklava", quantity: 1, price: 450 },
      { name: "Organic Anjeer Khajur Roll", quantity: 1, price: 380 }
    ],
    subtotal: 830,
    tax: 41.5,
    deliveryCharge: 60,
    total: 931.5,
    status: "SHIPPED",
    date: "2026-05-21",
    deliveryAddress: "Flat 1202, Block C, Oberoi Splendor, JVLR, Andheri East, Mumbai, Maharashtra - 400060",
    estimatedDeliveryDate: "Expected by 24 May 2026, In Transit near Pune hub.",
  },
  {
    orderId: "ORD-1150",
    customerName: "Amit Patel",
    email: "amit.patel@yahoo.com",
    items: [
      { name: "Stevia Almond Peda", quantity: 2, price: 340 }
    ],
    subtotal: 680,
    tax: 34,
    deliveryCharge: 60,
    total: 774,
    status: "ORDERED",
    date: "2026-05-22",
    deliveryAddress: "Sector 21, House No. 445, Gandhinagar, Gujarat - 382021",
    estimatedDeliveryDate: "Expected by 26 May 2026, preparing freshly in our kitchen.",
  }
];
