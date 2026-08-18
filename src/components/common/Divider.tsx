import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../theme';

export interface DividerProps {
  color?: string;
  thickness?: number;
  marginVertical?: number;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  color = COLORS.borderLight,
  thickness = 1,
  marginVertical = SPACING.sm,
  style,
}) => {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          height: thickness,
          marginVertical,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
});
