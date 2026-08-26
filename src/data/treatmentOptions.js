/**
 * Treatment Options Lookup — KrishiSetu
 *
 * Cost-tiered treatment suggestions keyed by the trained model's
 * disease class names (from training_results.json).
 *
 * Each entry provides three cost tiers:
 *   - branded:   Name-brand commercial product
 *   - generic:   Generic/unbranded equivalent
 *   - homeRemedy: Traditional/organic alternative
 *
 * Prices are approximate ₹ per standard application quantity and
 * are for informational reference only.
 *
 * IMPORTANT: Only diseases from the model's class list are included.
 * Healthy classes (Tomato___Healthy, Potato___Healthy, Corn___Healthy)
 * are intentionally excluded — they don't need treatment.
 */

const treatmentOptions = {
  'Tomato___Early_Blight': {
    branded: {
      name: 'Mancozeb 75% WP (Dithane M-45)',
      approxCost: '₹250–350 per 500g'
    },
    generic: {
      name: 'Generic Mancozeb 75% WP',
      approxCost: '₹120–180 per 500g'
    },
    homeRemedy: {
      name: 'Neem oil spray (5ml per litre of water)',
      approxCost: '₹80–120 per 250ml bottle'
    }
  },

  'Tomato___Late_Blight': {
    branded: {
      name: 'Metalaxyl 4% + Mancozeb 64% WP (Ridomil Gold)',
      approxCost: '₹450–600 per 250g'
    },
    generic: {
      name: 'Generic Metalaxyl-M 4% + Mancozeb 64% WP',
      approxCost: '₹200–300 per 250g'
    },
    homeRemedy: {
      name: 'Bordeaux mixture (1% — copper sulphate + lime)',
      approxCost: '₹60–100 per preparation'
    }
  },

  'Tomato___Bacterial_Spot': {
    branded: {
      name: 'Streptocycline 9:1 + Copper Oxychloride 50% WP (Blitox)',
      approxCost: '₹300–450 per pack'
    },
    generic: {
      name: 'Generic Copper Oxychloride 50% WP',
      approxCost: '₹150–220 per 500g'
    },
    homeRemedy: {
      name: 'Baking soda spray (1 tsp per litre of water)',
      approxCost: '₹20–40 per application'
    }
  },

  'Potato___Early_Blight': {
    branded: {
      name: 'Mancozeb 75% WP (Dithane M-45)',
      approxCost: '₹250–350 per 500g'
    },
    generic: {
      name: 'Generic Mancozeb 75% WP',
      approxCost: '₹120–180 per 500g'
    },
    homeRemedy: {
      name: 'Neem oil spray (5ml per litre of water)',
      approxCost: '₹80–120 per 250ml bottle'
    }
  },

  'Potato___Late_Blight': {
    branded: {
      name: 'Cymoxanil 8% + Mancozeb 64% WP (Curzate M8)',
      approxCost: '₹500–700 per 300g'
    },
    generic: {
      name: 'Generic Cymoxanil 8% + Mancozeb 64% WP',
      approxCost: '₹250–380 per 300g'
    },
    homeRemedy: {
      name: 'Bordeaux mixture (1% — copper sulphate + lime)',
      approxCost: '₹60–100 per preparation'
    }
  },

  'Corn___Common_Rust': {
    branded: {
      name: 'Propiconazole 25% EC (Tilt)',
      approxCost: '₹350–500 per 250ml'
    },
    generic: {
      name: 'Generic Propiconazole 25% EC',
      approxCost: '₹180–280 per 250ml'
    },
    homeRemedy: {
      name: 'Neem oil spray (5ml per litre of water)',
      approxCost: '₹80–120 per 250ml bottle'
    }
  }
};

export default treatmentOptions;
