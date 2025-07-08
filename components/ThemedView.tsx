import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  backgroundColor?: string;
};

export function ThemedView({ style, lightColor, backgroundColor, ...otherProps }: ThemedViewProps) {
  return (
    <View 
      style={[
        { backgroundColor: backgroundColor || lightColor || '#ffffff' },
        style
      ]} 
      {...otherProps} 
    />
  );
}
