import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SweetItem, CartItem } from '../types';
import { SWEETS_CATALOG } from '../data/sweets';
import { Star, ShieldAlert, Sparkles, Filter, Info, ShoppingBag, ArrowRight, Heart, Volume2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SweetsCatalogProps {
  onAddToCart: (item: SweetItem, qty?: number) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onExpressBuy: (item: SweetItem) => void;
}

export default function SweetsCatalog({ onAddToCart, favorites, onToggleFavorite, onExpressBuy }: SweetsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Traditional' | 'Sugar-Free' | 'Festive Specials'>('All');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<SweetItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickQty, setQuickQty] = useState(1);
  const [wizardFlash, setWizardFlash] = useState<string | null>(null);

  // Web Speech API Auditory Narration state
  const [speakingSweetId, setSpeakingSweetId] = useState<string | null>(null);

  // Stop narration on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (sweet: SweetItem) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech narration is not supported in this browser.");
      return;
    }

    if (speakingSweetId === sweet.id) {
      window.speechSynthesis.cancel();
      setSpeakingSweetId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Construct rich spoken narration script
    const speakText = `This is our ${sweet.name}. ${sweet.description} It costs ${sweet.price} Rupees per ${sweet.weight}. Key ingredients include ${sweet.ingredients.slice(0, 3).join(", ")}. It is naturally gluten free, and contains ${
      sweet.id === 'sweet-04'
        ? 'roasted nuts, and is completely dairy free.'
        : sweet.id === 'sweet-08'
        ? 'organic dairy, but is nut free.'
        : 'organic dairy and roasted nuts.'
    }`;

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 0.85; // Slightly slower pacing for perfect elder/impaired accessibility
    utterance.pitch = 1.05;
    
    utterance.onend = () => setSpeakingSweetId(null);
    utterance.onerror = () => setSpeakingSweetId(null);

    setSpeakingSweetId(sweet.id);
    window.speechSynthesis.speak(utterance);
  };

  // Dietary and Allergen Filters state
  const [dietaryFilter, setDietaryFilter] = useState<'All' | 'Sugar-Free' | 'Dairy-Free' | 'Nut-Free'>('All');

  // 3-Click Guided Matcher state
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | null>(null);
  const [wizardAnswers, setWizardAnswers] = useState<{
    recipient: 'elderly' | 'corporate' | 'health' | 'celebration' | null;
    flavor: 'nutty' | 'saffron' | 'floral' | null;
    budget: 300 | 400 | 500 | null;
  }>({ recipient: null, flavor: null, budget: null });

  const applyWizardFilter = (sweet: SweetItem) => {
    // If wizard is not active or no selections made, don't filter
    if (!wizardAnswers.recipient && !wizardAnswers.flavor && !wizardAnswers.budget) return true;

    let matchesRecipient = true;
    if (wizardAnswers.recipient === 'elderly') {
      matchesRecipient = sweet.category === 'Sugar-Free' || sweet.name.includes('Peda');
    } else if (wizardAnswers.recipient === 'corporate') {
      matchesRecipient = sweet.name.includes('Gold') || sweet.name.includes('Silver') || sweet.isPopular === true;
    } else if (wizardAnswers.recipient === 'health') {
      matchesRecipient = sweet.category === 'Sugar-Free';
    } else if (wizardAnswers.recipient === 'celebration') {
      matchesRecipient = sweet.isPopular === true || sweet.category === 'Festive Specials';
    }

    let matchesFlavorPref = true;
    if (wizardAnswers.flavor === 'nutty') {
      matchesFlavorPref = sweet.id === 'sweet-02' || sweet.id === 'sweet-03' || sweet.id === 'sweet-04' || sweet.id === 'sweet-05';
    } else if (wizardAnswers.flavor === 'saffron') {
      matchesFlavorPref = sweet.flavorProfile.some(f => f.includes('Saffron') || f.includes('Cardamom') || f.includes('Kesar'));
    } else if (wizardAnswers.flavor === 'floral') {
      matchesFlavorPref = sweet.flavorProfile.some(f => f.includes('Rose') || f.includes('Fig') || f.includes('Gulkand'));
    }

    let matchesBudgetPref = true;
    if (wizardAnswers.budget === 300) {
      matchesBudgetPref = sweet.price <= 300;
    } else if (wizardAnswers.budget === 400) {
      matchesBudgetPref = sweet.price <= 400;
    } else if (wizardAnswers.budget === 500) {
      matchesBudgetPref = true;
    }

    return matchesRecipient && matchesFlavorPref && matchesBudgetPref;
  };

  // Extract all unique flavors for filtering
  const allFlavors = ['All', ...Array.from(new Set(SWEETS_CATALOG.flatMap(s => s.flavorProfile)))];

  // Filtering Logic
  const filteredSweets = SWEETS_CATALOG.filter(sweet => {
    const matchesCategory = selectedCategory === 'All' || sweet.category === selectedCategory;
    const matchesFlavor = selectedFlavor === 'All' || sweet.flavorProfile.includes(selectedFlavor);
    const matchesSearch = sweet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sweet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sweet.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Allergen & Dietary Filter Toggles
    const matchesDietary = 
      dietaryFilter === 'All' ||
      (dietaryFilter === 'Sugar-Free' && sweet.category === 'Sugar-Free') ||
      (dietaryFilter === 'Dairy-Free' && sweet.id === 'sweet-04') ||
      (dietaryFilter === 'Nut-Free' && sweet.id === 'sweet-08');

    // 3-Click Guided Matcher Filter
    const matchesWizard = applyWizardFilter(sweet);

    return matchesCategory && matchesFlavor && matchesSearch && matchesDietary && matchesWizard;
  });

  return (
    <div id="sweets-catalog-section" className="space-y-10">
      
      {/* Visual Header / Categorization Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-[#EFE9DF] pb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#C5A86D] uppercase block mb-1">Our Confections</span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#58181A] font-medium">The Mithai Catalog</h2>
        </div>

        {/* Live Catalog Search Bar */}
        <div className="w-full md:w-80">
          <input
            id="catalog-search-input"
            type="text"
            placeholder="Search saffron, peda, cashew..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#EFE9DF] rounded-md focus:outline-none focus:border-[#C5A86D] text-sm text-[#2C241E] shadow-xs placeholder-[#A0988E]"
          />
        </div>
      </div>

      {/* Smart Visual Guided Matcher Launch Callout */}
      <div className="bg-gradient-to-r from-[#58181A] to-[#3a0f10] border border-[#C5A86D] rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C5A86D_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />
        <div className="relative space-y-1 z-10 text-center sm:text-left">
          <span className="bg-[#C5A86D]/20 text-[#C5A86D] border border-[#C5A86D]/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
            👴 Elder & Visually Impaired Friendly
          </span>
          <h3 className="font-serif text-lg text-white font-medium">Struggling to read our catalog details?</h3>
          <p className="text-xs text-[#FDFBF7]/80">Answer 3 simple visual questions to let our master chef match confections for your exact palate!</p>
        </div>
        <button
          id="open-guided-matcher-btn"
          onClick={() => {
            setWizardStep(wizardStep ? null : 1);
            setWizardAnswers({ recipient: null, flavor: null, budget: null });
          }}
          className="px-5 py-2.5 bg-[#C5A86D] hover:bg-[#B39359] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-md transition-all z-10 shadow-md transform hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          🎯 {wizardStep ? 'Close Matcher' : 'Find Sweet in 3 Clicks'}
        </button>
      </div>

      {/* Interactive 3-Click Wizard Body */}
      <AnimatePresence>
        {wizardStep && (
          <motion.div
            id="guided-matcher-wizard-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-[#C5A86D] rounded-xl p-6 shadow-xl space-y-6 overflow-hidden relative"
          >
            <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-3">
              <span className="font-mono text-xs text-[#58181A] uppercase tracking-wider font-bold">
                Step {wizardStep} of 3: {
                  wizardStep === 1 ? 'Who is enjoying this sweet?' :
                  wizardStep === 2 ? 'What flavor style do you like?' :
                  'Select Your Box Budget'
                }
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((s) => (
                  <span 
                    key={s} 
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      wizardStep === s ? 'bg-[#58181A] scale-125' : wizardStep > s ? 'bg-[#C5A86D]' : 'bg-[#EFE9DF]'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: Purpose */}
            {wizardStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'elderly', title: '👵 Elderly / Parents', desc: 'Soft textures, fragrant digests & diabetic-safe sweet profiles.' },
                  { id: 'corporate', title: '👔 Corporate / Clients', desc: 'Showstopper luxury pedas and cashew vark confections.' },
                  { id: 'health', title: '🌿 Health & Fitness', desc: '100% sugar-free, stevia-sweetened & whole dried fig rolls.' },
                  { id: 'celebration', title: '💖 Festive Celebrations', desc: 'Our famous sweet-glaze best-sellers and royal delights.' }
                ].map((opt) => (
                  <button
                    id={`wizard-opt-recipient-${opt.id}`}
                    key={opt.id}
                    onClick={() => {
                      setWizardAnswers(prev => ({ ...prev, recipient: opt.id as any }));
                      setWizardStep(2);
                    }}
                    className={`p-4 rounded-lg border text-left flex flex-col justify-between h-32 hover:border-[#58181A] cursor-pointer transition-all ${
                      wizardAnswers.recipient === opt.id 
                        ? 'border-[#58181A] bg-[#58181A]/5 ring-1 ring-[#58181A]' 
                        : 'border-[#EFE9DF] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#58181A] font-serif">{opt.title}</span>
                    <span className="text-[10px] text-[#756D64] leading-relaxed pt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2: Flavor Preference */}
            {wizardStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'nutty', title: '🥜 Nutty & Crunchy Crunch', desc: 'Decadent Goan cashews, toasted walnuts, sweet almonds & green pistachios.' },
                  { id: 'saffron', title: '🔸 Saffron & Cardamom Notes', desc: 'Aromatic pure Indigo saffron strands & traditional hand-pounded cardamom solids.' },
                  { id: 'floral', title: '🌹 Sun Rose & Natural Honey', desc: 'Hand-picked rose-petal compote compotes, dried dates & fig earthiness.' }
                ].map((opt) => (
                  <button
                    id={`wizard-opt-flavor-${opt.id}`}
                    key={opt.id}
                    onClick={() => {
                      setWizardAnswers(prev => ({ ...prev, flavor: opt.id as any }));
                      setWizardStep(3);
                    }}
                    className={`p-4 rounded-lg border text-left flex flex-col justify-between h-32 hover:border-[#58181A] cursor-pointer transition-all ${
                      wizardAnswers.flavor === opt.id 
                        ? 'border-[#58181A] bg-[#58181A]/5 ring-1 ring-[#58181A]' 
                        : 'border-[#EFE9DF] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#58181A] font-serif">{opt.title}</span>
                    <span className="text-[10px] text-[#756D64] leading-relaxed pt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 3: Budget Selector */}
            {wizardStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 300, title: '🪙 Under ₹300 per Box', desc: 'Classic traditional recipes that offer sweet comfort.' },
                  { id: 400, title: '🌟 Under ₹400 per Box', desc: 'Medium premium recipe curations & specialized health treats.' },
                  { id: 500, title: '👑 Royal Connoisseur', desc: 'No limits. Access to edible gold dust, silver varks, and grand masterworks.' }
                ].map((opt) => (
                  <button
                    id={`wizard-opt-budget-${opt.id}`}
                    key={opt.id}
                    onClick={() => {
                      const finalAnswers = { ...wizardAnswers, budget: opt.id as any };
                      setWizardAnswers(finalAnswers);
                      setWizardStep(null); // Finish wizard matching
                      setWizardFlash('✨ Curated Confections Located! Discover your perfectly matched sweets in the grid below.');
                      setTimeout(() => setWizardFlash(null), 4000);
                      setTimeout(() => {
                        document.getElementById('sweets-catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
                      }, 120);
                    }}
                    className={`p-4 rounded-lg border text-left flex flex-col justify-between h-32 hover:border-[#58181A] cursor-pointer transition-all ${
                      wizardAnswers.budget === opt.id 
                        ? 'border-[#58181A] bg-[#58181A]/5 ring-1 ring-[#58181A]' 
                        : 'border-[#EFE9DF] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#58181A] font-serif">{opt.title}</span>
                    <span className="text-[10px] text-[#756D64] leading-relaxed pt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation Buttons for Wizard */}
            <div className="flex justify-between items-center pt-2 border-t border-[#EFE9DF]">
              <button
                id="wizard-back-btn"
                disabled={wizardStep === 1}
                onClick={() => setWizardStep((prev) => (prev ? (prev - 1 as any) : 1))}
                className="text-xs font-mono font-bold text-[#58181A] hover:text-[#C5A86D] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                &larr; Back Step
              </button>
              
              <button
                id="wizard-reset-btn"
                onClick={() => {
                  setWizardAnswers({ recipient: null, flavor: null, budget: null });
                  setWizardStep(null);
                }}
                className="text-[10px] font-mono text-[#A0988E] hover:text-[#58181A] uppercase cursor-pointer"
              >
                Reset Matcher Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Options Panel */}
      <div className="space-y-4 bg-[#F9F6F0] p-4 rounded-lg border border-[#EFE9DF] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Categories Tab list */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Traditional', 'Sugar-Free', 'Festive Specials'].map((cat) => (
              <button
                id={`cat-filter-btn-${cat.toLowerCase().replace(' ', '-')}`}
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#58181A] text-white shadow-xs'
                    : 'bg-white border border-[#EFE9DF] text-[#58181A] hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dynamic Flavor Profile Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#C5A86D]" />
            <span className="text-xs font-sans text-[#756D64]">Flavor Signature:</span>
            <select
              id="flavor-profile-select"
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EFE9DF] rounded-md text-xs font-medium text-[#58181A] focus:outline-none focus:border-[#C5A86D]"
            >
              {allFlavors.map(flavor => (
                <option key={flavor} value={flavor}>{flavor}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dietary & Allergen Safety Filters Panel Row */}
        <div className="pt-3 border-t border-[#EFE9DF]/60 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-mono text-[#756D64] uppercase tracking-wider font-bold">🏷️ Safety Allergen Toggles:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'All', label: 'Show All Sweets', color: 'bg-stone-50 border-stone-200' },
              { id: 'Sugar-Free', label: '🚫 Sugar-Free Only', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
              { id: 'Dairy-Free', label: '🥛 Dairy-Free Options', color: 'bg-blue-50 border-blue-200 text-blue-800' },
              { id: 'Nut-Free', label: '🥜 Nut-Free Options', color: 'bg-amber-50 border-amber-200 text-amber-800' }
            ].map((diet) => (
              <button
                id={`dietary-filter-btn-${diet.id.toLowerCase()}`}
                key={diet.id}
                onClick={() => setDietaryFilter(diet.id as any)}
                className={`px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                  dietaryFilter === diet.id
                    ? 'bg-[#58181A] text-white border-[#58181A] shadow-xs animate-pulse'
                    : `bg-white hover:${diet.color.split(' ')[0]} border-[#EFE9DF] text-[#756D64]`
                }`}
              >
                {diet.label}
              </button>
            ))}
          </div>

          {/* Quick Clear for both Wizard & Filters */}
          {(dietaryFilter !== 'All' || wizardAnswers.recipient || wizardAnswers.flavor || wizardAnswers.budget || searchQuery) && (
            <button
              id="clear-all-visual-filters-btn"
              onClick={() => {
                setDietaryFilter('All');
                setWizardAnswers({ recipient: null, flavor: null, budget: null });
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedFlavor('All');
              }}
              className="text-[10px] font-mono text-amber-700 font-bold hover:underline cursor-pointer ml-auto flex items-center gap-1"
            >
              🔄 Clear All Active Filters
            </button>
          )}
        </div>
      </div>

      {/* Wizard flash message */}
      <AnimatePresence>
        {wizardFlash && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <span>✨</span> {wizardFlash}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catalog Grid */}
      {filteredSweets.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#EFE9DF] rounded-xl space-y-4">
          <span className="text-2xl block">🍁</span>
          <p className="text-sm font-sans text-[#756D64]">No imperial sweets match your exact filters. Try broadening your selection.</p>
          <button 
            id="clear-filters-btn"
            onClick={() => { setSelectedCategory('All'); setSelectedFlavor('All'); setSearchQuery(''); }}
            className="text-xs text-[#C5A86D] underline font-medium hover:text-[#58181A]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div id="sweets-catalog-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSweets.map((sweet, idx) => (
            <motion.div
              id={`sweet-card-${sweet.id}`}
              key={sweet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06, ease: 'easeOut' }}
              whileHover={{ y: -8, boxShadow: '0 24px 60px rgba(88,24,26,0.14), 0 4px 20px rgba(197,168,109,0.18)' }}
              className="bg-white group rounded-xl overflow-hidden border border-[#EFE9DF] flex flex-col justify-between hover:border-[#C5A86D] transition-colors duration-300 luxury-shadow relative cursor-pointer"
            >
              {/* Popularity Badge */}
              {sweet.isPopular && (
                <div className="absolute top-3 left-3 bg-[#C5A86D] text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs z-10 font-mono tracking-wider uppercase">
                  <Sparkles className="w-2.5 h-2.5" /> Best Seller
                </div>
              )}

              {/* Audio Speaker Narration Trigger */}
              <button
                id={`speaker-btn-${sweet.id}`}
                onClick={() => handleSpeak(sweet)}
                className={`absolute top-3 right-11 p-1.5 rounded-full shadow-xs border transition-all z-10 cursor-pointer ${
                  speakingSweetId === sweet.id
                    ? 'bg-[#58181A] border-[#58181A] text-white animate-pulse'
                    : 'bg-white/95 backdrop-blur-xs border-[#EFE9DF] text-[#58181A] hover:bg-white'
                }`}
                title="Speak description and ingredients"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              {/* Heart Favorite Trigger */}
              <button
                id={`favorite-btn-${sweet.id}`}
                onClick={() => onToggleFavorite(sweet.id)}
                className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-xs rounded-full shadow-xs border border-[#EFE9DF] text-[#58181A] hover:bg-white z-10 transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${favorites.includes(sweet.id) ? 'fill-[#58181A]' : ''}`} />
              </button>

              {/* 4K Styled Photography Graphic */}
              <div 
                id={`sweet-image-trigger-${sweet.id}`}
                onClick={() => { setActiveItem(sweet); setQuickQty(1); }}
                className="h-44 overflow-hidden relative cursor-pointer"
              >
                <motion.img
                  src={sweet.imageUrl}
                  alt={sweet.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent flex items-end p-3"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <span className="text-[10px] text-white font-mono bg-[#58181A]/90 px-2.5 py-1 rounded backdrop-blur-xs">✦ Quick Inspect</span>
                </motion.div>
                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Sweet Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-[#C5A86D] uppercase">{sweet.category}</span>
                    <div className="flex items-center gap-2">
                      {speakingSweetId === sweet.id && (
                        <div className="flex items-center gap-0.5 h-3" title="Speaking description...">
                          <span className="w-0.5 bg-[#C5A86D] rounded-full animate-bounce" style={{ height: '60%', animationDelay: '0.1s', animationDuration: '0.6s' }} />
                          <span className="w-0.5 bg-[#C5A86D] rounded-full animate-bounce" style={{ height: '100%', animationDelay: '0.3s', animationDuration: '0.6s' }} />
                          <span className="w-0.5 bg-[#C5A86D] rounded-full animate-bounce" style={{ height: '40%', animationDelay: '0.5s', animationDuration: '0.6s' }} />
                        </div>
                      )}
                      <span className="text-xs font-mono text-[#756D64]">{sweet.weight}</span>
                    </div>
                  </div>

                  <h3 
                    id={`sweet-title-${sweet.id}`}
                    onClick={() => { setActiveItem(sweet); setQuickQty(1); }}
                    className="font-serif text-lg text-[#58181A] font-medium leading-snug cursor-pointer hover:text-[#C5A86D] transition-colors"
                  >
                    {sweet.name}
                  </h3>

                  <p className="text-xs text-[#756D64] line-clamp-2 leading-relaxed">
                    {sweet.description}
                  </p>

                  {/* Flavor tag pillbox */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {sweet.flavorProfile.slice(0, 2).map((flav, fIdx) => (
                      <span key={fIdx} className="text-[9px] bg-[#F9F6F0] border border-[#EFE9DF] text-[#58181A] px-2 py-0.5 rounded font-sans uppercase tracking-wider">
                        {flav}
                      </span>
                    ))}
                  </div>

                  {/* Visual Dietary Accessibility Badges */}
                  <div className="flex flex-wrap gap-1 pt-1.5 border-t border-[#EFE9DF]/50">
                    {sweet.category === 'Sugar-Free' ? (
                      <span className="text-[8px] sm:text-[9px] font-sans font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5" title="Diabetic-Safe / Zero added sugar">
                        🚫 Sugar-Free
                      </span>
                    ) : null}
                    {sweet.id === 'sweet-04' ? (
                      <span className="text-[8px] sm:text-[9px] font-sans font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5" title="Contains premium dry-fruits & walnuts">
                        🥜 Nuts
                      </span>
                    ) : (
                      <>
                        <span className="text-[8px] sm:text-[9px] font-sans font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5" title="Contains premium almonds/pistachios/cashews">
                          🥜 Nuts
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-sans font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-0.5" title="Contains organic cow milk solids">
                          🥛 Dairy
                        </span>
                      </>
                    )}
                    <span className="text-[8px] sm:text-[9px] font-sans font-bold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200 flex items-center gap-0.5" title="Naturally wheat-free ingredients">
                      🌾 Gluten-Free
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EFE9DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#A0988E] block">Price</span>
                    <span className="text-base font-mono font-semibold text-[#58181A]">₹{sweet.price}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <motion.button
                      id={`express-buy-btn-${sweet.id}`}
                      onClick={() => onExpressBuy(sweet)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.93 }}
                      className="bg-[#C5A86D] hover:bg-[#B39359] text-white text-xs font-medium px-3 py-2 rounded-md flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      title="1-Tap Express Buy"
                    >
                      <Zap className="w-3 h-3" /> Express
                    </motion.button>
                    <motion.button
                      id={`quick-add-btn-${sweet.id}`}
                      onClick={() => onAddToCart(sweet)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.93 }}
                      className="bg-[#58181A] hover:bg-[#421112] text-white text-xs font-medium px-3.5 py-2 rounded-md flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add +
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 4K Aesthetic Product Inspection Popup Modal (with Rich Smart Recommendation & Nutritional details) */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              id="sweet-detail-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#EFE9DF] relative max-h-[90vh] flex flex-col md:flex-row"
            >
              {/* Image side */}
              <div className="w-full md:w-5/12 h-64 md:h-auto relative">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent hidden md:block" />
                <span className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs text-[10px] font-mono text-[#58181A] px-3 py-1 rounded border border-[#EFE9DF]">
                  Chef's Premium Standard
                </span>
              </div>

              {/* Details side */}
              <div className="w-full md:w-7/12 p-6 md:p-8 overflow-y-auto space-y-6 max-h-[60vh] md:max-h-[80vh]">
                <button
                  id="close-modal-btn"
                  onClick={() => {
                    setActiveItem(null);
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                    setSpeakingSweetId(null);
                  }}
                  className="absolute top-4 right-4 text-[#A0988E] hover:text-[#58181A] font-sans text-xl font-semibold bg-[#F9F6F0] w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-[#EFE9DF] z-10 cursor-pointer"
                >
                  &times;
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#58181A] text-white px-2.5 py-0.5 rounded font-mono uppercase tracking-wider">
                      {activeItem.category}
                    </span>
                    <span className="text-xs text-[#C5A86D] flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-[#C5A86D]" /> {activeItem.rating} Rating
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-serif text-[#58181A] font-medium leading-snug">{activeItem.name}</h2>
                    <button
                      id={`modal-speak-btn-${activeItem.id}`}
                      onClick={() => handleSpeak(activeItem)}
                      className={`p-2 rounded-full shadow-xs border transition-all shrink-0 cursor-pointer ${
                        speakingSweetId === activeItem.id
                          ? 'bg-[#58181A] border-[#58181A] text-white animate-pulse'
                          : 'bg-[#F9F6F0] border-[#EFE9DF] text-[#58181A] hover:bg-white'
                      }`}
                      title="Speak details"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#756D64] leading-relaxed">{activeItem.description}</p>
                </div>

                {/* Ingredients & Flavors */}
                <div className="grid grid-cols-2 gap-4 bg-[#F9F6F0] p-4 rounded-lg border border-[#EFE9DF]">
                  <div>
                    <h4 className="text-[10px] font-mono text-[#C5A86D] uppercase tracking-widest mb-1.5">Gourmet Ingredients</h4>
                    <ul className="text-xs text-[#2C241E] space-y-1 list-disc list-inside">
                      {activeItem.ingredients.map((ing, idx) => (
                        <li key={idx} className="truncate">{ing}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono text-[#C5A86D] uppercase tracking-widest mb-1.5">Flavor Notes</h4>
                    <div className="flex flex-wrap gap-1">
                      {activeItem.flavorProfile.map((flav, idx) => (
                        <span key={idx} className="text-[9px] bg-white border border-[#EFE9DF] text-[#58181A] px-2 py-0.5 rounded uppercase font-medium">
                          {flav}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nutritional Accordion Box */}
                <div>
                  <h4 className="text-[10px] font-mono text-[#756D64] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#C5A86D]" /> Nutritional Metrics (per {activeItem.weight === "Pack of 4" ? "Unit" : "Serving"})
                  </h4>
                  <div className="grid grid-cols-5 text-center gap-1 bg-white border border-[#EFE9DF] rounded-md p-2">
                    <div className="border-r border-[#EFE9DF] last:border-0 py-1">
                      <span className="text-[9px] font-mono text-[#A0988E] block">Calories</span>
                      <span className="text-xs font-semibold text-[#58181A]">{activeItem.nutritionalDetails.calories}</span>
                    </div>
                    <div className="border-r border-[#EFE9DF] last:border-0 py-1">
                      <span className="text-[9px] font-mono text-[#A0988E] block">Protein</span>
                      <span className="text-xs font-semibold text-[#58181A]">{activeItem.nutritionalDetails.protein}</span>
                    </div>
                    <div className="border-r border-[#EFE9DF] last:border-0 py-1">
                      <span className="text-[9px] font-mono text-[#A0988E] block">Carbs</span>
                      <span className="text-xs font-semibold text-[#58181A]">{activeItem.nutritionalDetails.carbs}</span>
                    </div>
                    <div className="border-r border-[#EFE9DF] last:border-0 py-1">
                      <span className="text-[9px] font-mono text-[#A0988E] block">Fat</span>
                      <span className="text-xs font-semibold text-[#58181A]">{activeItem.nutritionalDetails.fat}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-[9px] font-mono text-[#A0988E] block">Added Sugar</span>
                      <span className={`text-xs font-semibold ${activeItem.nutritionalDetails.sugar === "0.0g" ? 'text-emerald-600' : 'text-[#58181A]'}`}>
                        {activeItem.nutritionalDetails.sugar}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Smart Complementary Flavor Recommendations Engine */}
                <div className="border-t border-[#EFE9DF] pt-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A86D]" />
                    <span className="text-xs font-serif text-[#58181A] font-semibold">Imperial Sommelier Suggessions (Pairings)</span>
                  </div>
                  <div className="bg-[#FDFBF7] border border-[#C5A86D]/40 rounded-lg p-3 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#2C241E] leading-snug">
                        Accent this with <strong className="text-[#58181A]">{activeItem.pairings.join(" & ")}</strong>
                      </p>
                      <p className="text-[10px] text-[#756D64]">Recommended to bind and elongate the decadent flavor profiles on your palate.</p>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-[#C5A86D] uppercase border border-[#C5A86D] bg-white px-2 py-1 rounded shrink-0">
                      Signature pairing
                    </span>
                  </div>
                </div>

                {/* Purchase Controls */}
                <div className="border-t border-[#EFE9DF] pt-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#A0988E] block">Estimated Cost</span>
                    <span className="text-xl font-mono font-bold text-[#58181A]">₹{activeItem.price * quickQty}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#EFE9DF] rounded-md overflow-hidden bg-white">
                      <button
                        id="qty-decrement-btn"
                        onClick={() => setQuickQty(prev => Math.max(1, prev - 1))}
                        className="px-2.5 py-1 text-[#58181A] font-bold hover:bg-[#F9F6F0]"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono text-xs text-[#2C241E]">{quickQty}</span>
                      <button
                        id="qty-increment-btn"
                        onClick={() => setQuickQty(prev => prev + 1)}
                        className="px-2.5 py-1 text-[#58181A] font-bold hover:bg-[#F9F6F0]"
                      >
                        +
                      </button>
                    </div>

                    <button
                      id="modal-express-buy-btn"
                      onClick={() => { onExpressBuy(activeItem); setActiveItem(null); }}
                      className="bg-[#C5A86D] hover:bg-[#B39359] text-white text-xs font-medium px-4 py-2.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      title="1-Tap Instant Order"
                    >
                      🚀 Express Order
                    </button>

                    <button
                      id="modal-add-to-cart-btn"
                      onClick={() => { onAddToCart(activeItem, quickQty); setActiveItem(null); }}
                      className="bg-[#58181A] hover:bg-[#421112] text-white text-xs font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Book Box
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
