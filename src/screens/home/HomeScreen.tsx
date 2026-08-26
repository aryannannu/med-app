// Force Metro cache refresh: 22:33
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { FloatingCart } from '../../components/common/FloatingCart';
import { MedicineCard } from '../../components/cards/MedicineCard';
import { VariantSelectionModal } from '../../components/modals/VariantSelectionModal';
import { QuantitySelector } from '../../components/controls/QuantitySelector';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Ionicons } from '@expo/vector-icons';
import { MedicineService } from '../../services/medicineService';
import { PharmacyService } from '../../services/pharmacyService';
import { Medicine } from '../../types/medicine';
import { Pharmacy } from '../../types/pharmacy';
import { useCart } from '../../store/CartContext';
import { useAddress } from '../../store/AddressContext';
import { useOrders } from '../../store/OrderContext';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import { useTabBarScroll } from '../../store/TabBarScrollContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import { formatDistance, formatDeliveryTime } from '../../utils/formatters';
import { haptics } from '../../services/hapticService';

type DiscoveryMode = 'medicines' | 'stores';

const QUICK_FILTER_TABS = [
  { id: 'all', name: 'All', icon: 'bandage', activeIcon: 'bandage', slug: 'all', title: 'Featured Medicines', subtitle: 'Explore top healthcare essentials' },
  { id: 'pain', name: 'Pain Relief', icon: 'fitness-outline', activeIcon: 'fitness', slug: 'pain-relief', title: 'Pain Relief', subtitle: 'Fast relief from pain, fever & body ache' },
  { id: 'cold', name: 'Cold & Flu', icon: 'thermometer-outline', activeIcon: 'thermometer', slug: 'cold-flu', title: 'Cold & Flu Care', subtitle: 'Relief from cough, cold & fever' },
  { id: 'diabetes', name: 'Diabetes Care', icon: 'water-outline', activeIcon: 'water', slug: 'diabetes', title: 'Diabetes Care', subtitle: 'Blood sugar care & glucose monitors' },
  { id: 'vitamins', name: 'Vitamins', icon: 'sunny-outline', activeIcon: 'sunny', slug: 'vitamins', title: 'Vitamins & Immunity', subtitle: 'Immunity & daily wellness boost' },
  { id: 'digestive', name: 'Digestive Care', icon: 'heart-outline', activeIcon: 'heart', slug: 'digestive', title: 'Digestive Care', subtitle: 'Acidity, gas & digestion support' },
  { id: 'skin', name: 'Skin Care', icon: 'sparkles-outline', activeIcon: 'sparkles', slug: 'skin', title: 'Skin Care', subtitle: 'Ointments, gels & dermatology' },
  { id: 'baby', name: 'Baby Care', icon: 'happy-outline', activeIcon: 'happy', slug: 'baby', title: 'Baby Care', subtitle: 'Gentle baby essential products' },
  { id: 'ayurvedic', name: 'Ayurvedic', icon: 'leaf-outline', activeIcon: 'leaf', slug: 'ayurveda', title: 'Ayurvedic', subtitle: '100% natural & herbal remedies' },
];

const EXACT_PRODUCT_CATEGORIES = [
  {
    id: 'pain-sprays',
    title: 'Pain Relief\nSprays',
    badgeText: 'Pain Relief\nSprays',
    borderColor: '#C084FC',
    badgeBg: '#F3E8FF',
    badgeTextCol: '#7E22CE',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    slug: 'pain-relief',
  },
  {
    id: 'anti',
    title: 'Antibiotics &\nAntivirals',
    badgeText: 'Antibiotics &\nAntivirals',
    borderColor: '#FCD34D',
    badgeBg: '#FEF3C7',
    badgeTextCol: '#B45309',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80',
    slug: 'pain-relief',
  },
  {
    id: 'sugar',
    title: 'Sugar\nPatient',
    badgeText: 'Sugar\nPatient',
    borderColor: '#FDBA74',
    badgeBg: '#FFEDD5',
    badgeTextCol: '#C2410C',
    image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=400&q=80',
    slug: 'diabetes',
  },
  {
    id: 'herbal',
    title: 'Herbal\nMedicine',
    badgeText: 'Herbal\nMedicine',
    borderColor: '#6EE7B7',
    badgeBg: '#D1FAE5',
    badgeTextCol: '#047857',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80',
    slug: 'ayurveda',
  },
];

const HEALTH_NEEDS = [
  { id: 'fever', name: 'Fever & Flu', icon: 'thermometer-outline', bg: '#F3E8FF', color: '#7C3AED', slug: 'pain-relief' },
  { id: 'headache', name: 'Headache', icon: 'pulse-outline', bg: '#EFF6FF', color: '#2563EB', slug: 'pain-relief' },
  { id: 'acidity', name: 'Acidity & Gas', icon: 'flame-outline', bg: '#FEE2E2', color: '#DC2626', slug: 'digestive' },
  { id: 'cough', name: 'Cough & Throat', icon: 'medkit-outline', bg: '#ECFDF5', color: '#059669', slug: 'cold-flu' },
  { id: 'bodypain', name: 'Body Pain', icon: 'fitness-outline', bg: '#FEF3C7', color: '#D97706', slug: 'pain-relief' },
  { id: 'diabetes', name: 'Diabetes Care', icon: 'water-outline', bg: '#FDF2F8', color: '#DB2777', slug: 'diabetes' },
  { id: 'bones', name: 'Bone & Joints', icon: 'body-outline', bg: '#ECFEFF', color: '#0891B2', slug: 'vitamins' },
  { id: 'bp', name: 'Blood Pressure', icon: 'heart-outline', bg: '#DCFCE7', color: '#166534', slug: 'heart-bp' },
];

