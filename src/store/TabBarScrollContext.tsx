import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Animated, NativeSyntheticEvent, NativeScrollEvent, Easing } from 'react-native';

interface TabBarScrollContextType {
  isCollapsed: boolean;
  collapseAnim: Animated.Value;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  setCollapsed: (collapsed: boolean) => void;
}

const TabBarScrollContext = createContext<TabBarScrollContextType | undefined>(undefined);

export const TabBarScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollThreshold = 14;

  useEffect(() => {
    Animated.timing(collapseAnim, {
      toValue: isCollapsed ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isCollapsed, collapseAnim]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    if (currentScrollY <= 25) {
      // At the top of screen -> expand
      setIsCollapsed(false);
    } else if (diff > scrollThreshold && currentScrollY > 50) {
      // Scrolling down -> collapse smoothly
      setIsCollapsed(true);
    } else if (diff < -scrollThreshold) {
      // Scrolling up -> expand smoothly
      setIsCollapsed(false);
    }

    lastScrollY.current = currentScrollY;
  }, [scrollThreshold]);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  return (
    <TabBarScrollContext.Provider
      value={{
        isCollapsed,
        collapseAnim,
        onScroll,
        setCollapsed,
      }}
    >
      {children}
    </TabBarScrollContext.Provider>
  );
};

export const useTabBarScroll = () => {
  const context = useContext(TabBarScrollContext);
  if (!context) {
    throw new Error('useTabBarScroll must be used within a TabBarScrollProvider');
  }
  return context;
};
