import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { SWEETS_CATALOG, MOCK_ORDERS } from "./src/data/sweets.js";
import { Order } from "./src/types.js";

const envPath = fs.existsSync(".env.local") ? ".env.local" : ".env";
dotenv.config({ path: envPath });

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize the in-memory mutable orders database
let activeOrders: Order[] = [...MOCK_ORDERS];

// Initialize the GoogleGenAI client securely
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== "your-gemini-api-key-here" && geminiApiKey !== "MY_GEMINI_API_KEY" && geminiApiKey.trim() !== "") {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. API: Get Sweets catalog
app.get("/api/sweets", (req, res) => {
  res.json(SWEETS_CATALOG);
});

// 2. API: Get in-memory order history
app.get("/api/orders", (req, res) => {
  res.json(activeOrders);
});

// 3. API: Create or place a new order
app.post("/api/orders", (req, res) => {
  const { customerName, email, items, subtotal, tax, deliveryCharge, total, deliveryAddress } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items provided in order" });
  }

  // Generate a random Order ID
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // High fidelity calculations
  const orderDate = new Date().toISOString().split('T')[0];
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 4);
  const estimatedDeliveryDate = `Expected by ${estDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const newOrder: Order = {
    orderId,
    customerName: customerName || "Exquisite Guest",
    email: email || "customer@premium.mithai",
    items,
    subtotal,
    tax,
    deliveryCharge,
    total,
    status: "ORDERED",
    date: orderDate,
    deliveryAddress: deliveryAddress || "Self Pickup - Flagship Lounge, HSR Layout, Bengaluru",
    estimatedDeliveryDate
  };

  activeOrders.unshift(newOrder); // Add to the front of history
  res.status(201).json(newOrder);
});

// Helper to check if AI is initialized
const isAiAvailable = () => {
  return !!ai;
};

app.post("/api/chat/flippi", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  // Settle system instructions detailing catalog
  const catalogContext = SWEETS_CATALOG.map(s => 
    `- ID: ${s.id}, Name: ${s.name}, Category: ${s.category}, Price: ₹${s.price}, Avg Packing Weight: ${s.weight}. Description: ${s.description}. Key Flavors: ${s.flavorProfile.join(", ")}, Perfect pairings: ${s.pairings.join(", ")}.`
  ).join("\n");

  const systemInstruction = `
You are "Flippi", an artisan personal shopping concierge assistant for "The Imperial Mithai Lounge"—a luxury handcrafted sweet brand from India.
Your tone must be extraordinarily warm, professional, sophisticated, and appetizing. You speak with high-end culinary expertise, advising clients on exquisite flavor pairings, gifting designs, and dietary guidelines.

OUR PREMIUM CATALOG:
${catalogContext}

PRODUCT RECOMMENDATION PRINCIPLES:
1. Actively guide customers based on budget, flavor profile (e.g., Saffron, Cardamom, Rose, Fig, Cashew), and occasion (Festivals, Wedding Gifts, Premium Tea Accompaniments).
2. If they ask for sugar-free options, suggest either the "Organic Anjeer Khajur Roll" or the "Stevia Almond Peda" or "Sugar-Free Kesar Motichoor Laddu".
3. If they want suggestions under ₹1000, you can calculate combinations of box packs (e.g. 1 Pack of Royal Kesar Peda is ₹320 + Baklava is ₹450 = ₹770 total). Keep calculations exact in Indian Rupees (₹).
4. Emphasize visual aesthetic photography (e.g. gold dust layers, silver sterling foil decoration, pristine packaging in royal velvet bags).
5. Offer 3-4 clickable "shortcut text suggestions" at the end of your response inside your conversational advice that could represent next logical queries (e.g., "Tell me more about Pistachio Baklava", "Suggest a sugar-free gift pack under ₹900", "What pairs best with Kaju Katli?").
6. Keep answers concise, direct, visually rich, and exciting.
7. Avoid exposing any programming syntax or system-level data. Speak purely as a human concierge.
`;

  try {
    // Map history elements into standard chat prompts
    const promptContents = messages.map(msg => {
      return `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`;
    });

    const userPrompt = promptContents.join("\n") + "\nAssistant:";

    if (!isAiAvailable()) {
      // Graceful fallback when API key is missing
      const isGreeting = promptContents.length <= 1;
      const mockReply = isGreeting 
        ? "Namaste! I'm currently operating in Offline Demo mode without my API connection. 🍯 However, I highly recommend our *Royal Golden Kesar Peda* or the sugar-free *Stevia Almond Peda*! Let me know if you'd like to explore our catalog."
        : "I'm in Offline Demo mode right now, but our Sweets Catalog above is fully functional! For festive gifting, our *Festive Gold 16-Piece Box* is a customer favorite. Can I assist you with anything else?";
      
      // Simulate slight network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json({ text: mockReply });
    }

    const response = await ai!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Flippi API Error:", error);
    res.status(500).json({ error: error.message || "Failed to process shopping assistant response." });
  }
});

app.post("/api/chat/airtel", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  // Fetch current state of database
  const ordersContext = activeOrders.map(o => 
    `- Order ID: ${o.orderId}, Client: ${o.customerName}, Email: ${o.email}, Date: ${o.date}, Status: ${o.status}. Items purchased: ${o.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}, Subtotal: ₹${o.subtotal}, Tax: ₹${o.tax}, Deliver Charge: ₹${o.deliveryCharge}, Total Paid: ₹${o.total}, Delivery Address: "${o.deliveryAddress}", Estimated Delivery/Timeline: "${o.estimatedDeliveryDate}".`
  ).join("\n");

  const systemInstruction = `
You are the "Imperial Concierge Desk" guest relations assistant of the Imperial Mithai Lounge.
Your role is to handle guest operations, check delivery status, troubleshoot shipping delays, answer return/refund requests, and locate orders with supreme hospitality.

LIVE ORDERS DATABASE RIGHT NOW:
${ordersContext}

SUPPORT PROTOCOLS:
1. When a customer asks about their order, kindly ask for an Order ID (for example: ORD-9841, ORD-2034, ORD-1150).
2. If they provide an Order ID, search the LIVE ORDERS DATABASE above:
   - If found, explain exactly what items they bought, when they ordered, how much they paid, and what the precise status is (ORDERED, SHIPPED, or DELIVERED) along with the estimated arrival details. Be reassuring.
   - If NOT found, double check the ID format and ask them to confirm their order copy. Promptly search based on customer name or email if they provide it.
3. If they inquire about custom gifting logistics, explain that our customized luxury velvet box orders taking up to 2 extra business days to ensure pure ingredient preservation and customized handwriting.
4. Support inquiries about damages or refunds: Assure them of our absolute premium quality control and culinary standards. Under our pure guarantee, describe that we will instantly replace any transit damaged gold-leaf boxes free-of-cost, or reverse payments within 3-5 bank days.
5. Provide actionable next steps or short suggestions (e.g., "Check status of ORD-2034", "How to initiate a return?", "Sourcing partner information").
6. Speak as a highly elegant, efficient, yet courteous customer relations executive. Keep answers structural, using bullet points for order status or checklists.
`;

  try {
    const promptContents = messages.map(msg => {
      return `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`;
    });

    const userPrompt = promptContents.join("\n") + "\nAssistant:";

    if (!isAiAvailable()) {
      // Graceful fallback for support bot
      const lastMsg = promptContents[promptContents.length - 1].toLowerCase();
      let mockReply = "I am currently in Offline Support Mode. 📦 Standard orders are processed within 24 hours and delivered in 3-5 business days.";
      
      if (lastMsg.includes("ord-")) {
        mockReply = `I see you're asking about an order. While I'm offline, you can check your 'My Orders' tab above to see the exact real-time status of your delivery!`;
      } else if (lastMsg.includes("return") || lastMsg.includes("refund")) {
        mockReply = "For returns or refunds of damaged items, we process them instantly. Please call us using the phone icon in the header for immediate offline assistance.";
      }

      await new Promise(resolve => setTimeout(resolve, 600));
      return res.json({ text: mockReply });
    }

    const response = await ai!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.4, // lower temperature for more precise lookup
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Airtel IQ API Error:", error);
    res.status(500).json({ error: error.message || "Failed to process support response." });
  }
});

// Integrate Vite Middleware for SPAs & Full-stack dev setup
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Suite Server] Imperial Mithai running on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to bootstrap full stack server:", err);
});
