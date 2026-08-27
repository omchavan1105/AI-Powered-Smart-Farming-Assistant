/**
 * Treatment Options Lookup & Cost Optimizer — KrishiSetu
 *
 * Cost-tiered treatment suggestions keyed by the trained model's
 * disease class names (from training_results.json).
 *
 * Each entry provides three cost tiers:
 *   - branded:    Name-brand commercial product
 *   - generic:    Generic/unbranded equivalent
 *   - homeRemedy: Traditional/organic bio-control alternative
 *
 * Includes standard application dosage and safety precautions.
 * Prices are approximate benchmarks (₹ per standard application unit).
 */

const treatmentOptions = {
  'Tomato___Early_Blight': {
    dosage: '2.5g per litre of water (foliar spray)',
    safetyNote: 'Wear protective gloves and mask during spray. 7-day pre-harvest interval.',
    branded: {
      name: 'Mancozeb 75% WP (Dithane M-45)',
      approxCost: '₹250–350 per 500g',
      tier: 'Branded'
    },
    generic: {
      name: 'Generic Mancozeb 75% WP',
      approxCost: '₹120–180 per 500g',
      tier: 'Generic'
    },
    homeRemedy: {
      name: 'Neem seed kernel extract / Neem oil (5ml/L)',
      approxCost: '₹80–120 per 250ml',
      tier: 'Organic / Bio'
    }
  },

  'Tomato___Late_Blight': {
    dosage: '2.0g per litre of water (thorough leaf coverage)',
    safetyNote: 'Highly destructive disease. Treat immediately. Do not spray right before rainfall.',
    branded: {
      name: 'Metalaxyl 4% + Mancozeb 64% WP (Ridomil Gold)',
      approxCost: '₹450–600 per 250g',
      tier: 'Branded'
    },
    generic: {
      name: 'Generic Metalaxyl-M 4% + Mancozeb 64% WP',
      approxCost: '₹200–300 per 250g',
      tier: 'Generic'
    },
    homeRemedy: {
      name: 'Bordeaux mixture (1% — copper sulphate + hydrated lime)',
      approxCost: '₹60–100 per prep',
      tier: 'Organic / Bio'
    }
  },

  'Tomato___Bacterial_Spot': {
    dosage: '1g Streptocycline + 2.5g Copper Oxychloride in 10L water',
    safetyNote: 'Avoid handling wet plants to prevent bacterial spread across the field.',
    branded: {
      name: 'Streptocycline 9:1 + Copper Oxychloride 50% WP (Blitox)',
      approxCost: '₹300–450 per pack',
      tier: 'Branded'
    },
    generic: {
      name: 'Generic Copper Oxychloride 50% WP',
      approxCost: '₹150–220 per 500g',
      tier: 'Generic'
    },
    homeRemedy: {
      name: 'Baking soda spray (1 tsp per litre) + Horticultural soap',
      approxCost: '₹20–40 per prep',
      tier: 'Organic / Bio'
    }
  },

  'Potato___Early_Blight': {
    dosage: '2.5g per litre of water at 10-day intervals',
    safetyNote: 'Remove severely infected bottom leaves and destroy to prevent spore recurrence.',
    branded: {
      name: 'Mancozeb 75% WP (Dithane M-45)',
      approxCost: '₹250–350 per 500g',
      tier: 'Branded'
    },
    generic: {
      name: 'Generic Mancozeb 75% WP',
      approxCost: '₹120–180 per 500g',
      tier: 'Generic'
    },
    homeRemedy: {
      name: '5% Neem Seed Kernel Extract (NSKE)',
      approxCost: '₹80–120 per 250ml',
      tier: 'Organic / Bio'
    }
  },

  'Potato___Late_Blight': {
    dosage: '3g per litre of water at first sign of brown water-soaked lesions',
    safetyNote: 'Critical fungal threat. Ensure good ridge drainage and avoid sprinkler irrigation.',
    branded: {
      name: 'Cymoxanil 8% + Mancozeb 64% WP (Curzate M8)',
      approxCost: '₹500–700 per 300g',
      tier: 'Branded'
    },
    generic: {
      name: 'Generic Cymoxanil 8% + Mancozeb 64% WP',
      approxCost: '₹250–380 per 300g',
      tier: 'Generic'
    },
    homeRemedy: {
      name: 'Bordeaux mixture 1% neutral wash',
      approxCost: '₹60–100 per prep',
      tier: 'Organic / Bio'
    }
  },

  'Corn___Common_Rust': {
    dosage: '1ml per litre of water on upper foliage',
    safetyNote: 'Apply when rust pustules first appear on lower leaves. 14-day pre-harvest interval.',
    branded: {
      name: 'Propiconazole 25% EC (Tilt)',
      approxCost: '₹350–500 per 250ml',
      tier: 'Branded'
    },
    generic: {
      name: 'Generic Propiconazole 25% EC',
      approxCost: '₹180–280 per 250ml',
      tier: 'Generic'
    },
    homeRemedy: {
      name: 'Neem oil spray (5ml per litre) + Bio-fungicide Trichoderma',
      approxCost: '₹80–120 per 250ml',
      tier: 'Organic / Bio'
    }
  }
};

export default treatmentOptions;
