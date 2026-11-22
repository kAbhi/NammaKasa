import React, { useState, useRef, useEffect } from 'react';
import { Leaf, Send, RotateCcw, Recycle } from 'lucide-react';

const WASTE_KB = {
  // wet / organic
  'vegetable': { type: 'Wet Waste', bin: 'Green Bin', instructions: 'Rinse vegetable peels before discarding. Composting is preferred – great for home composting!', tips: 'Can be composted in 30–45 days.' },
  'food': { type: 'Wet Waste', bin: 'Green Bin', instructions: 'All cooked food scraps go in the Green Bin. Avoid mixing with plastic bags.', tips: 'Wet waste makes excellent vermicompost.' },
  'fruit': { type: 'Wet Waste', bin: 'Green Bin', instructions: 'Fruit peels and leftovers go in the Green Bin. Remove any stickers.', tips: 'Citrus peels can be dried and used as a room freshener!' },
  'leaves': { type: 'Wet Waste', bin: 'Green Bin', instructions: 'Garden leaves and plant waste go in the Green Bin.', tips: 'Dry leaves can be used for mulching.' },
  'egg': { type: 'Wet Waste', bin: 'Green Bin', instructions: 'Egg shells go in the Green Bin. Crush them for faster composting.', tips: 'Eggshells add calcium to compost.' },
  'tea': { type: 'Wet Waste', bin: 'Green Bin', instructions: 'Tea leaves and coffee grounds go in the Green Bin.', tips: 'Coffee grounds are excellent for composting and repel pests.' },
  'rice': { type: 'Wet Waste', bin: 'Green Bin', instructions: 'Cooked rice and grain leftovers go in the Green Bin.', tips: 'Avoid mixing with plastic – put in newspaper.' },

  // dry / recyclable
  'plastic': { type: 'Dry Waste', bin: 'Blue Bin', instructions: 'Rinse plastic bottles and containers before disposal. Flatten them to save space. Remove caps if different material.', tips: 'PET bottles (#1) and HDPE (#2) are most recyclable.' },
  'paper': { type: 'Dry Waste', bin: 'Blue Bin', instructions: 'Clean paper, cardboard, newspapers, and magazines go in the Blue Bin. Avoid wet or food-soiled paper.', tips: 'Shredded paper can also be composted.' },
  'glass': { type: 'Dry Waste', bin: 'Blue Bin', instructions: 'Glass bottles and jars go in the Blue Bin. Wrap broken glass in newspaper first for safety.', tips: 'Glass is 100% recyclable indefinitely.' },
  'metal': { type: 'Dry Waste', bin: 'Blue Bin', instructions: 'Tin cans, aluminium foil, and steel items go in the Blue Bin. Rinse food cans.', tips: 'Recycling aluminium saves 95% of the energy needed to make new aluminium.' },
  'cardboard': { type: 'Dry Waste', bin: 'Blue Bin', instructions: 'Flatten cardboard boxes and place in the Blue Bin. Remove any plastic tape first.', tips: 'Wet cardboard loses its recycling value – keep it dry.' },
  'newspaper': { type: 'Dry Waste', bin: 'Blue Bin', instructions: 'Bundle newspapers and magazines together for the Blue Bin.', tips: 'Old newspapers are great for lining compost bins.' },
  'bottle': { type: 'Dry Waste', bin: 'Blue Bin', instructions: 'Rinse all bottles (plastic, glass) and place in the Blue Bin.', tips: 'Remove lids – they may be a different plastic type.' },

  // hazardous
  'battery': { type: 'Hazardous Waste', bin: 'Red Bin / Collection Drive', instructions: 'Never put batteries in regular bins. Take them to BBMP e-waste collection points or battery drop-off at electronics stores.', tips: 'Batteries contain lead and acid that contaminate groundwater.' },
  'medicine': { type: 'Hazardous Waste', bin: 'Red Bin / Pharmacy Drop-off', instructions: 'Return unused medicines to pharmacies or BBMP hazardous waste drives. Never flush medicines.', tips: 'Flushed medicines contaminate water supply.' },
  'paint': { type: 'Hazardous Waste', bin: 'Hazardous Collection Drive', instructions: 'Allow paint to dry completely, then dispose at BBMP hazardous waste events. Never pour down drains.', tips: 'Water-based paints are less hazardous than oil-based paints.' },
  'bulb': { type: 'E-Waste', bin: 'E-Waste Collection Point', instructions: 'CFL and LED bulbs go to BBMP e-waste centres. Never crush them – they may contain mercury.', tips: 'Phonograph at 080-22660000 for nearest e-waste point.' },
  'tube light': { type: 'E-Waste', bin: 'E-Waste Collection Point', instructions: 'Tube lights (fluorescent) contain mercury. Take to designated e-waste centres.', tips: 'Never throw in regular garbage.' },

  // e-waste
  'phone': { type: 'E-Waste', bin: 'E-Waste Collection Point', instructions: 'Old mobiles go to BBMP e-waste centres or manufacturer take-back programmes. Wipe personal data first.', tips: 'Many manufacturers like Samsung, Apple accept old devices.' },
  'laptop': { type: 'E-Waste', bin: 'E-Waste Collection Point', instructions: 'Laptops and computers go to certified e-waste recyclers. Remove personal data before disposal.', tips: 'BBMP runs quarterly e-waste drives in Whitefield, Indiranagar, Koramangala.' },
  'charger': { type: 'E-Waste', bin: 'E-Waste Collection Point', instructions: 'Old chargers and cables go to e-waste collection points.', tips: 'Bundle cables together when disposing.' },
  'electronic': { type: 'E-Waste', bin: 'E-Waste Collection Point', instructions: 'All electronic waste should go to certified BBMP e-waste centres.', tips: 'Karnataka E-Waste Rules 2016 require proper disposal.' },

  // sanitary
  'diaper': { type: 'Sanitary Waste', bin: 'Wrap & dispose in Black Bag', instructions: 'Wrap in newspaper or black plastic bag and place separately for BBMP sanitary collection. Do NOT mix with other waste.', tips: 'Sanitary waste is collected separately on Saturdays in most wards.' },
  'sanitary pad': { type: 'Sanitary Waste', bin: 'Wrap & dispose in Black Bag', instructions: 'Wrap in black bag or newspaper and hand over to collector separately.', tips: 'Many apartments have incinerators for sanitary waste.' },
  'mask': { type: 'Sanitary Waste', bin: 'Wrap in plastic, then Dry Bin', instructions: 'Cut masks before disposal to prevent reuse. Wrap in plastic bag and place in dry waste bin.', tips: 'Reusable cloth masks can be washed and reused.' },

  // construction
  'brick': { type: 'Construction Debris', bin: 'BBMP Bulk Collection', instructions: 'Construction waste needs special BBMP bulk collection. Call 080-22660000 or the ward office.', tips: 'Never mix construction waste with household waste.' },
  'concrete': { type: 'Construction Debris', bin: 'BBMP Bulk Collection', instructions: 'Call BBMP for special construction waste pick-up.', tips: 'Construction waste is handled separately under BBMP\'s C&D rules.' },
};

