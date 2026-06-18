/// <reference types="nativewind/types" />

// NOTE: This is required to fix TypeScript errors with React Native 0.76+ / Expo SDK 52+
import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface ImagePropsBase {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
    indicatorClassName?: string;
  }
}
