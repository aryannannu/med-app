import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { useAppTheme } from '../../store/ThemeContext';

export interface HealitLogoProps {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover';
}

export const HealitLogo: React.FC<HealitLogoProps> = ({
  width = 140,
  height = 42,
  style,
  resizeMode = 'contain',
}) => {
  const { colors } = useAppTheme();
  return (
    <Image
      source={require('../../../assets/healit_logo.png')}
      style={[
        {
          width,
          height,
        },
        style,
      ]}
      resizeMode={resizeMode}
    />
  );
};