const GREETINGS = [
  "What waste item would you like help sorting? I know Bengaluru's segregation rules! 🌱",
  "Ask me how to dispose of anything – batteries, food waste, e-waste, and more!",
  "Type a waste item (like 'plastic bottle', 'old phone', 'vegetable peels') and I'll tell you exactly where it goes.",
];

const QUICK_QUESTIONS = [
  'Plastic bottle', 'Vegetable peels', 'Old phone', 'Battery',
  'Newspaper', 'Diapers', 'Glass bottle', 'Medicine',
];

function findWasteInfo(query) {
  const q = query.toLowerCase().trim();
  for (const [key, val] of Object.entries(WASTE_KB)) {
    if (q.includes(key)) return { key, ...val };
  }
  return null;
}

function WasteResponseCard({ item, info }) {
  const binColors = {
    'Green Bin': 'border-green-400 bg-green-50',
    'Blue Bin': 'border-blue-400 bg-blue-50',
    'Red Bin / Collection Drive': 'border-red-400 bg-red-50',
    'Red Bin / Pharmacy Drop-off': 'border-red-400 bg-red-50',
    'Hazardous Collection Drive': 'border-red-400 bg-red-50',
    'E-Waste Collection Point': 'border-purple-400 bg-purple-50',
    'Wrap & dispose in Black Bag': 'border-gray-400 bg-gray-50',
    'Wrap in plastic, then Dry Bin': 'border-blue-400 bg-blue-50',
    'BBMP Bulk Collection': 'border-orange-400 bg-orange-50',
  };
  const colorCls = binColors[info.bin] || 'border-green-400 bg-green-50';

  return (
    <div className={`rounded-2xl border-2 p-4 ${colorCls}`}>
      <div className="flex items-center gap-2 mb-2">
        <Recycle size={16} className="text-green-700" />
        <span className="text-xs font-bold uppercase tracking-wide text-gray-600">{info.type}</span>
      </div>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-0.5">Goes in</p>
        <p className="text-lg font-bold text-gray-900">{info.bin}</p>
      </div>
      <p className="text-sm text-gray-700 mb-2">{info.instructions}</p>
      <div className="bg-white/70 rounded-xl p-2.5 mt-2">
        <p className="text-xs font-semibold text-gray-600">💡 Tip</p>
        <p className="text-xs text-gray-600 mt-0.5">{info.tips}</p>
      </div>
    </div>
  );
}

export default function WasteAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: GREETINGS[0] }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: userText };
    const info = findWasteInfo(userText);

    let botMsg;
    if (info) {
      botMsg = { id: Date.now() + 1, role: 'bot', text: `Here's how to dispose of **${userText}**:`, info };
    } else {
      botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: `I don't have specific info for "${userText}" yet. In Bengaluru, as a general rule:\n• Wet/organic waste → Green Bin\n• Dry recyclables (paper, plastic, metal) → Blue Bin\n• Hazardous & e-waste → BBMP collection drives\n\nTry asking about a specific item like "plastic", "battery", "food waste", etc.`,
      };
    }

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const reset = () => {
    setMessages([{ id: Date.now(), role: 'bot', text: GREETINGS[Math.floor(Math.random() * GREETINGS.length)] }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-96">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-xl">
            <Leaf size={18} className="text-green-700" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Waste Segregation Guide</p>
            <p className="text-xs text-gray-400">Bengaluru BBMP rules</p>
          </div>
        </div>
        <button onClick={reset} className="p-2 text-gray-400 hover:text-green-600 transition-colors">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Quick Questions */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="flex-shrink-0 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5 hover:bg-green-100 transition-colors font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' ? (
              <div className="max-w-[90%] space-y-2">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                  ))}
                </div>
                {msg.info && <WasteResponseCard info={msg.info} />}
              </div>
            ) : (
              <div className="bg-green-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%]">
                {msg.text}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <input
          type="text"
          className="input flex-1"
          placeholder="Ask about any waste item…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={() => sendMessage()}
          className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 transition-colors active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
