import React from 'react';
import { Text, TextProps } from 'react-native';
import { typography, TypographyVariant } from '@/theme';

export interface ThemedTextProps extends TextProps {
  variant?: TypographyVariant;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  variant = 'body',
  style,
  children,
  ...props
}) => {
  return (
    <Text style={[typography[variant], style]} {...props}>
      {children}
    </Text>
  );
};