const SHOP_BY_CATEGORIES = [
  { id: 'pain', name: 'Pain Relief', icon: 'fitness-outline', color: '#7C3AED', bg: '#F5F5F8', slug: 'pain-relief', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80' },
  { id: 'diabetes', name: 'Diabetes Care', icon: 'water-outline', color: '#D97706', bg: '#F5F5F8', slug: 'diabetes', image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=200&q=80' },
  { id: 'vitamins', name: 'Vitamins', icon: 'sunny-outline', color: '#059669', bg: '#F5F5F8', slug: 'vitamins', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&q=80' },
  { id: 'immunity', name: 'Immunity', icon: 'shield-checkmark-outline', color: '#2563EB', bg: '#F5F5F8', slug: 'vitamins', image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=200&q=80' },
  { id: 'baby', name: 'Baby Care', icon: 'happy-outline', color: '#0891B2', bg: '#F5F5F8', slug: 'baby', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80' },
  { id: 'firstaid', name: 'First Aid', icon: 'medkit-outline', color: '#DC2626', bg: '#F5F5F8', slug: 'pain-relief', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200&q=80' },
  { id: 'cold', name: 'Cold & Cough', icon: 'thermometer-outline', color: '#2563EB', bg: '#F5F5F8', slug: 'cold-flu', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&q=80' },
  { id: 'digestive', name: 'Digestive Care', icon: 'heart-outline', color: '#DC2626', bg: '#F5F5F8', slug: 'digestive', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80' },
  { id: 'skin', name: 'Skin Care', icon: 'sparkles-outline', color: '#DB2777', bg: '#F5F5F8', slug: 'skin', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80' },
  { id: 'womens', name: "Women's Health", icon: 'female-outline', color: '#EC4899', bg: '#F5F5F8', slug: 'vitamins', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=200&q=80' },
  { id: 'devices', name: 'Health Devices', icon: 'pulse-outline', color: '#0D9488', bg: '#F5F5F8', slug: 'vitamins', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&q=80' },
  { id: 'ayurveda', name: 'Ayurvedic', icon: 'leaf-outline', color: '#166534', bg: '#F5F5F8', slug: 'ayurveda', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80' },
];

const CATEGORIES = [
  { id: 'pain', name: 'Pain Relief', icon: 'fitness-outline', color: '#7C3AED', bg: '#F3E8FF', slug: 'pain-relief' },
  { id: 'cold', name: 'Cold & Flu', icon: 'thermometer-outline', color: '#2563EB', bg: '#EFF6FF', slug: 'cold-flu' },
  { id: 'diabetes', name: 'Diabetes Care', icon: 'water-outline', color: '#D97706', bg: '#FEF3C7', slug: 'diabetes' },
  { id: 'vitamins', name: 'Vitamins', icon: 'sunny-outline', color: '#059669', bg: '#ECFDF5', slug: 'vitamins' },
  { id: 'digestive', name: 'Digestive Care', icon: 'heart-outline', color: '#DC2626', bg: '#FEE2E2', slug: 'digestive' },
  { id: 'skin', name: 'Skin Care', icon: 'sparkles-outline', color: '#DB2777', bg: '#FDF2F8', slug: 'skin' },
  { id: 'baby', name: 'Baby Care', icon: 'happy-outline', color: '#0891B2', bg: '#ECFEFF', slug: 'baby' },
  { id: 'ayurveda', name: 'Ayurvedic', icon: 'leaf-outline', color: '#166534', bg: '#DCFCE7', slug: 'ayurveda' },
];

const STORE_CATEGORIES = [
  { id: 'allopath', name: 'Allopathic Pharmacies', icon: 'medical-outline', color: '#2563EB', count: '18 stores' },
  { id: 'ayur_store', name: 'Ayurvedic Kendras', icon: 'leaf-outline', color: '#166534', count: '9 stores' },
  { id: 'surgical', name: 'Surgical & Ortho', icon: 'bandage-outline', color: '#D97706', count: '6 stores' },
  { id: 'baby_store', name: 'Mother & Baby Care', icon: 'happy-outline', color: '#DB2777', count: '12 stores' },
];

const STORE_DEALS = [
  {
    id: 'deal-1',
    pharmacyName: 'Sharma Medical Store',
    title: 'Flat 15% OFF on Chronic Medicines',
    badge: '15% OFF',
    pharmacyId: 'pharm-1',
    bg: '#ECE8F7',
    color: '#3A2986',
  },
  {
    id: 'deal-2',
    pharmacyName: 'Apollo Pharmacy 24x7',
    title: 'Free Delivery on Orders Above â‚¹199',
    badge: 'FREE DELIVERY',
    pharmacyId: 'pharm-2',
    bg: '#CCFBF1',
    color: '#0D9488',
  },
  {
    id: 'deal-3',
    pharmacyName: 'MedPlus Chemists',
    title: 'Flat 20% OFF on Baby & Skin Care',
    badge: '20% OFF',
    pharmacyId: 'pharm-3',
    bg: '#FEF3C7',
    color: '#D97706',
  },
];

const MEDICINE_TYPES = [
  { id: 'tab', name: 'Tablets & Capsules', icon: 'tablet-portrait-outline', count: '450+ meds' },
  { id: 'syr', name: 'Syrups & Liquids', icon: 'beaker-outline', count: '180+ meds' },
  { id: 'gel', name: 'Ointments & Gels', icon: 'color-fill-outline', count: '120+ meds' },
  { id: 'drop', name: 'Drops & Sprays', icon: 'water-outline', count: '90+ meds' },
  { id: 'pow', name: 'Powders & Sachets', icon: 'cube-outline', count: '65+ meds' },
];

const TOP_BRANDS = [
  {
    id: 'cipla',
    name: 'Cipla',
    brandQuery: 'Cipla',
    count: '85+ Products',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cipla_logo.svg/512px-Cipla_logo.svg.png',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cipla_logo.svg/512px-Cipla_logo.svg.png',
    bg: '#2C1D54',
    hasHeart: false,
  },
  {
    id: 'sun',
    name: 'Sun Pharma',
    brandQuery: 'Sun Pharma',
    count: '110+ Products',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Sun_Pharma_logo.svg/512px-Sun_Pharma_logo.svg.png',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Sun_Pharma_logo.svg/512px-Sun_Pharma_logo.svg.png',
    bg: '#4A2810',
    hasHeart: false,
  },
  {
    id: 'abbott',
    name: 'Abbott',
    brandQuery: 'Abbott',
    count: '95+ Products',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Abbott_Laboratories_logo.svg/512px-Abbott_Laboratories_logo.svg.png',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Abbott_Laboratories_logo.svg/512px-Abbott_Laboratories_logo.svg.png',
    bg: '#0F2C4A',
    hasHeart: true,
  },
  {
    id: 'drreddy',
    name: "Dr. Reddy's",
    brandQuery: "Dr. Reddy",
    count: '75+ Products',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Dr._Reddy%27s_Laboratories_logo.svg/512px-Dr._Reddy%27s_Laboratories_logo.svg.png',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Dr._Reddy%27s_Laboratories_logo.svg/512px-Dr._Reddy%27s_Laboratories_logo.svg.png',
    bg: '#4C1026',
    hasHeart: true,
  },
  {
    id: 'mankind',
    name: 'Mankind',
    brandQuery: 'Mankind',
    count: '90+ Products',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mankind_Pharma_Logo.svg/512px-Mankind_Pharma_Logo.svg.png',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mankind_Pharma_Logo.svg/512px-Mankind_Pharma_Logo.svg.png',
    bg: '#1E293B',
    hasHeart: false,
  },
  {
    id: 'himalaya',
    name: 'Himalaya',
    brandQuery: 'Himalaya',
    count: '65+ Products',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/The_Himalaya_Drug_Company_logo.svg/512px-The_Himalaya_Drug_Company_logo.svg.png',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/The_Himalaya_Drug_Company_logo.svg/512px-The_Himalaya_Drug_Company_logo.svg.png',
    bg: '#0E3A2F',
    hasHeart: true,
  },
  {
    id: 'gsk',
    name: 'GSK',
    brandQuery: 'GSK',
    count: '70+ Products',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/GlaxoSmithKline_logo.svg/512px-GlaxoSmithKline_logo.svg.png',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/GlaxoSmithKline_logo.svg/512px-GlaxoSmithKline_logo.svg.png',
    bg: '#312E81',
    hasHeart: true,
  },
];

const TOP_COMPOSITIONS = [
  { id: 'c1', name: 'Paracetamol (650mg)', count: '14 Brands available', uses: 'Fever & Pain' },
  { id: 'c2', name: 'Pantoprazole (40mg)', count: '8 Brands available', uses: 'Acidity & Gas' },
  { id: 'c3', name: 'Amoxicillin + Clavulanic Acid', count: '6 Brands available', uses: 'Bacterial Infections' },
  { id: 'c4', name: 'Calcium (500mg) + Vitamin D3', count: '10 Brands available', uses: 'Bone & Joints' },
  { id: 'c5', name: 'Cetirizine Hydrochloride (10mg)', count: '12 Brands available', uses: 'Allergy & Cold' },
];

const PROMO_OFFERS = [
  // BANNER 01 — DISCOUNT / SAVINGS
  {
    id: 'banner_savings',
    type: 'savings',
    tag: 'LIMITED OFFER',
    title: 'Save More on Healthcare Essentials',
    subtitle: 'Exclusive savings on medicines, wellness & personal care',
    cta: 'Shop Offers',
    badgeText: 'UP TO\n25% OFF',
    bgColors: ['#2E1065', '#3B0764', '#4C1D95'] as [string, string, string],
    textColor: '#FFFFFF',
    subColor: '#E9D5FF',
    btnBg: '#FFFFFF',
    btnColor: '#3A2986',
    badgeBoxBg: '#6D28D9',
    badgeBoxText: '#FFFFFF',
    tagBg: 'rgba(255, 255, 255, 0.18)',
    tagColor: '#FFFFFF',
    targetScreen: 'Search',
    targetParams: { initialQuery: 'medicine discount' },
    iconName: 'pricetag',
  },

  // BANNER 02 — PRESCRIPTION UPLOAD
  {
    id: 'banner_rx_upload',
    type: 'rx_upload',
    tag: 'EASY ORDERING',
    title: 'Have a Prescription?',
    subtitle: 'Upload it and let us help you order your medicines',
    cta: 'Upload Prescription',
    processCue: 'Rx → Review → Delivery',
    bgColors: ['#064E3B', '#047857', '#059669'] as [string, string, string],
    textColor: '#FFFFFF',
    subColor: '#A7F3D0',
    btnBg: '#FFFFFF',
    btnColor: '#047857',
    badgeBoxBg: '#047857',
    badgeBoxText: '#FFFFFF',
    tagBg: 'rgba(255, 255, 255, 0.2)',
    tagColor: '#FFFFFF',
    targetScreen: 'UploadPrescription',
    targetParams: { fromCart: false },
    iconName: 'document-text',
  },

  // BANNER 03 — MEDICINE REFILL
  {
    id: 'banner_refill',
    type: 'refill',
    tag: 'EASY REORDER',
    title: 'Running Low on Your Medicines?',
    subtitle: 'Refill your regular medicines before you run out',
    cta: 'Refill Now',
    badgeText: 'REFILL\nCARE',
    bgColors: ['#1E1B4B', '#312E81', '#4338CA'] as [string, string, string],
    textColor: '#FFFFFF',
    subColor: '#C7D2FE',
    btnBg: '#FFFFFF',
    btnColor: '#312E81',
    badgeBoxBg: '#3730A3',
    badgeBoxText: '#FFFFFF',
    tagBg: 'rgba(255, 255, 255, 0.18)',
    tagColor: '#FFFFFF',
    targetScreen: 'Orders',
    targetParams: {},
    iconName: 'sync-circle',
  },

  // BANNER 04 — DELIVERY BENEFIT
  {
    id: 'banner_delivery',
    type: 'delivery',
    tag: 'DOORSTEP EXPRESS',
    title: 'Your Medicines, Delivered to Your Door',
    subtitle: 'Order healthcare essentials from the comfort of home',
    cta: 'Order Now',
    processCue: '⚡ 10-Min Express',
    bgColors: ['#0C4A6E', '#0369A1', '#0284C7'] as [string, string, string],
    textColor: '#FFFFFF',
    subColor: '#BAE6FD',
    btnBg: '#FFFFFF',
    btnColor: '#0369A1',
    badgeBoxBg: '#0284C7',
    badgeBoxText: '#FFFFFF',
    tagBg: 'rgba(255, 255, 255, 0.2)',
    tagColor: '#FFFFFF',
    targetScreen: 'Search',
    targetParams: { initialQuery: 'delivery' },
    iconName: 'bicycle',
  },

  // BANNER 05 — SEASONAL HEALTH CAMPAIGN
  {
    id: 'banner_seasonal',
    type: 'seasonal',
    tag: 'SEASONAL CARE',
    title: 'Monsoon Care Essentials',
    subtitle: 'Stay prepared with everyday healthcare & immunity items',
    cta: 'Explore Now',
    badgeText: 'MONSOON\nCARE',
    bgColors: ['#78350F', '#92400E', '#B45309'] as [string, string, string],
    textColor: '#FFFFFF',
    subColor: '#FDE68A',
    btnBg: '#FFFFFF',
    btnColor: '#B45309',
    badgeBoxBg: '#D97706',
    badgeBoxText: '#FFFFFF',
    tagBg: 'rgba(255, 255, 255, 0.2)',
    tagColor: '#FFFFFF',
    targetScreen: 'CategoryListing',
    targetParams: { categorySlug: 'cold-flu', categoryName: 'Monsoon Care' },
    iconName: 'shield-checkmark',
  },
];

const COMBO_BUNDLES = [
  { id: 'cb1', name: 'Fever & Flu Shield Combo', items: 'Crocin 650 + ORS + Vicks Vaporub', originalPrice: 180, price: 153, savings: 27, discount: '15% OFF', bg: '#F3E8FF', border: '#C084FC' },
  { id: 'cb2', name: 'First Aid Emergency Pack', items: 'Dettol + Band-Aid + Cotton + Iodine', originalPrice: 240, price: 199, savings: 41, discount: '17% OFF', bg: '#ECFDF5', border: '#6EE7B7' },
  { id: 'cb3', name: 'Acidity & Gas Relief Pack', items: 'Pan 40 + Digene Gel + Sporlac', originalPrice: 220, price: 178, savings: 42, discount: '19% OFF', bg: '#FEF3C7', border: '#FCD34D' },
  { id: 'cb4', name: 'Immunity Booster Combo', items: 'Chyawanprash + Vitamin C + Tulsi', originalPrice: 420, price: 349, savings: 71, discount: '17% OFF', bg: '#FDF2F8', border: '#F472B6' },
];

const PREVIOUS_ORDERS = [
  { id: 'ord-10234', orderNo: 'Order #HD10234', date: 'Delivered 2 days ago', itemsSummary: 'Crocin 650 Ã— 2 â€¢ Dolo 650 Ã— 1 â€¢ ORS Ã— 2', total: 245 },
  { id: 'ord-10198', orderNo: 'Order #HD10198', date: 'Delivered last week', itemsSummary: 'Becosules Z Ã— 1 â€¢ Volini Gel Ã— 1', total: 176 },
];

const WELLNESS_ARTICLES = [
  { id: 'w1', title: 'Immunity Boost Guide', subtitle: '5 Natural ways to strengthen immunity', bg: '#F3E8FF', color: '#3A2986', icon: 'shield-checkmark' },
  { id: 'w2', title: 'Diabetes Management', subtitle: 'Daily blood sugar tracking tips', bg: '#FEF3C7', color: '#D97706', icon: 'water' },
  { id: 'w3', title: 'Healthy Lifestyle', subtitle: 'Nutrition & daily vitamin habits', bg: '#DCFCE7', color: '#166534', icon: 'fitness' },
  { id: 'w4', title: 'Seasonal Health Care', subtitle: 'Protect against monsoons & flu', bg: '#EFF6FF', color: '#2563EB', icon: 'thermometer' },
];

const GENERIC_ALTERNATIVES = [
  {
    id: 'gen-1',
    brandName: 'Crocin 650 Advance',
    brandPrice: 35.0,
    genericName: 'Paracetamol 650mg (Jan Aushadhi)',
    genericPrice: 11.5,
    savingsPercent: 67,
  },
  {
    id: 'gen-2',
    brandName: 'Augmentin 625 Duo',
    brandPrice: 223.5,
    genericName: 'Amoxyclav 625 (Generic Equivalent)',
    genericPrice: 85.0,
    savingsPercent: 62,
  },
  {
    id: 'gen-3',
    brandName: 'Pan 40 Tablet',
    brandPrice: 162.0,
    genericName: 'Pantoprazole 40mg (Generic)',
    genericPrice: 45.0,
    savingsPercent: 72,
  },
];

const MEDICINE_SEARCH_PROMPTS = [
  'Search "Paracetamol"',
  'Search "Dolo 650"',
  'Search "Becosules Z"',
  'Search "Pan 40"',
  'Search "Augmentin 625"',
  'Search "Shelcal 500"',
  'Search "Cheston Cold"',
  'Search "Volini Gel"',
  'Search "Digene Gel"',
  'Search "Evion 400"',
  'Search "Saridon"',
  'Search "Cofsils"',
];

const STORE_SEARCH_PROMPTS = [
  'Search "Sharma Medical Store"',
  'Search "Apollo Pharmacy 24x7"',
  'Search "MedPlus Chemists"',
  'Search 24x7 pharmacies near you',
  'Search local chemist shops',
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [activeMode, setActiveMode] = useState<DiscoveryMode>('medicines');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const categorySlideAnim = React.useRef(new Animated.Value(0)).current;
  const categoryFadeAnim = React.useRef(new Animated.Value(1)).current;
  const prevCategoryIndexRef = React.useRef(0);

  const handleSelectCategoryTab = useCallback(
    (newTabId: string) => {
      if (newTabId === selectedFilter) return;

      haptics.light();

      const oldIndex = QUICK_FILTER_TABS.findIndex((t) => t.id === selectedFilter);
      const newIndex = QUICK_FILTER_TABS.findIndex((t) => t.id === newTabId);

      const isMovingRight = newIndex > oldIndex;
      const startTranslateX = isMovingRight ? SCREEN_WIDTH * 0.35 : -SCREEN_WIDTH * 0.35;

      categorySlideAnim.setValue(startTranslateX);
      categoryFadeAnim.setValue(0.35);

      setSelectedFilter(newTabId);
      prevCategoryIndexRef.current = newIndex;

      Animated.parallel([
        Animated.timing(categorySlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.poly(4)),
          useNativeDriver: true,
        }),
        Animated.timing(categoryFadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    },
    [selectedFilter, SCREEN_WIDTH, categorySlideAnim, categoryFadeAnim]
  );
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const promoScrollViewRef = React.useRef<ScrollView>(null);
  const isUserInteractingRef = React.useRef(false);
  const [selectedMedicineForVariant, setSelectedMedicineForVariant] = useState<Medicine | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-play Banner Carousel (Switches every 4.5s unless user is touching/swiping)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isUserInteractingRef.current && promoScrollViewRef.current) {
        setActivePromoIndex((prev) => {
          const next = (prev + 1) % PROMO_OFFERS.length;
          promoScrollViewRef.current?.scrollTo({ x: next * 340, animated: true });
          return next;
        });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Rotating placeholder every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const { items, summary, totalItemCount, addToCart, removeFromCart, updateQuantity, getItemQuantity, undoRemove } = useCart();
  const { selectedAddress } = useAddress();
  const { activeOrders } = useOrders();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { onScroll, collapseAnim } = useTabBarScroll();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 14);

  // Floating Cart sits dynamically 12px above the floating tab bar
  const floatingCartBottom = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Platform.OS === 'android' ? 88 : 96, Platform.OS === 'android' ? 20 : 24],
  });

  const floatingScanFabBottom = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      totalItemCount > 0 ? 162 + bottomOffset : 98 + bottomOffset,
      totalItemCount > 0 ? 92 + bottomOffset : 24 + bottomOffset,
    ],
  });

  const loadData = useCallback(async () => {
    try {
      const [meds, pharms] = await Promise.all([
        MedicineService.getAllMedicines(),
        PharmacyService.getNearbyPharmacies(),
      ]);
      setAllMedicines(meds);
      setNearbyPharmacies(pharms);
    } catch (e) {
      showToast('Failed to load marketplace items', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const activeOrder = activeOrders[0];

  const displayAddress = useMemo(() => {
    if (!selectedAddress) return 'Homeland City, Karimpur';
    const mainBuilding = selectedAddress.apartmentBuilding || selectedAddress.streetAddress || selectedAddress.city;
    const shortPart = mainBuilding.split(',')[0].trim();
    return `${shortPart}, ${selectedAddress.city}`;
  }, [selectedAddress]);

  const popularMedicines = useMemo(() => allMedicines.filter((m) => m.isPopular), [allMedicines]);
  const discountMedicines = useMemo(() => allMedicines.filter((m) => m.discountPercentage >= 14), [allMedicines]);
  const expressMedicines = useMemo(() => allMedicines.slice(0, 6), [allMedicines]);

  const selectedTabInfo = useMemo(() => {
    return QUICK_FILTER_TABS.find((t) => t.id === selectedFilter) || QUICK_FILTER_TABS[0];
  }, [selectedFilter]);

  const dynamicCategoryMedicines = useMemo(() => {
    if (selectedFilter === 'all') {
      return allMedicines.slice(0, 8);
    }
    const slug = selectedTabInfo.slug;
    const filtered = allMedicines.filter((m) => {
      const medCat = (m.categorySlug || m.category || '').toLowerCase();
      if (slug === 'pain-relief') return medCat.includes('pain') || medCat.includes('fever') || medCat.includes('first') || medCat.includes('aid');
      if (slug === 'cold-flu') return medCat.includes('cold') || medCat.includes('cough') || medCat.includes('flu');
      if (slug === 'diabetes') return medCat.includes('diabet') || medCat.includes('sugar');
      if (slug === 'vitamins') return medCat.includes('vitamin') || medCat.includes('immun');
      if (slug === 'digestive') return medCat.includes('digest') || medCat.includes('stomach') || medCat.includes('gas') || medCat.includes('acid');
      if (slug === 'skin') return medCat.includes('skin') || medCat.includes('derma');
      if (slug === 'baby') return medCat.includes('baby') || medCat.includes('mother');
      if (slug === 'ayurveda') return medCat.includes('ayur') || medCat.includes('herb');
      return medCat.includes(slug);
    });
    return filtered.length > 0 ? filtered : allMedicines.slice(0, 6);
  }, [selectedFilter, allMedicines, selectedTabInfo]);

  // Standard Medicine Card matching reference anatomy with perfect alignment
  const renderMedicineCard = (med: Medicine, storeAttribution?: string) => {
    if (!med || !med.id) return null;
    return (
      <MedicineCard
        key={med.id}
        medicine={med}
        onPress={() => navigation.navigate('MedicineDetails', { medicineId: med.id })}
        onOpenVariantModal={(m) => setSelectedMedicineForVariant(m)}
        onAddToCart={() => {
          const added = addToCart(med, 1);
          if (added) {
            showToast(`Added ${med.name} to cart!`, 'success');
            if (med.rxRequired) {
              setTimeout(() => {
                showToast('Prescription will be required before placing order', 'info', 3500);
              }, 800);
            }
          } else {
            showToast('Maximum quantity limit (10) reached', 'warning');
          }
        }}
        onIncrement={() => {
          const currentQty = getItemQuantity(med.id);
          if (currentQty >= 10) {
            showToast('Maximum quantity limit (10) reached', 'warning');
          } else {
            updateQuantity(med.id, currentQty + 1);
          }
        }}
        onDecrement={() => {
          const q = getItemQuantity(med.id);
          if (q === 1) {
            removeFromCart(med.id);
            showToast(`${med.name} removed from cart`, 'info', 4000, 'Undo', () => undoRemove());
          } else {
            updateQuantity(med.id, q - 1);
          }
        }}
        cartQuantity={getItemQuantity(med.id)}
        storeAttribution={storeAttribution}
        style={{ marginRight: SPACING.md }}
      />
    );
  };

  const renderBrandLogoContent = (brand: typeof TOP_BRANDS[0]) => {
    switch (brand.id) {
      case 'cipla':
        return (
          <AppText style={{ fontSize: 19, fontFamily: 'LexendDeca_700Bold', fontWeight: '800', color: '#004B93', letterSpacing: -0.5 }}>
            Cipla
          </AppText>
        );
      case 'sun':
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="aperture" size={14} color="#E65100" style={{ marginBottom: 1 }} />
            <AppText style={{ fontSize: 9.5, fontFamily: 'LexendDeca_700Bold', fontWeight: '800', color: '#4A2810', letterSpacing: 0.2 }}>
              SUN PHARMA
            </AppText>
          </View>
        );
      case 'abbott':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 14, height: 14, borderRadius: 3, borderWidth: 2, borderColor: '#0072CE', alignItems: 'center', justifyContent: 'center', marginRight: 3 }}>
              <AppText style={{ fontSize: 8.5, fontWeight: '800', color: '#0072CE', lineHeight: 11 }}>a</AppText>
            </View>
            <AppText style={{ fontSize: 14.5, fontFamily: 'LexendDeca_700Bold', fontWeight: '700', color: '#0072CE' }}>
              Abbott
            </AppText>
          </View>
        );
      case 'drreddy':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="heart" size={11} color="#4B286D" style={{ marginRight: 2 }} />
            <AppText style={{ fontSize: 12.5, fontFamily: 'LexendDeca_700Bold', fontWeight: '700', color: '#4B286D' }}>
              Dr.Reddy's
            </AppText>
          </View>
        );
      case 'mankind':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#0A4D9C', alignItems: 'center', justifyContent: 'center', marginRight: 3 }}>
              <Ionicons name="planet" size={9} color="#FFFFFF" />
            </View>
            <AppText style={{ fontSize: 13.5, fontFamily: 'LexendDeca_700Bold', fontWeight: '800', color: '#0A4D9C', fontStyle: 'italic' }}>
              Mankind
            </AppText>
          </View>
        );
      case 'himalaya':
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <AppText style={{ fontSize: 12.5, fontFamily: 'LexendDeca_700Bold', fontWeight: '700', color: '#00833E' }}>
              Himalaya
            </AppText>
            <AppText style={{ fontSize: 6.5, fontFamily: 'LexendDeca_500Medium', color: '#00833E', letterSpacing: 0.6, marginTop: 1 }}>
              SINCE 1930
            </AppText>
          </View>
        );
      case 'gsk':
        return (
          <View style={{ backgroundColor: '#E31B23', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 9 }}>
            <AppText style={{ fontSize: 13, fontFamily: 'LexendDeca_700Bold', fontWeight: '800', color: '#FFFFFF' }}>
              gsk
            </AppText>
          </View>
        );
      default:
        return (
          <AppText style={{ fontSize: 13.5, fontFamily: 'LexendDeca_700Bold', color: colors.textPrimary }}>
            {brand.name}
          </AppText>
        );
    }
  };

  // Helper to render 2 rows of cards in a smooth horizontal ScrollView
  const renderTwoRowHorizontal = <T,>(
    dataArray: T[],
    renderCard: (item: T, index: number) => React.ReactNode
  ) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {dataArray.map((item, idx) => (
          <View key={idx} style={{ marginRight: 12 }}>
            {renderCard(item, idx)}
          </View>
        ))}
      </ScrollView>
    );
  };

  // Standard Pharmacy Card Component
  const renderPharmacyCard = (pharmacy: Pharmacy) => {
    if (!pharmacy || !pharmacy.id) return null;
    return (
      <TouchableOpacity
        key={pharmacy.id}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: pharmacy.id })}
        style={[styles.pharmacyCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
      >
        <Image source={{ uri: pharmacy.logo }} style={styles.pharmacyLogo} resizeMode="cover" />

        <View style={styles.pharmacyDetails}>
          <View style={styles.pharmacyNameRow}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600" numberOfLines={1} style={{ flex: 1 }}>
              {pharmacy.name}
            </AppText>
            {pharmacy.isVerified && (
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                <AppText variant="caption" color={colors.primary} weight="600" style={{ fontSize: 10, marginLeft: 2 }}>
                  Verified
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.pharmacyMetaRow}>
            <AppText variant="caption" color="#15803D" weight="600">
              {pharmacy.rating} ★
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={{ marginHorizontal: 3 }}>
              •
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {formatDistance(pharmacy.distanceKm)}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={{ marginHorizontal: 3 }}>
              •
            </AppText>
            <AppText variant="caption" color={colors.primary} weight="600">
              {formatDeliveryTime(pharmacy.estimatedDeliveryTimeMinutes)}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={{ marginHorizontal: 3 }}>
              •
            </AppText>
            <AppText variant="caption" color={pharmacy.isOpenNow ? '#15803D' : '#DC2626'} weight="600">
              {pharmacy.isOpenNow ? 'Open' : 'Closed'}
            </AppText>
          </View>

          <AppText variant="caption" color={colors.textMuted} numberOfLines={1} style={{ marginTop: 2, fontSize: 11 }}>
            📍 {pharmacy.address.line1}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  // Large Zomato / Blinkit Style Store Card Component (Matching exact user screenshot)
  const renderLargeStoreCard = (pharmacy: Pharmacy) => {
    if (!pharmacy || !pharmacy.id) return null;

    return (
      <TouchableOpacity
        key={pharmacy.id}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: pharmacy.id })}
        style={[styles.largeStoreCard, { backgroundColor: colors.surface }, SHADOWS.card]}
      >
        {/* Hero Store Image Banner */}
        <View style={styles.largeStoreImageContainer}>
          <Image
            source={{
              uri:
                pharmacy.logo ||
                'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&q=80',
            }}
            style={styles.largeStoreImage}
            resizeMode="cover"
          />

          {/* Top-Right Favorite Bookmark Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              showToast(`Saved ${pharmacy.name} to favorites`, 'info');
            }}
            style={styles.largeStoreBookmarkBtn}
          >
            <Ionicons
              name="bookmark-outline"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Bottom-Left Image Badge */}
          <View style={styles.largeStoreImageBadge}>
            <Ionicons name="flash" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
            <AppText style={styles.largeStoreBadgeText}>
              Free delivery with HEALIT â€¢ {formatDeliveryTime(pharmacy.estimatedDeliveryTimeMinutes)}
            </AppText>
          </View>

          {/* Bottom-Right Dots */}
          <View style={styles.largeStoreDotsRow}>
            <View style={[styles.largeStoreDot, styles.largeStoreDotActive]} />
            <View style={styles.largeStoreDot} />
            <View style={styles.largeStoreDot} />
          </View>
        </View>

        {/* Card Content Body */}
        <View style={styles.largeStoreBody}>
          {/* Row 1: Name & Rating Badge */}
          <View style={styles.largeStoreHeaderRow}>
            <AppText style={styles.largeStoreName} numberOfLines={1}>
              {pharmacy.name}
            </AppText>

            <View style={styles.largeStoreRatingPill}>
              <AppText style={styles.largeStoreRatingText}>{pharmacy.rating || '4.8'}</AppText>
              <Ionicons name="star" size={11} color="#FFFFFF" style={{ marginLeft: 2 }} />
            </View>
          </View>

          {/* Row 2: Sub-info (Near & Fast â€¢ 800m â€¢ Open Now) */}
          <View style={styles.largeStoreSubInfoRow}>
            <Ionicons name="flash" size={13} color="#059669" style={{ marginRight: 3 }} />
            <AppText style={styles.largeStoreSubInfoText}>
              Near & Fast â€¢ {formatDistance(pharmacy.distanceKm)} â€¢ {pharmacy.isOpenNow ? 'Open Now' : 'Closed'}
            </AppText>
            {pharmacy.isVerified && (
              <View style={styles.verifiedMiniTag}>
                <Ionicons name="checkmark-circle" size={11} color={colors.primary} />
                <AppText style={styles.verifiedMiniText}>Verified</AppText>
              </View>
            )}
          </View>

          {/* Row 3: Offer Tag (Blue / Purple) */}
          <View style={styles.largeStoreOfferRow}>
            <Ionicons name="pricetag" size={13} color={colors.primary} style={{ marginRight: 5 }} />
            <AppText style={styles.largeStoreOfferText} numberOfLines={1}>
              Flat â‚¹120 OFF on orders above â‚¹199
            </AppText>
          </View>

          {/* Row 4: Address & Stock Availability */}
          <View style={styles.largeStoreAddressRow}>
            <AppText style={styles.largeStoreAddressText} numberOfLines={1}>
              ðŸ“ {pharmacy.address.line1} â€¢ 8/8 Medicines Available
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingState fullScreen message="Loading HEALIT..." />;
  }

  const headerGradientColors: [string, string, string, string] = isDark
    ? ['#1A103D', '#251554', '#32196E', colors.background]
    : ['#431EAF', '#5223C7', '#6933DC', '#F8F8FC'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* =========================================================================
          1. TOP HERO GRADIENT HEADER (Exact match to screenshot)
         ========================================================================= */}
      <LinearGradient
        colors={headerGradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.gradientHeader,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 4),
          },
        ]}
      >
          {/* Location & Toggle Row (Refined to match Reference UI anatomy) */}
          <View style={styles.headerLocationRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}
              style={styles.locationContainer}
            >
              <AppText style={styles.deliverToCaptionText}>
                Deliver to
              </AppText>
              <View style={styles.locationTitleRow}>
                <Ionicons name="location-sharp" size={16} color="#FFFFFF" />
                <AppText style={styles.locationTitleText}>
                  {selectedAddress?.label || 'Office'}
                </AppText>
                <Ionicons name="chevron-down" size={14} color="#FFFFFF" style={{ marginLeft: 3 }} />
              </View>
              <AppText style={styles.locationSubtitleText} numberOfLines={1}>
                {displayAddress}
              </AppText>
            </TouchableOpacity>

            {/* By Medicine / By Store Pill Toggle + Notification Icon */}
            <View style={styles.headerRightActionsRow}>
              <View style={styles.togglePillContainer}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    if (activeMode !== 'medicines') {
                      haptics.selection();
                      setActiveMode('medicines');
                    }
                  }}
                  style={[
                    styles.togglePillBtn,
                    activeMode === 'medicines' && styles.togglePillBtnActive,
                  ]}
                >
                  <AppText
                    style={[
                      styles.togglePillText,
                      activeMode === 'medicines' ? styles.togglePillTextActive : styles.togglePillTextInactive,
                    ]}
                  >
                    Medicines
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    if (activeMode !== 'stores') {
                      haptics.selection();
                      setActiveMode('stores');
                    }
                  }}
                  style={[
                    styles.togglePillBtn,
                    activeMode === 'stores' && styles.togglePillBtnActive,
                  ]}
                >
                  <AppText
                    style={[
                      styles.togglePillText,
                      activeMode === 'stores' ? styles.togglePillTextActive : styles.togglePillTextInactive,
                    ]}
                  >
                    Stores
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Search Bar Row (Clean pill shape) */}
          <View style={styles.searchRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('Search', {
                  initialQuery: activeMode === 'stores' ? 'pharmacy' : '',
                })
              }
              style={[styles.searchBarInput, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="search-outline" size={20} color="#666666" style={{ marginRight: 8 }} />
              <AppText style={styles.searchPlaceholderText} numberOfLines={1}>
                {activeMode === 'medicines'
                  ? 'Search medicines, health products...'
                  : STORE_SEARCH_PROMPTS[placeholderIndex % STORE_SEARCH_PROMPTS.length]}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Quick Filter Category Tab Bar (Exact Reference Match — Icon + Label + Underline Indicator) */}
          <View style={styles.quickFilterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickFilterBar}
            >
              {QUICK_FILTER_TABS.map((tab, idx) => {
                const isSelected = selectedFilter === tab.id;

                return (
                  <TouchableOpacity
                    key={tab.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectCategoryTab(tab.id)}
                    style={styles.quickFilterTabItem}
                  >
                    <Ionicons
                      name={(idx === 0 ? 'grid' : (isSelected ? tab.activeIcon : tab.icon)) as any}
                      size={24}
                      color={isSelected ? colors.primary : '#FFFFFF'}
                      style={{ opacity: isSelected ? 1 : 0.82, marginBottom: 4 }}
                    />
                    <AppText
                      style={[
                        styles.quickFilterTabText,
                        isSelected ? [styles.quickFilterTabTextActive, { color: colors.primary }] : styles.quickFilterTabTextInactive,
                      ]}
                      numberOfLines={1}
                    >
                      {tab.name}
                    </AppText>

                    {/* Underline Indicator Bar for Selected Item (Primary Color) */}
                    <View
                      style={[
                        styles.activeIndicatorPill,
                        { backgroundColor: isSelected ? colors.primary : 'transparent' },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={colors.primary}
            />
          }
        >


          {/* =========================================================================
              MODE 1: MEDICINE DISCOVERY MODE CONTENT
             ========================================================================= */}
          {activeMode === 'medicines' && (
            <>
              {/* =========================================================================
                  OFFERS & HEALTH HIGHLIGHTS (Production-Grade Healthcare Carousel)
                 ========================================================================= */}
              <View style={styles.promoCarouselSectionRef}>
                <ScrollView
                  ref={promoScrollViewRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={340}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingHorizontal: SPACING.md }}
                  onTouchStart={() => { isUserInteractingRef.current = true; }}
                  onTouchEnd={() => {
                    setTimeout(() => { isUserInteractingRef.current = false; }, 2500);
                  }}
                  onScrollBeginDrag={() => { isUserInteractingRef.current = true; }}
                  onScrollEndDrag={() => {
                    setTimeout(() => { isUserInteractingRef.current = false; }, 2500);
                  }}
                  onScroll={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const index = Math.round(x / 340);
                    if (index >= 0 && index < PROMO_OFFERS.length && index !== activePromoIndex) {
                      setActivePromoIndex(index);
                    }
                  }}
                  scrollEventThrottle={16}
                >
                  {PROMO_OFFERS.map((promo) => (
                    <TouchableOpacity
                      key={promo.id}
                      activeOpacity={0.94}
                      onPress={() => {
                        haptics.light();
                        if (promo.targetScreen) {
                          (navigation.navigate as any)(promo.targetScreen, promo.targetParams);
                        }
                        showToast(`Opening ${promo.title}`, 'info');
                      }}
                    >
                      <LinearGradient
                        colors={promo.bgColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.promoCardRef}
                      >
                        {/* Left Column: Tag + Headline + Subtitle + CTA */}
                        <View style={styles.promoContentLeft}>
                          <View style={[styles.promoTagBadge, { backgroundColor: promo.tagBg }]}>
                            <AppText style={[styles.promoTagBadgeText, { color: promo.tagColor }]}>
                              {promo.tag}
                            </AppText>
                          </View>

                          <AppText style={[styles.promoTitleText, { color: promo.textColor }]} numberOfLines={2}>
                            {promo.title}
                          </AppText>

                          <AppText style={[styles.promoSubText, { color: promo.subColor }]} numberOfLines={1}>
                            {promo.subtitle}
                          </AppText>

                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => {
                              haptics.selection();
                              if (promo.targetScreen) {
                                (navigation.navigate as any)(promo.targetScreen, promo.targetParams);
                              }
                            }}
                            style={[styles.promoCtaBtnRef, { backgroundColor: promo.btnBg }]}
                          >
                            <AppText style={[styles.promoCtaBtnText, { color: promo.btnColor }]}>
                              {promo.cta}
                            </AppText>
                          </TouchableOpacity>
                        </View>

                        {/* Right Column: Visual Process/Offer Badge Box */}
                        <View style={styles.promoRightVisualCol}>
                          {promo.processCue ? (
                            <View style={styles.processCueBadge}>
                              <Ionicons name={(promo.iconName || 'sparkles') as any} size={22} color="#FFFFFF" style={{ marginBottom: 4 }} />
                              <AppText style={styles.processCueText}>
                                {promo.processCue}
                              </AppText>
                            </View>
                          ) : (
                            <View style={[styles.badgeBoxRight, { backgroundColor: promo.badgeBoxBg }]}>
                              <Ionicons name={(promo.iconName || 'pricetag') as any} size={18} color="#FFFFFF" style={{ marginBottom: 2 }} />
                              <AppText style={[styles.badgeBoxNumber, { color: promo.badgeBoxText }]}>
                                {promo.badgeText}
                              </AppText>
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Active Carousel Pagination Indicators */}
                <View style={styles.carouselPageDotsRow}>
                  {PROMO_OFFERS.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.carouselDotRef,
                        i === activePromoIndex ? [styles.carouselDotActiveRef, { backgroundColor: colors.primary }] : null,
                      ]}
                    />
                  ))}
                </View>
              </View>
              {/* Localized Category Content Section with Horizontal Slide Transition */}
              <Animated.View
                style={{
                  transform: [{ translateX: categorySlideAnim }],
                  opacity: categoryFadeAnim,
                }}
              >
                {/* Dynamic Filter Selected Category Section (Shown when a specific category tab is selected) */}
                {selectedFilter !== 'all' && (
                  <View style={styles.dynamicFilterSection}>
                    <View style={styles.dynamicFilterHeaderRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={styles.dynamicTitleBadgeRow}>
                          <Ionicons
                            name={(selectedTabInfo.activeIcon || selectedTabInfo.icon) as any}
                            size={18}
                            color={colors.primary}
                            style={{ marginRight: 6 }}
                          />
                          <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                            {selectedTabInfo.title}
                          </AppText>
                        </View>
                        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                          {selectedTabInfo.subtitle}
                        </AppText>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('CategoryListing', {
                            categorySlug: selectedTabInfo.slug === 'all' ? 'pain-relief' : selectedTabInfo.slug,
                            categoryName: selectedTabInfo.title,
                          })
                        }
                      >
                        <AppText variant="bodySmall" color={colors.primary} weight="600">
                          View All →
                        </AppText>
                      </TouchableOpacity>
                    </View>

                    {renderTwoRowHorizontal(dynamicCategoryMedicines, (med) => renderMedicineCard(med))}
                  </View>
                )}

                {/* 3RD SECTION (when category selected): Nearby Pharmacies */}
                {selectedFilter !== 'all' && (
                  <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.sectionHeaderRow}>
                      <View>
                        <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                          Nearby Pharmacies
                        </AppText>
                        <AppText variant="caption" color={colors.textSecondary}>
                          Verified licensed chemist shops fulfilling orders
                        </AppText>
                      </View>
                      <TouchableOpacity onPress={() => setActiveMode('stores')}>
                        <AppText variant="bodySmall" color={colors.primary} weight="600">
                          View all →
                        </AppText>
                      </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                      {nearbyPharmacies.map((pharmacy) => (
                        <View key={pharmacy.id} style={{ width: 310, marginRight: SPACING.md }}>
                          {renderPharmacyCard(pharmacy)}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </Animated.View>

              {/* Popular Medicines */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Popular Medicines
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Most ordered healthcare items near you
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                {renderTwoRowHorizontal(popularMedicines, (med) => renderMedicineCard(med))}
              </View>

              {/* Shop by Category (Static 4-Column Grid — No Carousel) */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                    Shop by Category
                  </AppText>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.categoryStaticGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.82}
                      onPress={() =>
                        navigation.navigate('CategoryListing', {
                          categorySlug: cat.slug,
                          categoryName: cat.name,
                        })
                      }
                      style={[
                        styles.catGridCard,
                        {
                          backgroundColor: isDark ? '#1E1B4B' : '#FFFFFF',
                          borderColor: isDark ? '#312E81' : '#ECE9F6',
                        },
                      ]}
                    >
                      <View style={[styles.catIconCircle, { backgroundColor: cat.bg }]}>
                        <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                      </View>
                      <AppText style={[styles.catGridName, { color: colors.textPrimary }]} numberOfLines={2}>
                        {cat.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 2ND SECTION (or 1st when 'All'): Shop by Brand */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                    Shop by Brand
                  </AppText>
                  <TouchableOpacity
                    style={styles.seeAllBrandBtn}
                    onPress={() => navigation.navigate('Search')}
                  >
                    <AppText style={styles.seeAllBrandText}>
                      See all
                    </AppText>
                    <Ionicons name="chevron-forward" size={13} color="#6D28D9" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {TOP_BRANDS.map((brand) => (
                    <TouchableOpacity
                      key={brand.id}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('BrandDetail', {
                          brandId: brand.id,
                          brandName: brand.name,
                          brandQuery: brand.brandQuery || brand.name,
                          brandBg: brand.bg,
                          brandImage: brand.image,
                          brandCount: brand.count,
                        })
                      }
                      style={[
                        styles.brandCardRef,
                        {
                          backgroundColor: isDark ? '#1E1B4B' : '#FFFFFF',
                          borderColor: isDark ? '#312E81' : '#ECE9F6',
                        },
                      ]}
                    >
                      <View style={styles.brandLogoBox}>
                        {renderBrandLogoContent(brand)}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Daily Essentials */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Daily Essentials
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Everything you may need every day
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                {renderTwoRowHorizontal(allMedicines.slice(0, 8), (med) => renderMedicineCard(med))}
              </View>

              {/* Nearby Pharmacies (When 'All' tab is active) */}
              {selectedFilter === 'all' && (
                <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                  <View style={styles.sectionHeaderRow}>
                    <View>
                      <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                        Nearby Pharmacies
                      </AppText>
                      <AppText variant="caption" color={colors.textSecondary}>
                        Verified licensed chemist shops fulfilling orders
                      </AppText>
                    </View>
                    <TouchableOpacity onPress={() => setActiveMode('stores')}>
                      <AppText variant="bodySmall" color={colors.primary} weight="600">
                        View all →
                      </AppText>
                    </TouchableOpacity>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {nearbyPharmacies.map((pharmacy) => (
                      <View key={pharmacy.id} style={{ width: 310, marginRight: SPACING.md }}>
                        {renderPharmacyCard(pharmacy)}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* SECTION 6 â€” Best Prices & Deals (2-Row Horizontal Scroll) */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Best Prices & Deals
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      High savings on essential health items
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                {renderTwoRowHorizontal(discountMedicines, (med) => renderMedicineCard(med))}
              </View>

              {/* Quick Order Prescription Upload Banner */}
              <View style={[styles.rxCtaCard, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryBorder },, SHADOWS.subtle]}>
                <View style={styles.rxCtaContent}>
                  <View style={styles.rxPill}>
                    <AppText variant="caption" color="#FFFFFF" weight="600" style={{ fontSize: 9 }}>
                      QUICK ORDER
                    </AppText>
                  </View>
                  <AppText variant="titleMedium" color={colors.primary} weight="600" style={{ marginTop: 4 }}>
                    Have a prescription?
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                    Upload your Rx and let nearby pharmacies provide the best offers.
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('UploadPrescription', { fromCart: false })}
                    style={styles.rxUploadCtaBtn}
                  >
                    <Ionicons name="camera-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <AppText variant="buttonSmall" color="#FFFFFF" weight="600">
                      Upload Prescription
                    </AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.rxCtaIllustration}>
                  <Ionicons name="document-attach" size={52} color={colors.primary} />
                </View>
              </View>



              {/* SECTION 8 â€” Frequently Used (2-Row Horizontal Scroll) */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Frequently Used
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Quickly reorder what you use often
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                {renderTwoRowHorizontal(popularMedicines.slice(0, 6), (med) => renderMedicineCard(med))}
              </View>



              {/* SECTION 10 â€” Recommended for You (2-Row Horizontal Scroll) */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Recommended for You
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Personalized recommendations based on health needs
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                {renderTwoRowHorizontal(allMedicines.slice(2, 10), (med) => renderMedicineCard(med))}
              </View>

              {/* SECTION 11 â€” Frequently Bought Together (Combos) */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Frequently Bought Together
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Curated essential health combo bundles
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                {renderTwoRowHorizontal(COMBO_BUNDLES, (combo) => (
                  <TouchableOpacity
                    key={combo.id}
                    activeOpacity={0.88}
                    onPress={() => showToast(`Added ${combo.name} bundle to cart!`, 'success')}
                    style={[styles.comboCardContainer, { backgroundColor: combo.bg, borderColor: combo.border }]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.comboBadge}>
                        <AppText style={styles.comboBadgeText}>{combo.discount}</AppText>
                      </View>
                      <AppText style={styles.comboTitle}>{combo.name}</AppText>
                      <AppText style={styles.comboItemsText}>{combo.items}</AppText>
                      <View style={styles.comboPriceRow}>
                        <AppText style={styles.comboPriceText}>₹{combo.price}</AppText>
                        <AppText style={styles.comboMrpText}>₹{combo.originalPrice}</AppText>
                        <AppText style={styles.comboSavingsText}>Save ₹{combo.savings}</AppText>
                      </View>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => showToast(`Added ${combo.name} bundle to cart!`, 'success')}
                      style={styles.comboAddBtn}
                    >
                      <AppText style={styles.comboAddBtnText}>+ Add Combo</AppText>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>

              {/* SECTION 12 â€” Health & Wellness for You (2x2 Static Grid) */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Health & Wellness for You
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Guides, habits & preventive care
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.wellnessGrid}>
                  {WELLNESS_ARTICLES.map((article) => (
                    <TouchableOpacity
                      key={article.id}
                      activeOpacity={0.88}
                      onPress={() => showToast(`Opening ${article.title}`, 'info')}
                      style={[styles.wellnessGridCard, { backgroundColor: article.bg }]}
                    >
                      <View>
                        <View style={styles.wellnessIconCircle}>
                          <Ionicons name={article.icon as any} size={20} color={article.color} />
                        </View>
                        <AppText style={[styles.wellnessTitle, { color: article.color }]}>{article.title}</AppText>
                        <AppText style={styles.wellnessSubtitle} numberOfLines={2}>
                          {article.subtitle}
                        </AppText>
                      </View>
                      <AppText style={[styles.wellnessExploreText, { color: article.color }]}>Explore →</AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* SECTION 13 â€” Recently Viewed */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Recently Viewed
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Items you opened recently
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                {renderTwoRowHorizontal(popularMedicines, (med) => renderMedicineCard(med))}
              </View>

              {/* SECTION 14 â€” Trust & Service Features Bar */}
              <View style={styles.trustBarSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trustBarRow}>
                  <View style={styles.trustItem}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
                    <AppText style={styles.trustItemText}>100% Genuine Medicines</AppText>
                  </View>
                  <View style={styles.trustDivider} />
                  <View style={styles.trustItem}>
                    <Ionicons name="pricetag-outline" size={16} color="#059669" />
                    <AppText style={styles.trustItemText}>Best Prices</AppText>
                  </View>
                  <View style={styles.trustDivider} />
                  <View style={styles.trustItem}>
                    <Ionicons name="flash-outline" size={16} color="#059669" />
                    <AppText style={styles.trustItemText}>Fast 15-Min Delivery</AppText>
                  </View>
                  <View style={styles.trustDivider} />
                  <View style={styles.trustItem}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
                    <AppText style={styles.trustItemText}>Secure Payments</AppText>
                  </View>
                  <View style={styles.trustDivider} />
                  <View style={styles.trustItem}>
                    <Ionicons name="refresh-outline" size={16} color="#059669" />
                    <AppText style={styles.trustItemText}>Easy Returns</AppText>
                  </View>
                  <View style={styles.trustDivider} />
                  <View style={styles.trustItem}>
                    <Ionicons name="headset-outline" size={16} color="#059669" />
                    <AppText style={styles.trustItemText}>24/7 Support</AppText>
                  </View>
                </ScrollView>
              </View>
            </>
          )}

          {/* =========================================================================
              MODE 2: STORE DISCOVERY MODE CONTENT (Right on HomeScreen!)
             ========================================================================= */}
          {activeMode === 'stores' && (
            <>
              {/* 1ST SECTION IN STORE MODE: Nearby Pharmacies (Zomato / Blinkit style full-width cards) */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Nearby Pharmacies
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      Verified licensed chemist shops fulfilling orders
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'SearchTab', params: { initialQuery: 'pharmacy' } } as any)}>
                    <AppText variant="bodySmall" color={colors.primary} weight="600">
                      View all →
                    </AppText>
                  </TouchableOpacity>
                </View>

                {nearbyPharmacies.map((pharmacy) => renderLargeStoreCard(pharmacy))}
              </View>

              {/* 2ND SECTION IN STORE MODE: Shop by Brand */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                    Shop by Brand
                  </AppText>
                  <TouchableOpacity
                    style={styles.seeAllBrandBtn}
                    onPress={() => navigation.navigate('Search')}
                  >
                    <AppText style={styles.seeAllBrandText}>
                      See all
                    </AppText>
                    <Ionicons name="chevron-forward" size={13} color="#6D28D9" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {TOP_BRANDS.map((brand) => (
                    <TouchableOpacity
                      key={brand.id}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('BrandDetail', {
                          brandId: brand.id,
                          brandName: brand.name,
                          brandQuery: brand.brandQuery || brand.name,
                          brandBg: brand.bg,
                          brandImage: brand.image,
                          brandCount: brand.count,
                        })
                      }
                      style={[
                        styles.brandCardRef,
                        {
                          backgroundColor: isDark ? '#1E1B4B' : '#FFFFFF',
                          borderColor: isDark ? '#312E81' : '#ECE9F6',
                        },
                      ]}
                    >
                      <View style={styles.brandLogoBox}>
                        {renderBrandLogoContent(brand)}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 3. Store Deals & Offers */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Store Deals &amp; Offers
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Special discounts offered by local chemists
                    </AppText>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {STORE_DEALS.map((deal) => (
                    <TouchableOpacity
                      key={deal.id}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: deal.pharmacyId })}
                      style={[styles.storeDealCard, { backgroundColor: deal.bg }, SHADOWS.subtle]}
                    >
                      <View style={[styles.storeDealBadge, { backgroundColor: deal.color }]}>
                        <AppText variant="caption" color="#FFFFFF" weight="600" style={{ fontSize: 10 }}>
                          {deal.badge}
                        </AppText>
                      </View>
                      <AppText variant="titleSmall" color={deal.color} weight="600" style={{ marginTop: SPACING.sm }}>
                        {deal.title}
                      </AppText>
                      <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                        ðŸª {deal.pharmacyName}
                      </AppText>
                      <View style={styles.storeDealActionRow}>
                        <AppText variant="caption" color={deal.color} weight="600">
                          Visit Store â†’
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 4. Browse Stores by Specialization */}
              <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      Browse Stores by Specialization
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Find specialized retail medical shops
                    </AppText>
                  </View>
                </View>

                <View style={styles.storeCategoryGrid}>
                  {STORE_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('Search', {
                          initialQuery: cat.name,
                        })
                      }
                      style={[styles.storeCategoryCard, SHADOWS.subtle]}
                    >
                      <View style={[styles.storeCatIconCircle, { backgroundColor: '#ECE8F7' }]}>
                        <Ionicons name={cat.icon as any} size={24} color={colors.primary} />
                      </View>
                      <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginTop: 8 }}>
                        {cat.name}
                      </AppText>
                      <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                        {cat.count}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* =========================================================================
            19. FLOATING CART (Zepto-style dual capsule: Offers + Cart)
           ========================================================================= */}
        <FloatingCart
          onPressViewCart={() => navigation.navigate('Cart')}
          bottomOffset={floatingCartBottom}
        />
        {/* Floating Prescription Scan FAB (Positioned right side above bottom nav) */}
        <Animated.View style={[styles.floatingScanFab, { bottom: floatingScanFabBottom }]}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('UploadPrescription', { fromCart: false })}
          >
            <LinearGradient
              colors={['#5223C7', '#3A2986']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.floatingScanFabInner, SHADOWS.modal]}
            >
              <Ionicons name="scan-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Variant Selection Modal */}
        <VariantSelectionModal
          visible={!!selectedMedicineForVariant}
          medicine={selectedMedicineForVariant}
          onClose={() => setSelectedMedicineForVariant(null)}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    paddingTop: Platform.OS === 'android' ? 8 : 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  locationContainer: {
    flex: 1,
    marginRight: 10,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitleText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 4,
  },
  locationSubtitleText: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 12,
    marginTop: 2,
  },
  togglePillContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 3,
    alignItems: 'center',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  togglePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  togglePillBtnActive: {
    backgroundColor: '#3A2986',
  },
  togglePillText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_600SemiBold',
  },
  togglePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'LexendDeca_700Bold',
  },
  togglePillTextInactive: {
    color: '#3A2986',
    fontWeight: '600',
    fontFamily: 'LexendDeca_600SemiBold',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  searchBarInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 16,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  searchPlaceholderText: {
    color: '#666666',
    fontSize: 14,
    flex: 1,
  },
  floatingScanFab: {
    position: 'absolute',
    right: 16,
    zIndex: 1004,
    borderRadius: 27,
  },
  floatingScanFabInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  quickFilterSection: {
    marginTop: 6,
    marginBottom: 0,
  },
  dynamicFilterSection: {
    marginTop: 14,
    marginBottom: 10,
  },
  dynamicFilterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dynamicTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickFilterBar: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  quickFilterItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 76,
    borderRadius: 22,
    marginRight: 10,
  },
  quickFilterItemActiveCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#4C2A9C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickFilterText: {
    fontSize: 12.5,
    marginTop: 4,
    textAlign: 'center',
  },
  quickFilterTextActive: {
    color: '#4C2A9C',
    fontWeight: '700',
  },
  quickFilterTextInactive: {
    color: '#333333',
    fontWeight: '600',
  },
  exactSectionContainer: {
    marginTop: 18,
    marginBottom: 16,
  },
  exactSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  exactSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  exactViewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5223C7',
  },
  exactCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  exactCategoryCard: {
    width: 135,
    height: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  exactCategoryBadge: {
    position: 'absolute',
    top: -2,
    left: 8,
    right: 8,
    zIndex: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exactCategoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 12,
  },
  exactCategoryImg: {
    width: '100%',
    height: '100%',
    marginTop: 12,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  locationSelector: {
    flex: 1,
    marginRight: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  locationLabel: {
    marginLeft: 3,
  },
  headerEtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A2986',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  headerEtaText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  addressLine: {
    marginTop: 2,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECE8F7',
    borderRadius: BORDER_RADIUS.full,
    padding: 3,
    marginBottom: SPACING.md,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  modeToggleBtnActive: {
    backgroundColor: '#3A2986',
    ...SHADOWS.subtle,
  },
  universalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: '#3A2986',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  storeHeroBanner: {
    flexDirection: 'row',
    backgroundColor: '#0D9488',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  storeHeroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  heroUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
  },
  heroIllustrationBox: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOrderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#15803D',
    marginBottom: SPACING.lg,
  },
  activeOrderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#15803D',
    marginLeft: 6,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  horizontalList: {
    paddingRight: SPACING.lg,
  },
  healthNeedCard: {
    width: 100,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  healthNeedIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  categoryGridItem: {
    width: 76,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineCard: {
    width: 156,
    marginRight: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
  },
  medImgWrapper: {
    position: 'relative',
    width: '100%',
    height: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  medImg: {
    width: '85%',
    height: '85%',
  },
  rxTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  floatingActionContainer: {
    position: 'absolute',
    bottom: -8,
    right: 6,
    zIndex: 10,
  },
  addPillBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#E11D48',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  greenPriceTag: {
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  strikeMrp: {
    textDecorationLine: 'line-through',
    marginLeft: 6,
    fontSize: 12,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  discountText: {
    fontSize: 11,
    marginRight: 6,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderWidth: 0.5,
    borderColor: '#E8E8EE',
    borderStyle: 'dashed',
  },
  medTitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 16,
  },
  packSize: {
    marginTop: 4,
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeCard: {
    width: 146,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  typeIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  typeCountBadge: {
    backgroundColor: '#F8F8FC',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  seeAllBrandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  seeAllBrandText: {
    fontSize: 13,
    fontFamily: 'LexendDeca_600SemiBold',
    fontWeight: '600',
    color: '#6D28D9',
  },
  brandCardRef: {
    width: 104,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  brandHeartIcon: {
    position: 'absolute',
    top: 5,
    right: 7,
    zIndex: 5,
  },
  brandLogoBox: {
    width: '85%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoImg: {
    width: '100%',
    height: '100%',
  },
  brandCardNew: {
    width: 125,
    height: 155,
    borderRadius: 20,
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 0,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  brandCardHeader: {
    zIndex: 2,
  },
  brandCardTitle: {
    fontSize: 14,
    fontFamily: 'LexendDeca_700Bold',
    color: '#FFFFFF',
    lineHeight: 17,
  },
  brandCardCount: {
    fontSize: 10,
    fontFamily: 'LexendDeca_500Medium',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 3,
  },
  brandCardImageWrapper: {
    width: '112%',
    height: 85,
    alignSelf: 'center',
    marginBottom: -4,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
  },
  brandCardImage: {
    width: '100%',
    height: '100%',
  },
  brandCard: {
    width: 125,
    height: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  brandLogo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F8F8FC',
  },
  rxCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FB',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#DCD5F0',
    marginBottom: SPACING.xl,
  },
  rxPill: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rxCtaContent: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  rxUploadCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  rxCtaIllustration: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compositionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.sm,
  },
  compIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genericCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  genericCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  savingsTag: {
    backgroundColor: '#15803D',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  genericDivider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginVertical: SPACING.sm,
  },
  genericCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genericAddBtn: {
    backgroundColor: '#ECE8F7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#DCD5F0',
  },
  pharmacyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  pharmacyLogo: {
    width: 70,
    height: '100%',
    minHeight: 70,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8F8FC',
  },
  pharmacyDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  pharmacyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  pharmacyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  storeDealCard: {
    width: 240,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  storeDealBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  storeDealActionRow: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  storeCategoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  storeCatIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCart: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    zIndex: 1005,
  },
  floatingCartInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    width: '100%',
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingCartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoCardContainer: {
    width: 220,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'LexendDeca_600SemiBold',
  },
  promoTitle: {
    fontSize: 14,
    fontFamily: 'LexendDeca_700Bold',
  },
  promoSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'LexendDeca_400Regular',
    marginTop: 2,
  },
  promoCodeRow: {
    marginTop: 6,
  },
  promoCodeText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_600SemiBold',
  },
  reorderCardContainer: {
    width: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  reorderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderOrderNo: {
    fontSize: 12,
    fontFamily: 'LexendDeca_600SemiBold',
    color: COLORS.textPrimary,
  },
  reorderDateText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'LexendDeca_400Regular',
  },
  reorderItemsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'LexendDeca_400Regular',
    marginVertical: 8,
  },
  reorderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reorderTotalText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_700Bold',
    color: COLORS.textPrimary,
  },
  reorderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  reorderBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'LexendDeca_600SemiBold',
  },
  comboCardContainer: {
    width: 240,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  comboBadge: {
    backgroundColor: '#DC2626',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  comboBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'LexendDeca_600SemiBold',
  },
  comboTitle: {
    fontSize: 13,
    fontFamily: 'LexendDeca_600SemiBold',
    color: COLORS.textPrimary,
  },
  comboItemsText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: 'LexendDeca_400Regular',
    marginTop: 2,
  },
  comboPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  comboPriceText: {
    fontSize: 14,
    fontFamily: 'LexendDeca_700Bold',
    color: COLORS.primary,
    marginRight: 4,
  },
  comboMrpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  comboSavingsText: {
    fontSize: 10,
    color: '#059669',
    fontFamily: 'LexendDeca_600SemiBold',
  },
  comboAddBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: 6,
  },
  comboAddBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'LexendDeca_600SemiBold',
  },
  wellnessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wellnessGridCard: {
    width: '48.5%',
    minHeight: 145,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    justifyContent: 'space-between',
  },
  wellnessIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  wellnessTitle: {
    fontSize: 13,
    fontFamily: 'LexendDeca_700Bold',
    marginTop: 4,
  },
  wellnessSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'LexendDeca_400Regular',
    marginTop: 2,
    lineHeight: 15,
  },
  wellnessExploreText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_600SemiBold',
    marginTop: 8,
  },
  trustBarSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xxxl,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  trustBarRow: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustItemText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_600SemiBold',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  trustDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E8E8EE',
    marginHorizontal: SPACING.md,
  },
  largeStoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    overflow: 'hidden',
  },
  largeStoreImageContainer: {
    height: 175,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F8F8FC',
  },
  largeStoreImage: {
    width: '100%',
    height: '100%',
  },
  largeStoreBookmarkBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeStoreImageBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  largeStoreBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'LexendDeca_600SemiBold',
  },
  largeStoreDotsRow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeStoreDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginLeft: 3,
  },
  largeStoreDotActive: {
    width: 14,
    backgroundColor: '#FFFFFF',
  },
  largeStoreBody: {
    padding: SPACING.md,
  },
  largeStoreHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  largeStoreName: {
    fontSize: 17,
    fontFamily: 'LexendDeca_700Bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  largeStoreRatingPill: {
    backgroundColor: '#00B259',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  largeStoreRatingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'LexendDeca_700Bold',
  },
  largeStoreSubInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  largeStoreSubInfoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'LexendDeca_500Medium',
  },
  verifiedMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  verifiedMiniText: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: 'LexendDeca_600SemiBold',
    marginLeft: 2,
  },
  largeStoreOfferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  largeStoreOfferText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontFamily: 'LexendDeca_600SemiBold',
  },
  largeStoreAddressRow: {
    marginTop: 8,
  },
  largeStoreAddressText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'LexendDeca_400Regular',
  },

  // Reference UI matching styles
  deliverToCaptionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.78)',
    fontFamily: 'LexendDeca_500Medium',
  },
  headerRightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontFamily: 'LexendDeca_700Bold',
  },

  quickFilterTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 22,
    paddingTop: 6,
    paddingBottom: 2,
  },
  quickFilterTabText: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  quickFilterTabTextActive: {
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 1,
  },
  quickFilterTabTextInactive: {
    fontFamily: 'LexendDeca_500Medium',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  activeIndicatorPill: {
    height: 3.5,
    width: 26,
    borderRadius: 2,
    marginTop: 5,
  },
  quickFilterCardRef: {
    width: 74,
    height: 82,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginRight: 8,
  },
  quickFilterCardRefActive: {
    borderWidth: 1.5,
    borderColor: '#3A2986',
  },
  allCategoriesGridIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryTileIconWrapper: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  offersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginTop: 14,
    marginBottom: 6,
  },
  promoCarouselSectionRef: {
    marginTop: 6,
    marginBottom: 6,
  },
  promoCardRef: {
    width: 328,
    height: 168,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promoContentLeft: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  promoTagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  promoTagBadgeText: {
    fontSize: 8.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  promoTitleText: {
    fontSize: 16.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '800',
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  promoSubText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_500Medium',
    opacity: 0.92,
  },
  promoCtaBtnRef: {
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  promoCtaBtnText: {
    fontSize: 11.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
  },
  promoRightVisualCol: {
    width: 92,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBoxRight: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeBoxNumber: {
    fontSize: 13,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 16,
  },
  processCueBadge: {
    width: 82,
    height: 82,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  processCueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
  },
  carouselPageDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  carouselDotRef: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    marginHorizontal: 3.5,
  },
  carouselDotActiveRef: {
    width: 20,
    borderRadius: 4,
    backgroundColor: '#3A2986',
  },

  // Shop by Category — Static Grid styles
  categoryStaticGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginTop: 8,
  },
  catGridCard: {
    width: '23.5%',
    height: 88,
    borderRadius: 16,
    borderWidth: 1,
    padding: 6,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  catIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  catGridName: {
    fontSize: 10.5,
    fontFamily: 'LexendDeca_600SemiBold',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },

  // Shop by Category — Legacy styles
  shopByCatCard: {
    width: 142,
    height: 92,
    borderRadius: 16,
    backgroundColor: '#F5F5F8',
    paddingTop: 12,
    paddingLeft: 12,
    paddingRight: 6,
    paddingBottom: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  shopByCatCardName: {
    fontSize: 12,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#3A2986',
    fontStyle: 'italic',
    zIndex: 2,
  },
  shopByCatCardImage: {
    width: 60,
    height: 52,
    borderRadius: 8,
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
});


