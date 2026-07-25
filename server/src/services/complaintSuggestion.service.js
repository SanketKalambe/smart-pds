/**
 * Rule/Keyword based complaint classification and suggestion engine.
 * Supports fallback mode without any external LLM API key.
 */

const KEYWORD_RULES = [
  {
    category: 'Short Quantity / Under-weighing',
    keywords: ['less', 'short', 'weight', 'weighing', 'scale', 'kg missing', 'cheated', 'fewer', 'quantity'],
    resolution: 'We will inspect the distributor e-POS scale calibration logs and issue an immediate re-weigh audit for your allotment.'
  },
  {
    category: 'Poor Quality / Damaged Stock',
    keywords: ['quality', 'spoiled', 'rotten', 'insects', 'smell', 'dirty', 'bad', 'damaged', 'wet', 'stones'],
    resolution: 'Your complaint will be flagged for Quality Control inspection at the regional grain depot, and replacement stock will be issued.'
  },
  {
    category: 'Distributor Misconduct / Overcharging',
    keywords: ['bribe', 'extra money', 'overcharge', 'rude', 'behaviour', 'refused', 'closed', 'shop closed', 'denied', 'misconduct'],
    resolution: 'An immediate query has been sent to the Area Ration Officer to inspect shop operating hours and price charts.'
  },
  {
    category: 'Payment / Receipt Issue',
    keywords: ['payment', 'razorpay', 'upi', 'deducted', 'double charged', 'receipt', 'qr code', 'failed transaction'],
    resolution: 'Our payment reconciliation engine will cross-check the transaction reference with Razorpay and refund any duplicate charge within 24 hours.'
  },
  {
    category: 'Slot Booking & Biometric Issue',
    keywords: ['slot', 'booking', 'fingerprint', 'biometric', 'scanner', 'aadhaar mismatch', 'time slot'],
    resolution: 'We have logged the technical error. You may use OTP fallback verification or select an alternative open distribution slot.'
  }
];

const analyzeComplaintText = (description = '', subject = '') => {
  const text = `${subject} ${description}`.toLowerCase();
  
  let bestMatch = {
    category: 'General PDS Grievance',
    confidence: 0.5,
    resolution: 'Your complaint has been registered and forwarded to the District Supply Officer for investigation within 48 hours.'
  };

  let maxScore = 0;

  for (const rule of KEYWORD_RULES) {
    let score = 0;
    rule.keywords.forEach(kw => {
      if (text.includes(kw)) {
        score += 1;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = {
        category: rule.category,
        confidence: Math.min(0.95, 0.6 + score * 0.1),
        resolution: rule.resolution
      };
    }
  }

  return bestMatch;
};

module.exports = {
  analyzeComplaintText
};
