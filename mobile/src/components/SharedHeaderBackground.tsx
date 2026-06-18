import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Tokens } from '../theme';
import { useSettings } from '../context/SettingsContext';

type GradientColors = React.ComponentProps<typeof LinearGradient>['colors'];

type SharedHeaderBackgroundProps = {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    className?: string;
    colors?: GradientColors;
    decorative?: boolean;
    forceGradient?: boolean;
};

const defaultColors: GradientColors = [
    Tokens.color.green[300],
    Tokens.color.green[400],
];

const SharedHeaderBackground: React.FC<SharedHeaderBackgroundProps> = ({
    children,
    style,
    className,
    colors = defaultColors,
    decorative = true,
    forceGradient = false,
}) => {
    const { appearance } = useSettings();

    const isNature = appearance === 'nature';
    const hideGradient = isNature && !forceGradient;

    const finalColors = hideGradient ? (['transparent', 'transparent'] as GradientColors) : colors;
    const finalDecorative = hideGradient ? false : decorative;

    return (
        <LinearGradient
            colors={finalColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={style}
            className={['overflow-hidden', className].filter(Boolean).join(' ')}
        >
            {finalDecorative ? (
                <View className="absolute inset-0" pointerEvents="none">
                    <View className="absolute rounded-full bg-[rgba(255,255,255,0.12)] w-[210px] h-[210px] -top-[88px] -right-[72px]" />
                    <View className="absolute rounded-full bg-[rgba(255,255,255,0.08)] w-[128px] h-[128px] -bottom-[52px] -left-[34px]" />
                    <View className="absolute w-[44px] h-[18px] rounded-tl-[24px] rounded-br-[24px] bg-[rgba(255,255,255,0.11)] top-[42px] left-[24px] -rotate-[18deg]" />
                    <View className="absolute w-[44px] h-[18px] rounded-tl-[24px] rounded-br-[24px] bg-[rgba(255,255,255,0.11)] right-[34px] bottom-[26px] rotate-[22deg]" />
                </View>
            ) : null}

            {children}
        </LinearGradient>
    );
};

export default SharedHeaderBackground;
