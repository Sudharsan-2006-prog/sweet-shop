import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, ShoppingBag, Bot, MessageSquare, ArrowRight,
  Heart, Gift, Trash2, Star, Crown, ChevronRight, Zap,
  Phone, CheckCircle, Package, Truck, MapPin,
} from 'lucide-react';
import { SWEETS_CATALOG } from './data/sweets';
import { SweetItem, CartItem, Order, ChatMessage } from './types';
import SweetsCatalog from './components/SweetsCatalog';
import { motion, AnimatePresence } from 'motion/react';

/* ─── TOAST ─── */
type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; type: ToastType; title: string; subtitle?: string; }
const TOAST_ICONS: Record<ToastType, string> = { success: '✅', error: '❌', warning: '⚠️', info: '✨' };

/* ─── CONFETTI ─── */
function launchConfetti(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#C5A86D', '#58181A', '#F5D898', '#8B2525', '#FDFBF7'];
  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width, y: -20,
    vx: (Math.random() - 0.5) * 5, vy: Math.random() * 4 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 3,
    rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 6, alpha: 1,
  }));
  let frame = 0;
  function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rotation += p.rotSpeed;
      p.alpha = Math.max(0, 1 - frame / 100);
      ctx.save(); ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      ctx.restore();
    });
    frame++;
    if (frame < 100) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

/* ─── ANIMATED COUNTER ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let s = 0;
        const step = Math.ceil(target / 50);
        const t = setInterval(() => {
          s = Math.min(s + step, target);
          setCount(s);
          if (s >= target) clearInterval(t);
        }, 30);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── OCCASIONS ─── */
const OCCASIONS = [
  { id: 'diwali', label: 'Diwali', emoji: '🪔', color: '#7c2d12', light: '#fed7aa' },
  { id: 'wedding', label: 'Wedding', emoji: '💍', color: '#881337', light: '#fecdd3' },
  { id: 'eid', label: 'Eid', emoji: '🌙', color: '#14532d', light: '#bbf7d0' },
  { id: 'birthday', label: 'Birthday', emoji: '🎂', color: '#4c1d95', light: '#ddd6fe' },
  { id: 'corporate', label: 'Corporate', emoji: '🏢', color: '#1e3a5f', light: '#bfdbfe' },
  { id: 'christmas', label: 'Christmas', emoji: '🎄', color: '#166534', light: '#bbf7d0' },
  { id: 'baby', label: 'New Baby', emoji: '👶', color: '#9d174d', light: '#fbcfe8' },
];

