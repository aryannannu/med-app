import { NavigatorScreenParams } from '@react-navigation/native';
import { Medicine } from './medicine';
import { Pharmacy } from './pharmacy';
import { PharmacyOffer } from './offer';
import { Order } from './order';
import { Address } from './user';
import { WalletTransaction } from './wallet';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  LocationPermission: undefined;
  Login: undefined;
  OtpVerification: { phoneNumber: string };
};

export type BottomTabParamList = {
  HomeTab: undefined;
  OrdersTab: undefined;
  SearchTab: { initialQuery?: string; categorySlug?: string } | undefined;
  CategoriesTab: undefined;
  ProfileTab: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  CategoryListing: { categorySlug: string; categoryName?: string };
  MedicineDetails: { medicineId: string; medicine?: Medicine };
  PharmacyListing: { categorySlug?: string };
  PharmacyDetail: { pharmacyId: string; pharmacy?: Pharmacy };
  Cart: undefined;
  UploadPrescription: { fromCart?: boolean };
  AddressSelection: { isSelectingForCheckout?: boolean };
  AddEditAddress: { address?: Address };
  CheckoutReview: undefined;
  FindingPharmacies: { cartId: string };
  OfferComparison: { cartId: string };
  OrderDetails: { orderId: string; order?: Order };
  Notifications: undefined;
  Search: { initialQuery?: string; categorySlug?: string } | undefined;
  Profile: undefined;

  // Profile Module Routes
  EditProfile: undefined;
  Wallet: undefined;
  AddMoney: { prefilledAmount?: number } | undefined;
  WalletTransactionDetails: { transactionId: string; transaction: WalletTransaction };
  PaymentMethods: undefined;
  SavedPharmacies: undefined;
  Appearance: undefined;
  NotificationPreferences: undefined;
  PrivacySecurity: undefined;
  HelpCenter: undefined;
  HelpArticle: { articleId: string };
  ContactSupport: { orderId?: string } | undefined;
  SupportChat: { orderId?: string; topic?: string } | undefined;
  ReportIssue: { category?: string; orderId?: string } | undefined;
  LegalDocument: { docType: 'terms' | 'privacy' | 'refund' | 'medicine_policy' };
  DeleteAccount: undefined;
  OrderInvoice: { orderId: string };
  OrderConfirmation: { order: Order };
  HeaderShowcase: undefined;
  ProductCardShowcase: undefined;
  BrandDetail: {
    brandId: string;
    brandName: string;
    brandQuery: string;
    brandBg?: string;
    brandImage?: string;
    brandCount?: string;
  };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};
