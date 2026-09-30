import type { PricingGroup, PricingGroupId } from "./schemas";

export const pricing: PricingGroup[] = [
  {
    id: "amazon",
    label: "Amazon",
    intro: "Comprehensive Amazon account management and optimization services to maximize your sales and growth.",
    tiers: [
      { name: "Basic Support", price: "$500/mo", priceNote: "10 Hours/Week", highlighted: false,
        features: ["Basic Support & Account Management", "Account Health Review", "Up to 5 Listing Content Optimization", "Issue Resolution with Support", "Account Activity Summary"] },
      { name: "Advanced Support", price: "$889/mo", priceNote: "20 Hours/Week", highlighted: true,
        features: ["Up to 31 Listings Optimization", "Keywords Research & Strategy", "Design Uploading (Up to 5 Listings)", "A/B Testing & Listing Performance Review", "Weekly Account Performance Review"] },
      { name: "Professional Support", price: "$1,485/mo", priceNote: "40 Hours/Week", highlighted: false,
        features: ["Up to 31 Listings Complete Management", "Premium A+ Content Creation", "Advanced Video Uploading & Optimization", "Customer Returns Management & Review Response", "Dedicated Account Manager"] },
      { name: "Custom", price: "Custom", priceNote: "Custom Quote", highlighted: false,
        features: ["Fully Customized Account Strategy", "Custom Budget Management", "Advanced PPC Management", "Inventory & Branding Optimization", "Dedicated Support Team"] },
    ],
  },
  {
    id: "meta-ads",
    label: "Meta Ads",
    intro: "Professional Facebook & Instagram advertising to grow your brand and drive conversions.",
    tiers: [
      { name: "Starter", price: "$449/mo", priceNote: "Up to 3 campaigns", highlighted: false,
        features: ["Campaign Setup & Management", "Up to 3 campaigns", "Traffic, Engagement, Conversions", "Basic Image Ad Design", "Basic account support"] },
      { name: "Growth", price: "$749/mo", priceNote: "Up to 5 campaigns", highlighted: true,
        features: ["Up to 5 campaigns", "All Placements (Traffic, Engagement, Conversions, Sales)", "Carousel, Video & Design Ads", "Up to 5 A/B designs/month", "Weekly strategy reviews"] },
      { name: "Enterprise", price: "$1,199/mo", priceNote: "Ad Spend Management", highlighted: false,
        features: ["Unlimited campaigns", "All Placements (Traffic, Engagement, Conversions, Sales, Video)", "Advanced Retargeting Strategy", "Dedicated account manager", "Custom reporting dashboards"] },
      { name: "Custom", price: "Custom", priceNote: "Custom Quote", highlighted: false,
        features: ["Fully Customized Ad Strategy", "Custom Budget Management", "Dedicated Creative Team", "Real-time Performance Monitoring", "Dedicated Account Manager"] },
    ],
  },
  {
    id: "google-ads",
    label: "Google Ads",
    intro: "Professional Google Ads campaign management to maximize your ROI and drive quality leads.",
    tiers: [
      { name: "Starter", price: "$349/mo", priceNote: "Up to $1,000/month ad spend", highlighted: false,
        features: ["Campaign Setup & Management", "Monthly Ad Spend Management", "Active Campaigns Management", "Basic Keyword Research", "Performance Reports"] },
      { name: "Growth", price: "$699/mo", priceNote: "Up to $5,000/month ad spend", highlighted: true,
        features: ["Up to 5 Active Campaigns", "All Campaign Types (Search, Display, Shopping)", "Competitor Analysis & Keyword Research", "A/B Testing & Optimization", "Weekly Performance Reviews"] },
      { name: "Enterprise", price: "$998/mo", priceNote: "Unlimited ad spend management", highlighted: false,
        features: ["Unlimited Campaigns Management", "All Placements (Search, Display, Shopping, Video)", "Advanced Bidding Strategies", "Conversion Tracking & Google Analytics Integration", "Dedicated Account Manager"] },
      { name: "Custom", price: "Custom", priceNote: "Custom Quote", highlighted: false,
        features: ["Fully Customized Campaign Strategy", "Custom Budget Management", "Multi-Channel Campaign Integration", "Real-time Performance Optimization", "Dedicated Support Team"] },
    ],
  },
  {
    id: "email-marketing",
    label: "Email Marketing",
    intro: "Powerful email marketing campaigns to nurture leads, drive sales, and build customer loyalty.",
    tiers: [
      { name: "Starter", price: "$749/mo", priceNote: "Up to 5,000 subscribers", highlighted: false,
        features: ["Email Campaign Setup & Management", "Up to 2 campaigns/month", "Basic Email Template Design", "List Segmentation & Automation", "Monthly Performance Reports"] },
      { name: "Growth", price: "$1,199/mo", priceNote: "Up to 25,000 subscribers", highlighted: true,
        features: ["Up to 8 campaigns/month", "Advanced Email Template Design", "A/B Testing & Optimization", "Advanced Automation Workflows", "Weekly Account Performance Review"] },
      { name: "Professional", price: "$1,799/mo", priceNote: "Unlimited subscribers", highlighted: false,
        features: ["Unlimited Campaigns", "Custom Email Template Design", "Advanced Segmentation & Personalization", "Dedicated Email Specialist", "Real-time Performance Monitoring"] },
      { name: "Custom", price: "Custom", priceNote: "Custom Quote", highlighted: false,
        features: ["Fully Customized Email Strategy", "Advanced Automation & Integration", "Custom Workflow Development", "List Management & Growth Strategy", "Dedicated Account Manager"] },
    ],
  },
  {
    id: "seo",
    label: "SEO",
    intro: "Comprehensive SEO services to improve your search rankings and drive organic traffic to your website.",
    tiers: [
      { name: "Silver", price: "$700/mo", priceNote: "Essential SEO", highlighted: false,
        features: ["Initial Analysis & Keywords Analysis", "Content Analysis & Optimization", "Basic Technical SEO Audit", "On-Page Optimization (Title, Meta, Headers)", "Monthly Performance Tracking"] },
      { name: "Gold", price: "$1,500/mo", priceNote: "Advanced SEO", highlighted: true,
        features: ["Complete SEO Audit & Keyword Research", "Competitor Analysis & Website Structure Analysis", "Advanced Technical Optimization", "On-Page & Off-Page Optimization", "Local Listings & Monthly Reports"] },
      { name: "Platinum", price: "$2,800/mo", priceNote: "Premium SEO", highlighted: false,
        features: ["Comprehensive SEO Strategy & Analysis", "Competitor's Content & Backlinks Analysis", "Full Technical & On-Page Optimization", "Link Building & Social Bookmarking", "Advanced Analytics & Detailed Reports"] },
      { name: "Custom", price: "Custom", priceNote: "Custom Quote", highlighted: false,
        features: ["Customized SEO Strategy", "Advanced Competitor Intelligence", "Technical SEO Implementation", "Content Strategy & Creation", "Dedicated SEO Specialist"] },
    ],
  },
];

export const getPricing = (id: PricingGroupId): PricingGroup => {
  const g = pricing.find((p) => p.id === id);
  if (!g) throw new Error(`Unknown pricing group ${id}`);
  return g;
};