/* ─── LOYALTY RING ─── */
function LoyaltyRing({ points, max }: { points: number; max: number }) {
  const r = 36; const c = 2 * Math.PI * r;
  const fill = Math.min(points / max, 1);
  return (
    <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="#C5A86D" strokeWidth="7"
        strokeLinecap="round" strokeDasharray={`${c * fill} ${c * (1 - fill)}`} />
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'gifting' | 'profile'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['sweet-01', 'sweet-03']);
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(380);
  const [badgeKey, setBadgeKey] = useState(0);

  // Checkout form
  const [checkoutName, setCheckoutName] = useState('Deepika Sharma');
  const [checkoutEmail, setCheckoutEmail] = useState('deepika22@gmail.com');
  const [checkoutAddress, setCheckoutAddress] = useState('Flat 1202, Block C, Oberoi Splendor, Mumbai - 400060');
  const [justPlacedOrder, setJustPlacedOrder] = useState<Order | null>(null);
  const [checkoutDone, setCheckoutDone] = useState(false);

  // Express
  const [expressItem, setExpressItem] = useState<SweetItem | null>(null);
  const [isExpressOpen, setIsExpressOpen] = useState(false);
  const [expressQty, setExpressQty] = useState(1);
  const [expressStatus, setExpressStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  // Gifting
  const [giftStyle, setGiftStyle] = useState<'Velvet Crimson' | 'Festive Gold' | 'Ivory Pearl'>('Velvet Crimson');
  const [giftSize, setGiftSize] = useState<'4-Piece' | '9-Piece' | '16-Piece'>('9-Piece');
  const [giftSweets, setGiftSweets] = useState<Array<{ sweetId: string; name: string; price: number; quantity: number }>>([]);
  const [giftNote, setGiftNote] = useState('');
  const [boxKey, setBoxKey] = useState(0);

  // AI Chat
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'flippi' | 'airtel'>('flippi');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatFlippi, setChatFlippi] = useState<ChatMessage[]>([{
    id: 'f-1', sender: 'ai',
    text: "Namaste! 🙏 I'm Flippi, your personal sweet guide. Tell me who you're buying for, your budget, or any dietary needs — I'll suggest the perfect sweets!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: ["Sweets under ₹500", "Sugar-free options", "What goes with Kaju Katli?"]
  }]);
  const [chatAirtel, setChatAirtel] = useState<ChatMessage[]>([{
    id: 'a-1', sender: 'ai',
    text: "Welcome! 🎯 I can help you track your order or answer any delivery questions. Share your Order ID (e.g., ORD-2034) to get started.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: ["Check status of ORD-2034", "What's your return policy?", "When will my order arrive?"]
  }]);

  // Call modal
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callPhone, setCallPhone] = useState('');
  const [callDone, setCallDone] = useState(false);

  const confettiRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ── Toast ── */
  const addToast = useCallback((type: ToastType, title: string, subtitle?: string) => {
    const id = `t-${Date.now()}`;
    setToasts(p => [...p, { id, type, title, subtitle }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  /* ── Load orders ── */
  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(setPlacedOrders).catch(() => {});
  }, []);

  /* ── Scroll chat ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatFlippi, chatAirtel, isAiOpen]);

  /* ── Scroll reveal: handled by Framer Motion whileInView now ── */

  /* ── Cart ── */
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const tax = Math.floor(subtotal * 0.05);
  const delivery = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + tax + delivery;
  const shippingPct = Math.min((subtotal / 1000) * 100, 100);

  const addToCart = (sweet: SweetItem, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === sweet.id);
      if (ex) return prev.map(i => i.id === sweet.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { id: sweet.id, product: sweet, quantity: qty }];
    });
    setBadgeKey(k => k + 1);
    setIsCartOpen(true);
    addToast('success', `${sweet.name} added!`, `${qty} box${qty > 1 ? 'es' : ''} in your cart`);
  };

  const removeFromCart = (id: string) => {
    const item = cart.find(c => c.id === id);
    setCart(prev => prev.filter(i => i.id !== id));
    if (item) addToast('info', 'Item removed', item.product.name);
  };

  const updateQty = (id: string, delta: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));

  const toggleFav = (id: string) =>
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  /* ── Place order ── */
  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: checkoutName, email: checkoutEmail,
          items: cart.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.product.price, isCustomGift: i.product.id.includes('custom') })),
          subtotal, tax, deliveryCharge: delivery, total, deliveryAddress: checkoutAddress
        })
      });
      if (!res.ok) throw new Error();
      const order: Order = await res.json();
      setPlacedOrders(p => [order, ...p]);
      setJustPlacedOrder(order);
      setCart([]); setCheckoutDone(true);
      setLoyaltyPoints(p => p + Math.floor(total / 10));
      launchConfetti(confettiRef);
      addToast('success', `Order ${order.orderId} confirmed! 🎉`, `Estimated: ${order.estimatedDeliveryDate}`);
    } catch {
      addToast('error', 'Order failed', 'Please try again.');
    }
  };

  /* ── Express order ── */
  const placeExpress = async () => {
    if (!expressItem) return;
    setExpressStatus('loading');
    const s = expressItem.price * expressQty;
    const tx = Math.floor(s * 0.05);
    const dl = s >= 1000 ? 0 : 60;
    const tot = s + tx + dl;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: checkoutName, email: checkoutEmail,
          items: [{ name: expressItem.name, quantity: expressQty, price: expressItem.price, isCustomGift: false }],
          subtotal: s, tax: tx, deliveryCharge: dl, total: tot, deliveryAddress: checkoutAddress
        })
      });
      if (!res.ok) throw new Error();
      const order: Order = await res.json();
      setPlacedOrders(p => [order, ...p]);
      setJustPlacedOrder(order);
      setExpressStatus('done');
      setLoyaltyPoints(p => p + Math.floor(tot / 10));
      launchConfetti(confettiRef);
      addToast('success', '🚀 Express order confirmed!', expressItem.name);
    } catch {
      addToast('error', 'Express order failed', 'Please try again.');
      setExpressStatus('idle');
    }
  };

  /* ── AI chat ── */
  const sendMessage = async (mode: 'flippi' | 'airtel', text?: string) => {
    const msg = text || aiInput;
    if (!msg.trim()) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text: msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    if (mode === 'flippi') setChatFlippi(p => [...p, userMsg]);
    else setChatAirtel(p => [...p, userMsg]);
    setAiInput(''); setAiLoading(true);
    const history = mode === 'flippi' ? [...chatFlippi, userMsg] : [...chatAirtel, userMsg];
    try {
      const res = await fetch(`/api/chat/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`, sender: 'ai', text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: mode === 'flippi'
          ? ['Recommend sweets under ₹500', 'Sugar-free options for diabetics', 'Best gift for wedding?']
          : [`Track ${placedOrders[0]?.orderId || 'ORD-2034'}`, 'What is your return policy?', 'How long does delivery take?']
      };
      if (mode === 'flippi') setChatFlippi(p => [...p, aiMsg]);
      else setChatAirtel(p => [...p, aiMsg]);
    } catch (err: any) {
      const isKeyMissing = (err?.message || '').includes('API key') || (err?.message || '').includes('Gemini') || (err?.message || '').includes('configured');
      const setupMsg = [
        '🔑 AI Setup Required',
        '',
        'To enable the chatbot:',
        '1. Open ".env.local" in your project root',
        '2. Add: GEMINI_API_KEY=your_key_here',
        '3. Get a free key at aistudio.google.com',
        '4. Restart the server',
        '',
        'Your key stays private — never sent to the browser.'
      ].join('\n');
      const errorText = isKeyMissing ? setupMsg : '⚠️ Something went wrong. Please try again in a moment.';
      const errMsg: ChatMessage = {
        id: `e-${Date.now()}`, sender: 'ai', text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      if (mode === 'flippi') setChatFlippi(p => [...p, errMsg]);
      else setChatAirtel(p => [...p, errMsg]);
    } finally { setAiLoading(false); }
  };

  /* ── Gifting ── */
  const boxCapacity = giftSize === '4-Piece' ? 4 : giftSize === '9-Piece' ? 9 : 16;
  const giftTotal = (giftSize === '4-Piece' ? 150 : giftSize === '9-Piece' ? 250 : 400) + giftSweets.reduce((s, i) => s + i.price * i.quantity, 0);
  const giftCount = giftSweets.reduce((s, i) => s + i.quantity, 0);

  const updateGiftSweet = (sweetId: string, name: string, price: number, delta: number) => {
    if (delta > 0 && giftCount >= boxCapacity) { addToast('warning', 'Box is full!', `Max ${boxCapacity} pieces for this size`); return; }
    setGiftSweets(prev => {
      const ex = prev.find(s => s.sweetId === sweetId);
      if (ex) { const nq = ex.quantity + delta; if (nq <= 0) return prev.filter(s => s.sweetId !== sweetId); return prev.map(s => s.sweetId === sweetId ? { ...s, quantity: nq } : s); }
      if (delta > 0) return [...prev, { sweetId, name, price, quantity: 1 }];
      return prev;
    });
    setBoxKey(k => k + 1);
  };

  const addGiftToCart = () => {
    if (!giftSweets.length) { addToast('warning', 'Box is empty!', 'Add at least one sweet first'); return; }
    const price = giftTotal;
    const item: SweetItem = {
      id: `custom-${Date.now()}`, name: `${giftStyle} Gift Box — ${giftSize}`, category: 'Festive Specials', price,
      weight: giftSize, description: giftNote || 'A premium custom gift box.',
      imageUrl: 'https://images.pexels.com/photos/5765827/pexels-photo-5765827.jpeg?auto=compress&cs=tinysrgb&w=600',
      ingredients: ['Custom selection'], nutritionalDetails: { calories: 0, protein: '-', carbs: '-', fat: '-', sugar: '-' },
      flavorProfile: ['Custom Curation'], pairings: ['Imperial Saffron Thandai'], rating: 5.0
    };
    addToCart(item, 1);
    setGiftSweets([]); setGiftNote('');
    launchConfetti(confettiRef);
    addToast('success', '🎁 Gift box added to cart!', giftStyle);
  };

  const tiers = [
    { name: 'Bronze', min: 0, max: 500, icon: '🥉' },
    { name: 'Silver', min: 500, max: 1500, icon: '🥈' },
    { name: 'Gold', min: 1500, max: 3000, icon: '🥇' },
    { name: 'Platinum', min: 3000, max: 5000, icon: '💎' },
  ];
  const tier = tiers.find(t => loyaltyPoints >= t.min && loyaltyPoints < t.max) || tiers[3];
  const nextTier = tiers[tiers.indexOf(tier) + 1];

  const statusColor = (s: string) => s === 'DELIVERED' ? 'bg-green-500' : s === 'SHIPPED' ? 'bg-amber-500' : 'bg-rose-500';
  const statusIcon = (s: string) => s === 'DELIVERED' ? <CheckCircle className="w-4 h-4" /> : s === 'SHIPPED' ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />;

  /* ────────────────────────── RENDER ────────────────────────── */
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C241E] flex flex-col font-sans">
      <canvas ref={confettiRef} id="confetti-canvas" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EFE9DF] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 group">
            <span className="text-2xl">👑</span>
            <div>
              <div className="font-serif text-base md:text-lg font-bold text-[#58181A] leading-none">Imperial Mithai</div>
              <div className="text-[10px] font-mono text-[#C5A86D] uppercase tracking-widest hidden sm:block">Handcrafted Sweets</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { key: 'home', label: '🏠 Home' },
              { key: 'shop', label: '🛍️ Shop' },
              { key: 'gifting', label: '🎁 Gifting' },
              { key: 'profile', label: '📦 My Orders' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === key ? 'bg-[#58181A] text-white' : 'text-[#756D64] hover:bg-[#F9F6F0] hover:text-[#58181A]'}`}>
                {label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Loyalty */}
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <span className="text-base">{tier.icon}</span>
              <span className="text-xs font-bold text-amber-800">{loyaltyPoints} pts</span>
            </div>

            {/* Call */}
            <button onClick={() => { setCallDone(false); setCallPhone(''); setIsCallOpen(true); }}
              className="p-2 rounded-lg bg-[#F9F6F0] hover:bg-[#EFE9DF] text-[#58181A] transition-colors" title="Call us">
              <Phone className="w-4 h-4" />
            </button>

            {/* Cart */}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-lg bg-[#58181A] text-white hover:bg-[#421112] transition-colors">
              <ShoppingBag className="w-4 h-4" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span key={badgeKey} initial={{ scale: 0.4 }} animate={{ scale: [1.4, 0.9, 1], y: [0, -3, 0] }} transition={{ duration: 0.35, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
                    className="absolute -top-1.5 -right-1.5 bg-[#C5A86D] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile nav */}
            <select value={activeTab} onChange={e => setActiveTab(e.target.value as any)}
              className="md:hidden text-xs font-semibold bg-[#F9F6F0] border border-[#EFE9DF] px-2 py-2 rounded-lg text-[#58181A] focus:outline-none">
              <option value="home">Home</option>
              <option value="shop">Shop</option>
              <option value="gifting">Gifting</option>
              <option value="profile">My Orders</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ══ HOME ══ */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-16">

              {/* Hero */}
              <div className="relative rounded-2xl overflow-hidden bg-[#58181A] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(197,168,109,0.25),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(#C5A86D_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
                
                {/* Floating Gold Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute bg-[#C5A86D] rounded-full opacity-40 animate-float"
                      style={{
                        width: Math.random() * 6 + 2 + 'px',
                        height: Math.random() * 6 + 2 + 'px',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${Math.random() * 3 + 2}s`
                      }} 
                    />
                  ))}
                </div>

                <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-14">
                  <div className="flex-1 space-y-5">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 bg-[#C5A86D]/20 border border-[#C5A86D]/40 text-[#C5A86D] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" /> Handcrafted Premium Sweets
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="text-3xl md:text-5xl font-serif font-medium leading-tight">
                      Pure Saffron &amp;<br />Gold Leaf Sweets
                    </motion.h1>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                      className="text-white/75 text-sm md:text-base leading-relaxed max-w-lg">
                      Every sweet is hand-crafted using 100% organic ingredients — authentic milk solids, premium saffron, and edible gold leaves. Fresh daily from our kitchen to your door.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      className="flex flex-wrap gap-3">
                      <button onClick={() => setActiveTab('shop')}
                        className="relative overflow-hidden px-6 py-3 bg-[#C5A86D] hover:bg-[#B39359] text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg group">
                        <span className="relative z-10 flex items-center gap-2">Shop Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                      </button>
                      <button onClick={() => setActiveTab('gifting')}
                        className="px-6 py-3 border-2 border-[#C5A86D]/60 text-white hover:bg-white/10 font-semibold text-sm rounded-xl flex items-center gap-2 transition-all hover:border-[#C5A86D]">
                        <Gift className="w-4 h-4" /> Custom Gift Box
                      </button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                      className="flex flex-wrap gap-6 pt-2 border-t border-white/10">
                      {[{ n: 12400, s: '+', l: 'Sweets Made' }, { n: 4800, s: '+', l: 'Happy Customers' }, { n: 28, s: '', l: 'Cities Served' }].map(st => (
                        <div key={st.l}>
                          <div className="text-xl font-bold text-[#C5A86D]"><AnimatedCounter target={st.n} suffix={st.s} /></div>
                          <div className="text-[11px] text-white/50 font-mono uppercase tracking-wider">{st.l}</div>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Hero image */}
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                    className="relative md:w-80 shrink-0">
                    <div className="absolute -inset-3 bg-[#C5A86D]/20 rounded-2xl blur-xl animate-gold-glow" />
                    <img src="https://images.pexels.com/photos/14477960/pexels-photo-14477960.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Premium Indian sweets" className="relative w-64 h-64 md:w-80 md:h-72 object-cover rounded-2xl border-2 border-[#C5A86D] shadow-2xl animate-float" />
                    <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-[#EFE9DF] px-3 py-2">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                      </div>
                      <div className="text-xs font-bold text-[#58181A] mt-0.5">4.9 / 5 Rating</div>
                      <div className="text-[10px] text-[#756D64]">2,400+ reviews</div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Why choose us */}
              <div className="space-y-6">
                <motion.div className="text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <h2 className="text-2xl md:text-3xl font-serif text-[#58181A] font-medium">Why Choose Imperial Mithai?</h2>
                  <p className="text-sm text-[#756D64] mt-2">Everything we do is for you — freshness, quality, and care</p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[
                    { icon: '🌿', title: '100% Organic', desc: 'All ingredients sourced from certified organic farms. No preservatives, no artificial flavors.' },
                    { icon: '🎁', title: 'Custom Gift Boxes', desc: 'Design your own luxury gift box with a personal message. Perfect for every occasion.' },
                    { icon: '🤖', title: 'AI Shopping Help', desc: 'Our smart assistant helps you find the perfect sweet based on your taste and budget.' },
                  ].map((card, i) => (
                    <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                      className="bg-white border border-[#EFE9DF] rounded-2xl p-6 text-center hover:border-[#C5A86D] hover:-translate-y-1 transition-all duration-300 shadow-sm">
                      <div className="text-4xl mb-3">{card.icon}</div>
                      <h3 className="font-serif font-bold text-[#58181A] text-lg mb-2">{card.title}</h3>
                      <p className="text-sm text-[#756D64] leading-relaxed">{card.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Occasions carousel */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                    <div className="text-xs font-mono text-[#C5A86D] uppercase tracking-widest font-bold mb-1">Shop By Occasion</div>
                    <h2 className="text-2xl font-serif text-[#58181A] font-medium">Perfect For Every Celebration</h2>
                  </motion.div>
                  <button onClick={() => setActiveTab('shop')} className="text-sm text-[#C5A86D] hover:text-[#58181A] font-semibold flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none" style={{ scrollSnapType: 'x mandatory' }}>
                  {OCCASIONS.map((occ, i) => (
                    <motion.button key={occ.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      onClick={() => setActiveTab('shop')}
                      className="flex-none w-36 rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm"
                      style={{ scrollSnapAlign: 'start' }}>
                      <div className="h-28 flex flex-col items-center justify-center gap-2 text-white" style={{ backgroundColor: occ.color }}>
                        <span className="text-3xl">{occ.emoji}</span>
                        <span className="text-sm font-bold">{occ.label}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Popular sweets */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-4">
                  <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                    <div className="text-xs font-mono text-[#C5A86D] uppercase tracking-widest font-bold mb-1">Our Best Sellers</div>
                    <h2 className="text-2xl font-serif text-[#58181A] font-medium">Most Loved Sweets</h2>
                  </motion.div>
                  <button onClick={() => setActiveTab('shop')} className="text-sm text-[#C5A86D] hover:text-[#58181A] font-semibold flex items-center gap-1">
                    See All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {SWEETS_CATALOG.filter(s => s.isPopular).slice(0, 4).map((sweet, i) => (
                    <motion.div key={sweet.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(88,24,26,0.12)' }}
                      className="bg-white rounded-2xl overflow-hidden border border-[#EFE9DF] hover:border-[#C5A86D] transition-all shadow-sm group">
                      <div className="relative h-36 overflow-hidden">
                        <img src={sweet.imageUrl} alt={sweet.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        <button onClick={() => toggleFav(sweet.id)}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
                          <Heart className={`w-3.5 h-3.5 ${favorites.includes(sweet.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-[#58181A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">⭐ Popular</div>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="text-[10px] text-[#C5A86D] font-mono uppercase">{sweet.category}</div>
                        <h3 className="font-serif text-sm font-bold text-[#58181A] leading-tight">{sweet.name}</h3>
                        <div className="flex items-center justify-between pt-1 border-t border-[#F9F6F0]">
                          <span className="font-bold text-[#58181A]">₹{sweet.price}</span>
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => addToCart(sweet)}
                            className="bg-[#58181A] hover:bg-[#421112] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            + Add
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AI Promo banner */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ scale: 1.01 }} className="bg-gradient-to-r from-[#58181A] to-[#7c2030] rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#C5A86D] rounded-full flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                    <span className="text-xs font-mono text-[#C5A86D] uppercase tracking-widest font-bold">AI Shopping Assistant</span>
                  </div>
                  <h3 className="text-xl font-serif text-white font-medium">Not sure what to buy?</h3>
                  <p className="text-sm text-white/70">Tell Flippi your budget, occasion, or dietary needs — and get personalized sweet recommendations in seconds.</p>
                </div>
                <button onClick={() => setIsAiOpen(true)}
                  className="px-5 py-3 bg-[#C5A86D] hover:bg-[#B39359] text-white font-bold rounded-xl flex items-center gap-2 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                  <MessageSquare className="w-4 h-4" /> Ask Flippi
                </button>
              </motion.div>

              {/* Testimonials */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-white border border-[#EFE9DF] rounded-2xl p-8 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-[#58181A] font-medium">What Our Customers Say</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { quote: "The Kesar Peda was absolutely divine — the gold dust made it so special. Best sweet I've ever had!", by: 'Food & Luxury Gazette, May 2026' },
                    { quote: "Ordered 50 custom gift boxes for our wedding. Every box was perfect and the calligraphy note was a wonderful touch.", by: 'Dr. Raghavan Nair, Bengaluru' },
                  ].map((t, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#F9F6F0] border border-[#EFE9DF] flex items-center justify-center shrink-0 text-lg">👤</div>
                      <div>
                        <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
                        <p className="text-sm text-[#2C241E] leading-relaxed italic">"{t.quote}"</p>
                        <p className="text-xs text-[#A0988E] font-mono mt-1.5">— {t.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ══ SHOP ══ */}
          {activeTab === 'shop' && (
            <motion.div key="shop" initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}>
              <SweetsCatalog onAddToCart={addToCart} favorites={favorites} onToggleFavorite={toggleFav}
                onExpressBuy={(item) => { setExpressItem(item); setExpressQty(1); setExpressStatus('idle'); setIsExpressOpen(true); }} />
            </motion.div>
          )}

          {/* ══ GIFTING ══ */}
          {activeTab === 'gifting' && (
            <motion.div key="gifting" initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }} className="space-y-8">
              <div>
                <div className="text-xs font-mono text-[#C5A86D] uppercase tracking-widest font-bold mb-1">Curation Studio</div>
                <h2 className="text-2xl md:text-3xl font-serif text-[#58181A] font-medium">Custom Gift Box Builder</h2>
                <p className="text-sm text-[#756D64] mt-1.5 max-w-2xl">Design a personal gift box — choose the fabric, fill with sweets, and add a heartfelt message.</p>
              </div>

              {/* Quick presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { emoji: '🌟', label: 'Classic Box', sub: '9 pieces · Velvet Crimson', fn: () => { setGiftStyle('Velvet Crimson'); setGiftSize('9-Piece'); setGiftSweets([{ sweetId: 'sweet-01', name: 'Kesar Peda', price: 320, quantity: 3 }, { sweetId: 'sweet-02', name: 'Pistachio Baklava', price: 450, quantity: 3 }, { sweetId: 'sweet-03', name: 'Kaju Katli', price: 280, quantity: 3 }]); setGiftNote('Wishing you sweet memories!'); addToast('info', '🌟 Classic Box loaded!', '9-piece crimson box'); } },
                  { emoji: '🌿', label: 'Sugar-Free Box', sub: '9 pieces · Ivory Pearl', fn: () => { setGiftStyle('Ivory Pearl'); setGiftSize('9-Piece'); setGiftSweets([{ sweetId: 'sweet-04', name: 'Anjeer Roll', price: 380, quantity: 3 }, { sweetId: 'sweet-05', name: 'Almond Peda', price: 340, quantity: 3 }, { sweetId: 'sweet-08', name: 'Motichoor Laddu', price: 350, quantity: 3 }]); setGiftNote('Healthy & delicious!'); addToast('info', '🌿 Sugar-Free Box loaded!', 'Diabetic-safe gifting'); } },
                  { emoji: '👑', label: 'Grand Royal Box', sub: '16 pieces · Festive Gold', fn: () => { setGiftStyle('Festive Gold'); setGiftSize('16-Piece'); setGiftSweets([{ sweetId: 'sweet-01', name: 'Kesar Peda', price: 320, quantity: 4 }, { sweetId: 'sweet-02', name: 'Pistachio Baklava', price: 450, quantity: 4 }, { sweetId: 'sweet-03', name: 'Kaju Katli', price: 280, quantity: 4 }, { sweetId: 'sweet-06', name: 'Rose Laddu', price: 310, quantity: 4 }]); setGiftNote('A grand royal offering!'); addToast('info', '👑 Grand Royal Box loaded!', '16-piece festive gold'); } },
                ].map(p => (
                  <motion.button key={p.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={p.fn}
                    className="p-4 bg-white border-2 border-[#EFE9DF] hover:border-[#C5A86D] rounded-2xl text-left transition-all">
                    <div className="text-2xl mb-2">{p.emoji}</div>
                    <div className="font-bold text-[#58181A] text-sm">{p.label}</div>
                    <div className="text-xs text-[#756D64] mt-0.5">{p.sub}</div>
                  </motion.button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6 bg-white border border-[#EFE9DF] rounded-2xl p-6">
                  {/* Box Style */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#58181A]">1. Choose Box Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'Velvet Crimson' as const, color: '#5c1012', dot: 'bg-rose-900' },
                        { name: 'Festive Gold' as const, color: '#C5A86D', dot: 'bg-amber-400' },
                        { name: 'Ivory Pearl' as const, color: '#e5e7eb', dot: 'bg-stone-200' },
                      ].map(b => (
                        <button key={b.name} onClick={() => { setGiftStyle(b.name); setBoxKey(k => k + 1); }}
                          className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-center ${giftStyle === b.name ? 'border-[#58181A] bg-[#58181A]/5 ring-2 ring-[#58181A]/20' : 'border-[#EFE9DF] hover:border-[#C5A86D]'}`}>
                          <div className={`w-6 h-6 rounded-full ${b.dot} mx-auto mb-1.5 border border-black/10`} />
                          <span className="text-[#58181A]">{b.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Box Size */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#58181A]">2. Choose Box Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ s: '4-Piece' as const, p: 150 }, { s: '9-Piece' as const, p: 250 }, { s: '16-Piece' as const, p: 400 }].map(b => (
                        <button key={b.s} onClick={() => { setGiftSize(b.s); setGiftSweets([]); }}
                          className={`p-3 rounded-xl border-2 text-center text-xs transition-all ${giftSize === b.s ? 'border-[#58181A] bg-[#58181A]/5' : 'border-[#EFE9DF] hover:border-[#C5A86D]'}`}>
                          <div className="font-bold text-[#58181A]">{b.s}</div>
                          <div className="text-[#C5A86D] font-mono mt-0.5">₹{b.p} base</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sweets selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-[#58181A]">3. Fill with Sweets</label>
                      <span className="text-xs text-[#C5A86D] font-mono font-bold">{giftCount}/{boxCapacity} filled</span>
                    </div>
                    <div className="w-full h-2 bg-[#EFE9DF] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-[#C5A86D] to-[#58181A] rounded-full"
                        animate={{ width: `${(giftCount / boxCapacity) * 100}%` }} transition={{ duration: 0.4 }} />
                    </div>
                    <div className="divide-y divide-[#EFE9DF] border border-[#EFE9DF] rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                      {SWEETS_CATALOG.map(s => {
                        const qty = giftSweets.find(g => g.sweetId === s.id)?.quantity || 0;
                        return (
                          <div key={s.id} className={`flex items-center justify-between p-3 text-sm ${qty > 0 ? 'bg-amber-50' : 'bg-white'}`}>
                            <div>
                              <div className="font-semibold text-[#58181A]">{s.name}</div>
                              <div className="text-xs text-[#756D64]">₹{s.price} each</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateGiftSweet(s.id, s.name, s.price, -1)}
                                className="w-7 h-7 rounded-full border border-[#EFE9DF] bg-white flex items-center justify-center text-[#58181A] font-bold hover:bg-[#F9F6F0]">-</motion.button>
                              <span className="w-5 text-center font-mono font-bold text-sm">{qty}</span>
                              <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateGiftSweet(s.id, s.name, s.price, 1)}
                                className="w-7 h-7 rounded-full border border-[#EFE9DF] bg-white flex items-center justify-center text-[#58181A] font-bold hover:bg-[#F9F6F0]">+</motion.button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#58181A]">4. Add a Personal Message</label>
                    <textarea placeholder="e.g. Wishing you a happy Diwali! With love, the Gupta family."
                      value={giftNote} onChange={e => setGiftNote(e.target.value)} rows={3} maxLength={180}
                      className="w-full p-3 border border-[#EFE9DF] rounded-xl text-sm text-[#2C241E] focus:outline-none focus:border-[#C5A86D] placeholder-[#A0988E] resize-none" />
                    <div className="text-xs text-[#A0988E] text-right">{giftNote.length}/180</div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={addGiftToCart}
                    className="w-full py-3.5 bg-[#58181A] hover:bg-[#421112] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors">
                    <Gift className="w-4 h-4" /> Add Gift Box to Cart — ₹{giftTotal}
                  </motion.button>
                </div>

                {/* Live preview */}
                <div className="sticky top-24 h-fit">
                  <AnimatePresence mode="wait">
                    <motion.div key={`${giftStyle}-${boxKey}`} initial={{ rotateY: 60, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -60, opacity: 0 }}
                      transition={{ duration: 0.4 }} style={{ transformStyle: 'preserve-3d' }}
                      className={`rounded-2xl p-6 space-y-4 min-h-72 ${giftStyle === 'Velvet Crimson' ? 'bg-gradient-to-br from-[#5c1012] to-[#2e0506] text-white' : giftStyle === 'Festive Gold' ? 'bg-gradient-to-br from-[#fffbf0] to-[#fdf2d9] border-2 border-[#C5A86D]' : 'bg-gradient-to-br from-[#fcfcfc] to-[#f3f2ee] border-2 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold uppercase tracking-widest ${giftStyle === 'Velvet Crimson' ? 'text-[#C5A86D]' : 'text-[#58181A]'}`}>{giftStyle}</span>
                        <span className={`text-xs font-mono ${giftStyle === 'Velvet Crimson' ? 'text-white/60' : 'text-[#756D64]'}`}>{giftSize}</span>
                      </div>

                      {giftSweets.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center h-40 space-y-2 ${giftStyle === 'Velvet Crimson' ? 'text-white/40' : 'text-[#A0988E]'}`}>
                          <span className="text-3xl opacity-30">🎁</span>
                          <p className="text-sm">Add sweets to see the preview</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-5 gap-1.5">
                          {giftSweets.flatMap((sw, ii) =>
                            Array.from({ length: sw.quantity }).map((_, qi) => {
                              const emojis: Record<string, string> = { 'sweet-01': '🔸', 'sweet-02': '🟩', 'sweet-03': '⬜', 'sweet-04': '🟤', 'sweet-05': '🌰', 'sweet-06': '🔴', 'sweet-07': '🟡', 'sweet-08': '🟠' };
                              return (
                                <motion.div key={`${sw.sweetId}-${qi}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: qi * 0.04, type: 'spring', stiffness: 300 }}
                                  className={`aspect-square rounded-lg flex items-center justify-center text-lg border ${giftStyle === 'Velvet Crimson' ? 'bg-white/10 border-white/20' : 'bg-white border-[#EFE9DF]'}`}>
                                  {emojis[sw.sweetId] || '🍬'}
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {giftNote && (
                        <div className={`border-t pt-3 ${giftStyle === 'Velvet Crimson' ? 'border-white/10' : 'border-[#EFE9DF]'}`}>
                          <div className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${giftStyle === 'Velvet Crimson' ? 'text-[#C5A86D]' : 'text-[#C5A86D]'}`}>Your Message:</div>
                          <p className={`text-xs font-serif italic ${giftStyle === 'Velvet Crimson' ? 'text-white/70' : 'text-[#756D64]'}`}>"{giftNote}"</p>
                        </div>
                      )}

                      <div className={`rounded-xl p-3 space-y-1 ${giftStyle === 'Velvet Crimson' ? 'bg-white/10' : 'bg-white border border-[#EFE9DF]'}`}>
                        <div className={`flex justify-between text-xs ${giftStyle === 'Velvet Crimson' ? 'text-white/60' : 'text-[#756D64]'}`}>
                          <span>Box + Sweets</span>
                          <motion.span key={giftTotal} initial={{ color: '#C5A86D' }} animate={{ color: giftStyle === 'Velvet Crimson' ? '#ffffff' : '#58181A' }} className="font-bold">₹{giftTotal}</motion.span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ PROFILE / MY ORDERS ══ */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }} className="space-y-8">
              <div>
                <div className="text-xs font-mono text-[#C5A86D] uppercase tracking-widest font-bold mb-1">Your Account</div>
                <h2 className="text-2xl md:text-3xl font-serif text-[#58181A] font-medium">My Orders &amp; Checkout</h2>
              </div>

              {/* Loyalty banner */}
              <div className="bg-gradient-to-r from-[#58181A] to-[#8B2525] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center gap-5">
                <div className="relative">
                  <LoyaltyRing points={loyaltyPoints} max={nextTier?.max || 5000} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl">{tier.icon}</span>
                    <span className="text-[9px] text-[#C5A86D] font-bold uppercase">{tier.name}</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-serif text-lg font-bold">Loyalty Rewards</h3>
                  <p className="text-sm text-white/75 mt-1">
                    You have <span className="text-[#C5A86D] font-bold">{loyaltyPoints} points</span>
                    {nextTier && <> — {nextTier.max - loyaltyPoints} more to reach <span className="text-[#C5A86D] font-bold">{nextTier.name}</span></>}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tiers.map(t => (
                      <span key={t.name} className={`text-xs font-mono px-2 py-0.5 rounded-full border ${loyaltyPoints >= t.min ? 'border-[#C5A86D] text-[#C5A86D] bg-[#C5A86D]/10' : 'border-white/20 text-white/30'}`}>
                        {t.icon} {t.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-white/40 mt-2">Earn 1 point per ₹10 spent</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#C5A86D]">{loyaltyPoints}</div>
                  <div className="text-xs text-white/50 uppercase font-mono">Points</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orders */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#58181A]">Order History <span className="ml-2 text-sm bg-[#C5A86D]/20 text-[#58181A] px-2 py-0.5 rounded-full font-mono">{placedOrders.length}</span></h3>
                  {placedOrders.length === 0 && (
                    <div className="text-center py-12 bg-white border border-[#EFE9DF] rounded-2xl space-y-3">
                      <div className="text-4xl">📦</div>
                      <p className="text-sm text-[#756D64]">No orders yet. Start shopping!</p>
                      <button onClick={() => setActiveTab('shop')} className="px-4 py-2 bg-[#58181A] text-white text-sm font-semibold rounded-xl">Browse Sweets</button>
                    </div>
                  )}
                  <div className="space-y-3">
                    <AnimatePresence>
                      {placedOrders.map(ord => (
                        <motion.div key={ord.orderId} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                          className="bg-white border border-[#EFE9DF] rounded-2xl p-5 space-y-3 hover:border-[#C5A86D] transition-colors shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-mono font-bold text-sm text-[#58181A]">{ord.orderId}</div>
                              <div className="text-xs text-[#A0988E]">{ord.date}</div>
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white ${statusColor(ord.status)}`}>
                              {statusIcon(ord.status)} {ord.status}
                            </div>
                          </div>
                          <div className="bg-[#F9F6F0] rounded-xl p-3 space-y-1">
                            {ord.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-[#2C241E]">{item.name} <span className="text-[#756D64] text-xs">×{item.quantity}</span></span>
                                <span className="font-mono text-[#58181A]">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-[#756D64]">
                            <MapPin className="w-3 h-3 inline mr-1 text-[#C5A86D]" />{ord.deliveryAddress}
                          </div>
                          <div className="flex items-center justify-between text-xs border-t border-[#F9F6F0] pt-2">
                            <span className="text-[#756D64]">{ord.estimatedDeliveryDate}</span>
                            <button onClick={() => { navigator.clipboard.writeText(ord.orderId); addToast('info', 'Copied!', ord.orderId); }}
                              className="text-[#C5A86D] hover:text-[#58181A] font-semibold">Copy ID</button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Checkout */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#58181A]">Checkout</h3>
                  <div className="bg-white border border-[#EFE9DF] rounded-2xl p-6 shadow-sm">
                    {cart.length === 0 ? (
                      <div className="text-center py-10 space-y-3">
                        <div className="text-4xl">🛒</div>
                        <p className="text-sm text-[#756D64]">Your cart is empty.</p>
                        <button onClick={() => setActiveTab('shop')} className="px-4 py-2 bg-[#58181A] text-white text-sm font-semibold rounded-xl">Shop Now</button>
                      </div>
                    ) : (
                      <form onSubmit={placeOrder} className="space-y-4">
                        {!checkoutDone ? (
                          <>
                            {[
                              { id: 'co-name', label: 'Your Name', type: 'text', val: checkoutName, set: setCheckoutName },
                              { id: 'co-email', label: 'Email Address', type: 'email', val: checkoutEmail, set: setCheckoutEmail },
                            ].map(f => (
                              <div key={f.id}>
                                <label className="text-xs font-semibold text-[#756D64] uppercase tracking-wider block mb-1">{f.label}</label>
                                <input id={f.id} type={f.type} required value={f.val} onChange={e => f.set(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-[#F9F6F0] border border-[#EFE9DF] rounded-xl text-sm focus:outline-none focus:border-[#C5A86D]" />
                              </div>
                            ))}
                            <div>
                              <label className="text-xs font-semibold text-[#756D64] uppercase tracking-wider block mb-1">Delivery Address</label>
                              <textarea id="co-address" required value={checkoutAddress} onChange={e => setCheckoutAddress(e.target.value)} rows={2}
                                className="w-full px-3 py-2.5 bg-[#F9F6F0] border border-[#EFE9DF] rounded-xl text-sm focus:outline-none focus:border-[#C5A86D] resize-none" />
                            </div>
                            <div className="bg-[#F9F6F0] rounded-xl p-4 space-y-2 text-sm">
                              {[['Subtotal', `₹${subtotal}`], ['GST (5%)', `₹${tax}`], ['Delivery', delivery === 0 ? 'FREE ✓' : `₹${delivery}`]].map(([l, v]) => (
                                <div key={l} className="flex justify-between"><span className="text-[#756D64]">{l}</span><span className="font-mono">{v}</span></div>
                              ))}
                              <div className="flex justify-between font-bold text-[#58181A] border-t border-[#EFE9DF] pt-2 text-base">
                                <span>Total</span><span>₹{total}</span>
                              </div>
                            </div>
                            <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                              className="w-full py-3.5 bg-[#58181A] hover:bg-[#421112] text-white font-bold text-sm rounded-xl transition-colors shadow-md">
                              Place Order — ₹{total}
                            </motion.button>
                          </>
                        ) : (
                          <div className="text-center py-6 space-y-4">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-5xl">🎉</motion.div>
                            <h4 className="font-serif text-xl font-bold text-emerald-700">Order Placed!</h4>
                            <p className="text-sm text-[#756D64]">Order <strong>{justPlacedOrder?.orderId}</strong> confirmed.</p>
                            <button onClick={() => { setCheckoutDone(false); setActiveTab('profile'); }} className="px-5 py-2.5 bg-[#58181A] text-white font-semibold text-sm rounded-xl">View My Orders</button>
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-[#EFE9DF] py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <div>
              <div className="font-serif font-bold text-[#58181A]">Imperial Mithai Lounge</div>
              <div className="text-xs text-[#A0988E]">Handcrafted Premium Indian Sweets</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[#756D64]">
            {[['🏠 Home', 'home'], ['🛍️ Shop', 'shop'], ['🎁 Gifting', 'gifting'], ['📦 My Orders', 'profile']].map(([l, k]) => (
              <button key={k} onClick={() => setActiveTab(k as any)} className="hover:text-[#58181A] transition-colors">{l}</button>
            ))}
          </div>
          <div className="text-xs text-[#A0988E]">© 2026 Imperial Mithai. All rights reserved.</div>
        </div>
      </footer>

      {/* ── AI CHAT ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {isAiOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.88, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 20 }} transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="w-80 sm:w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-[#EFE9DF] flex flex-col pointer-events-auto overflow-hidden">
              <div className="bg-[#58181A] p-4 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#C5A86D] rounded-full flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                    <div>
                      <div className="font-bold text-sm">Concierge Assistant</div>
                      <div className="text-[10px] text-[#C5A86D]">Online • Ready to help</div>
                    </div>
                  </div>
                  <button onClick={() => setIsAiOpen(false)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 text-lg">&times;</button>
                </div>
                <div className="grid grid-cols-2 gap-1 bg-black/20 rounded-xl p-1">
                  {[{ m: 'flippi' as const, l: '✨ Sweet Advisor' }, { m: 'airtel' as const, l: '📦 Order Support' }].map(tab => (
                    <button key={tab.m} onClick={() => setAiMode(tab.m)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${aiMode === tab.m ? 'bg-[#C5A86D] text-white' : 'text-white/60 hover:text-white'}`}>
                      {tab.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDFBF7]">
                {(aiMode === 'flippi' ? chatFlippi : chatAirtel).map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-[#58181A] text-white rounded-br-sm' : 'bg-white border border-[#EFE9DF] text-[#2C241E] rounded-bl-sm shadow-sm'}`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.suggestions && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {msg.suggestions.map((s, i) => (
                            <button key={i} onClick={() => sendMessage(aiMode, s)}
                              className="text-[10px] bg-[#F9F6F0] hover:bg-[#58181A] hover:text-white text-[#58181A] px-2 py-1 rounded-lg border border-[#EFE9DF] transition-all">
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-[#A0988E] mt-1 px-1">{msg.timestamp}</span>
                  </motion.div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-sm text-[#756D64] bg-white border border-[#EFE9DF] rounded-2xl px-4 py-3 w-fit shadow-sm">
                    {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-[#C5A86D] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    <span className="text-xs">Thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 bg-white border-t border-[#EFE9DF] flex gap-2">
                <input type="text" placeholder={aiMode === 'flippi' ? "Ask for sweet recommendations..." : "Enter your Order ID..."}
                  value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage(aiMode); }}
                  className="flex-1 px-3 py-2 bg-[#F9F6F0] border border-[#EFE9DF] rounded-xl text-sm focus:outline-none focus:border-[#C5A86D]" />
                <button onClick={() => sendMessage(aiMode)} className="px-4 py-2 bg-[#58181A] text-white text-sm font-bold rounded-xl hover:bg-[#421112]">Send</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button onClick={() => setIsAiOpen(p => !p)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
          animate={{ boxShadow: ['0 0 0 0 rgba(197,168,109,0.4)', '0 0 0 10px rgba(197,168,109,0)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-14 h-14 bg-[#58181A] rounded-full border-2 border-[#C5A86D] flex items-center justify-center text-white pointer-events-auto shadow-2xl cursor-pointer relative"
          title="Chat with our assistant">
          <Bot className="w-6 h-6 text-[#C5A86D]" />
          <span className="absolute -top-1 -right-1">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
        </motion.button>
      </div>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col border-l border-[#EFE9DF]">
              <div className="p-5 border-b border-[#EFE9DF] flex items-center justify-between bg-[#F9F6F0]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#58181A]" />
                  <h3 className="font-serif text-lg font-bold text-[#58181A]">Your Cart</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-2xl text-[#756D64] hover:text-[#58181A] leading-none">&times;</button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="text-4xl">🍯</div>
                    <p className="text-sm text-[#756D64]">Your cart is empty.</p>
                    <button onClick={() => { setIsCartOpen(false); setActiveTab('shop'); }} className="px-4 py-2 bg-[#58181A] text-white text-sm font-semibold rounded-xl">Browse Sweets</button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {cart.map(item => (
                      <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex items-center gap-3 bg-[#FAF8F5] border border-[#EFE9DF] p-3 rounded-xl">
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg border border-[#EFE9DF] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#58181A] text-sm truncate">{item.product.name}</div>
                          <div className="text-xs text-[#756D64] font-mono">₹{item.product.price} / box</div>
                        </div>
                        <div className="flex items-center gap-1 border border-[#EFE9DF] bg-white rounded-lg overflow-hidden">
                          <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-[#58181A] font-bold text-sm hover:bg-[#F9F6F0]">-</button>
                          <span className="px-2 font-mono text-sm">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-[#58181A] font-bold text-sm hover:bg-[#F9F6F0]">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-[#A0988E] hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-[#EFE9DF] space-y-4">
                  {/* Shipping progress */}
                  <div>
                    <div className="flex justify-between text-xs text-[#756D64] mb-1.5">
                      <span>Free shipping progress</span>
                      <span className="font-semibold">{delivery === 0 ? '🎉 FREE shipping!' : `₹${1000 - subtotal} more for FREE shipping`}</span>
                    </div>
                    <div className="h-2 bg-[#EFE9DF] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-[#C5A86D] to-[#58181A] rounded-full"
                        animate={{ width: `${shippingPct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-[#756D64]"><span>Subtotal</span><span className="font-mono">₹{subtotal}</span></div>
                    <div className="flex justify-between text-[#756D64]"><span>GST (5%)</span><span className="font-mono">₹{tax}</span></div>
                    <div className="flex justify-between text-[#756D64]"><span>Delivery</span><span className={`font-mono ${delivery === 0 ? 'text-emerald-600 font-bold' : ''}`}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
                    <div className="flex justify-between font-bold text-[#58181A] text-base border-t border-[#EFE9DF] pt-1.5"><span>Total</span><span>₹{total}</span></div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setIsCartOpen(false); setActiveTab('profile'); }}
                    className="w-full py-3.5 bg-[#58181A] hover:bg-[#421112] text-white font-bold text-sm rounded-xl transition-colors shadow-md">
                    Proceed to Checkout
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EXPRESS MODAL ── */}
      <AnimatePresence>
        {isExpressOpen && expressItem && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', damping: 22 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-[#C5A86D] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#58181A] via-[#C5A86D] to-[#58181A]" />
              <button disabled={expressStatus === 'loading'} onClick={() => setIsExpressOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-[#F9F6F0] rounded-full flex items-center justify-center text-[#756D64] hover:text-[#58181A] text-xl border border-[#EFE9DF]">&times;</button>

              {expressStatus !== 'done' ? (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <h3 className="font-serif text-xl font-bold text-[#58181A]">Quick Buy</h3>
                    <p className="text-xs text-[#756D64]">Order instantly with saved details</p>
                  </div>

                  <div className="flex items-center gap-4 bg-[#F9F6F0] rounded-xl p-4 border border-[#EFE9DF]">
                    <img src={expressItem.imageUrl} alt={expressItem.name} className="w-16 h-16 object-cover rounded-xl border border-[#EFE9DF]" />
                    <div>
                      <div className="font-serif font-bold text-[#58181A]">{expressItem.name}</div>
                      <div className="text-xs text-[#756D64] font-mono">₹{expressItem.price} per box</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[#F9F6F0] rounded-xl p-4 border border-[#EFE9DF]">
                    <span className="text-sm font-semibold text-[#2C241E]">Quantity</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[#EFE9DF] bg-white rounded-lg overflow-hidden">
                        <button disabled={expressStatus === 'loading'} onClick={() => setExpressQty(p => Math.max(1, p - 1))} className="px-3 py-1 font-bold text-[#58181A] hover:bg-[#F9F6F0]">-</button>
                        <span className="px-3 font-mono font-bold">{expressQty}</span>
                        <button disabled={expressStatus === 'loading'} onClick={() => setExpressQty(p => p + 1)} className="px-3 py-1 font-bold text-[#58181A] hover:bg-[#F9F6F0]">+</button>
                      </div>
                      <span className="font-bold text-[#58181A] font-mono">₹{expressItem.price * expressQty}</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#756D64] space-y-1 bg-[#F9F6F0] rounded-xl p-3 border border-[#EFE9DF]">
                    <div className="flex justify-between"><span>GST (5%)</span><span>₹{Math.floor(expressItem.price * expressQty * 0.05)}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span>{expressItem.price * expressQty >= 1000 ? 'FREE' : '₹60'}</span></div>
                    <div className="flex justify-between font-bold text-[#58181A] text-sm pt-1 border-t border-[#EFE9DF]">
                      <span>Total</span>
                      <span>₹{expressItem.price * expressQty + Math.floor(expressItem.price * expressQty * 0.05) + (expressItem.price * expressQty >= 1000 ? 0 : 60)}</span>
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={placeExpress} disabled={expressStatus === 'loading'}
                    className="w-full py-3.5 bg-[#58181A] hover:bg-[#421112] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {expressStatus === 'loading' ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    ) : <><Zap className="w-4 h-4" /> Confirm Quick Buy</>}
                  </motion.button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14 }} className="text-6xl">🎉</motion.div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-emerald-700">Order Confirmed!</h4>
                    <p className="text-sm text-[#756D64] mt-1">Your sweets are being freshly prepared.</p>
                    {justPlacedOrder && <div className="mt-3 inline-block bg-[#F9F6F0] border border-[#EFE9DF] rounded-xl px-4 py-2 font-mono font-bold text-[#58181A]">{justPlacedOrder.orderId}</div>}
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => { setIsExpressOpen(false); setActiveTab('profile'); }} className="w-full py-3 bg-[#58181A] text-white font-bold text-sm rounded-xl">Track My Order</button>
                    <button onClick={() => setIsExpressOpen(false)} className="text-xs text-[#A0988E] hover:text-[#58181A] hover:underline">Continue Shopping</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CALL MODAL ── */}
      <AnimatePresence>
        {isCallOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', damping: 22 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#C5A86D] relative">
              <button onClick={() => setIsCallOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-[#F9F6F0] rounded-full flex items-center justify-center text-[#756D64] hover:text-[#58181A] border border-[#EFE9DF] text-xl">&times;</button>
              <div className="text-center space-y-4">
                <div className="text-4xl">📞</div>
                <h3 className="font-serif text-xl font-bold text-[#58181A]">Request a Callback</h3>
                {!callDone ? (
                  <>
                    <p className="text-sm text-[#756D64]">Prefer to order by phone? Enter your number and we'll call you within 5 minutes.</p>
                    <input type="tel" placeholder="+91 98765 43210" value={callPhone} onChange={e => setCallPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F9F6F0] border border-[#EFE9DF] rounded-xl text-center text-sm font-semibold focus:outline-none focus:border-[#C5A86D]" />
                    <button onClick={() => { if (!callPhone.trim()) { addToast('warning', 'Enter your phone number', ''); return; } setCallDone(true); addToast('success', 'Callback requested!', 'We\'ll call you in 5 minutes'); }}
                      className="w-full py-3 bg-[#58181A] hover:bg-[#421112] text-white font-bold text-sm rounded-xl transition-colors">
                      Request Callback
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 py-2">
                    <div className="text-3xl">✅</div>
                    <h4 className="font-serif font-bold text-emerald-700">Callback Requested!</h4>
                    <p className="text-sm text-[#756D64]">We'll call <strong className="text-[#58181A]">{callPhone}</strong> within 5 minutes.</p>
                    <button onClick={() => setIsCallOpen(false)} className="px-6 py-2 bg-[#58181A] text-white font-bold text-sm rounded-xl">Done</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOASTS ── */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2 pointer-events-none max-w-xs">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -80, opacity: 0 }} transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className={`bg-white rounded-2xl shadow-lg border-l-4 p-4 flex items-start gap-3 pointer-events-all cursor-pointer ${t.type === 'success' ? 'border-emerald-500' : t.type === 'error' ? 'border-rose-500' : t.type === 'warning' ? 'border-amber-500' : 'border-[#C5A86D]'}`}
              onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
              <span className="text-lg leading-none mt-0.5">{TOAST_ICONS[t.type]}</span>
              <div>
                <div className="text-sm font-bold text-[#2C241E]">{t.title}</div>
                {t.subtitle && <div className="text-xs text-[#756D64] mt-0.5">{t.subtitle}</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
