import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import { BottomTabNavigator } from './BottomTabNavigator';
import { CategoryListingScreen } from '../screens/medicines/CategoryListingScreen';
import { MedicineDetailsScreen } from '../screens/medicines/MedicineDetailsScreen';
import { PharmacyListingScreen } from '../screens/pharmacies/PharmacyListingScreen';
import { PharmacyDetailScreen } from '../screens/pharmacies/PharmacyDetailScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { UploadPrescriptionScreen } from '../screens/prescriptions/UploadPrescriptionScreen';
import { AddressSelectionScreen } from '../screens/checkout/AddressSelectionScreen';
import { AddEditAddressScreen } from '../screens/checkout/AddEditAddressScreen';
import { CheckoutReviewScreen } from '../screens/checkout/CheckoutReviewScreen';
import { FindingPharmaciesScreen } from '../screens/offers/FindingPharmaciesScreen';
import { OfferComparisonScreen } from '../screens/offers/OfferComparisonScreen';
import { OrderDetailsScreen } from '../screens/orders/OrderDetailsScreen';
import { OrderInvoiceScreen } from '../screens/orders/OrderInvoiceScreen';
import { OrderConfirmationScreen } from '../screens/orders/OrderConfirmationScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { WalletScreen } from '../screens/profile/WalletScreen';
import { AddMoneyScreen } from '../screens/profile/AddMoneyScreen';
import { WalletTransactionDetailsScreen } from '../screens/profile/WalletTransactionDetailsScreen';
import { PaymentMethodsScreen } from '../screens/profile/PaymentMethodsScreen';
import { SavedPharmaciesScreen } from '../screens/profile/SavedPharmaciesScreen';
import { AppearanceScreen } from '../screens/profile/AppearanceScreen';
import { NotificationPreferencesScreen } from '../screens/profile/NotificationPreferencesScreen';
import { PrivacySecurityScreen } from '../screens/profile/PrivacySecurityScreen';
import { HelpCenterScreen } from '../screens/profile/HelpCenterScreen';
import { HelpArticleScreen } from '../screens/profile/HelpArticleScreen';
import { ContactSupportScreen } from '../screens/profile/ContactSupportScreen';
import { SupportChatScreen } from '../screens/profile/SupportChatScreen';
import { ReportIssueScreen } from '../screens/profile/ReportIssueScreen';
import { LegalDocumentScreen } from '../screens/profile/LegalDocumentScreen';
import { DeleteAccountScreen } from '../screens/profile/DeleteAccountScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { HeaderShowcaseScreen } from '../screens/dev/HeaderShowcaseScreen';
import { BrandDetailScreen } from '../screens/brands/BrandDetailScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="CategoryListing" component={CategoryListingScreen} />
      <Stack.Screen name="MedicineDetails" component={MedicineDetailsScreen} />
      <Stack.Screen name="PharmacyListing" component={PharmacyListingScreen} />
      <Stack.Screen name="PharmacyDetail" component={PharmacyDetailScreen} />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="UploadPrescription"
        component={UploadPrescriptionScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="AddressSelection" component={AddressSelectionScreen} />
      <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />
      <Stack.Screen name="CheckoutReview" component={CheckoutReviewScreen} />
      <Stack.Screen
        name="FindingPharmacies"
        component={FindingPharmaciesScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="OfferComparison"
        component={OfferComparisonScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="OrderInvoice" component={OrderInvoiceScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* Dev / Design System Routes */}
      <Stack.Screen name="HeaderShowcase" component={HeaderShowcaseScreen} />
      <Stack.Screen name="BrandDetail" component={BrandDetailScreen} />

      {/* Profile Module Sub-Routes */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
      <Stack.Screen name="WalletTransactionDetails" component={WalletTransactionDetailsScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="SavedPharmacies" component={SavedPharmaciesScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="HelpArticle" component={HelpArticleScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="SupportChat" component={SupportChatScreen} />
      <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
      <Stack.Screen name="LegalDocument" component={LegalDocumentScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
};
