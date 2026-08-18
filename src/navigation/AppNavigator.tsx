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
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SearchScreen } from '../screens/search/SearchScreen';

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
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};
