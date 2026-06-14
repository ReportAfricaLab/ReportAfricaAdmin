export interface Course {
  id: string;
  title: string;
  description: string;
  usdPrice: number;
  lessons: { title: string; videoUrl: string; duration: string }[];
  icon: string;
}

export const COURSES: Course[] = [
  {
    id: 'mojo-basics',
    title: 'Mobile Journalism (MoJo) Basics',
    description: 'Learn to capture, edit, and publish professional news content using just your smartphone.',
    usdPrice: 13,
    icon: '📱',
    lessons: [
      { title: 'Introduction to Mobile Journalism', videoUrl: '', duration: '12 min' },
      { title: 'Camera Techniques & Framing', videoUrl: '', duration: '18 min' },
      { title: 'Audio Recording in the Field', videoUrl: '', duration: '15 min' },
      { title: 'Editing on Your Phone', videoUrl: '', duration: '20 min' },
      { title: 'Publishing & Distribution', videoUrl: '', duration: '10 min' },
    ],
  },
  {
    id: 'safety-legal',
    title: 'Safety Reporting & Legal Rights',
    description: 'Understand your legal rights as a citizen journalist and how to stay safe while reporting.',
    usdPrice: 17,
    icon: '⚖️',
    lessons: [
      { title: 'Your Rights as a Citizen Reporter', videoUrl: '', duration: '15 min' },
      { title: 'Reporting in Dangerous Situations', videoUrl: '', duration: '20 min' },
      { title: 'Digital Safety & Anonymity', videoUrl: '', duration: '18 min' },
      { title: 'Dealing with Authorities', videoUrl: '', duration: '12 min' },
      { title: 'Legal Consequences of False Reporting', videoUrl: '', duration: '10 min' },
    ],
  },
  {
    id: 'video-verification',
    title: 'Video Verification & Fact-Checking',
    description: 'Master the art of verifying claims, detecting deepfakes, and ensuring report accuracy.',
    usdPrice: 23,
    icon: '🔍',
    lessons: [
      { title: 'Principles of Verification', videoUrl: '', duration: '14 min' },
      { title: 'Reverse Image & Video Search', videoUrl: '', duration: '18 min' },
      { title: 'Detecting Manipulated Media', videoUrl: '', duration: '22 min' },
      { title: 'Cross-Referencing Sources', videoUrl: '', duration: '16 min' },
      { title: 'Building a Verification Workflow', videoUrl: '', duration: '12 min' },
    ],
  },
  {
    id: 'live-reporting',
    title: 'Professional Live Reporting Masterclass',
    description: 'Go live with confidence. Learn broadcast techniques, audience engagement, and monetization.',
    usdPrice: 33,
    icon: '🔴',
    lessons: [
      { title: 'Live Reporting Fundamentals', videoUrl: '', duration: '15 min' },
      { title: 'Equipment & Setup', videoUrl: '', duration: '12 min' },
      { title: 'Engaging Your Audience Live', videoUrl: '', duration: '18 min' },
      { title: 'Handling Breaking News on Air', videoUrl: '', duration: '20 min' },
      { title: 'Monetizing Your Live Content', videoUrl: '', duration: '14 min' },
      { title: 'Post-Stream: Replays & Highlights', videoUrl: '', duration: '10 min' },
    ],
  },
];

export const BUNDLE_USD_PRICE = 50;

const CURRENCY_RATES: Record<string, number> = {
  NGN: 1500, GHS: 14, KES: 150, ZAR: 18, UGX: 3700, RWF: 1300,
  TZS: 2600, ETB: 57, XOF: 600, XAF: 600, EGP: 48, MAD: 10, USD: 1,
};

const COUNTRY_CURRENCY: Record<string, string> = {
  NG: 'NGN', GH: 'GHS', KE: 'KES', ZA: 'ZAR', UG: 'UGX', RW: 'RWF',
  TZ: 'TZS', ET: 'ETB', SN: 'XOF', CM: 'XAF', EG: 'EGP', MA: 'MAD',
};

export function getCurrency(country: string) { return COUNTRY_CURRENCY[country] || 'USD'; }
export function getRate(currency: string) { return CURRENCY_RATES[currency] || 1; }
export function getLocalPrice(usd: number, country: string) {
  const currency = getCurrency(country);
  return { price: Math.round(usd * getRate(currency)), currency };
}
