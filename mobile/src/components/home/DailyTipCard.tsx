import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Tokens } from '../../theme';
import EnvironmentCuateSvg from './EnvironmentCuateSvg';
import { DailyTipResponse } from '../../services/tips';

interface DailyTipCardProps {
  dailyTip: DailyTipResponse;
}

const DailyTipCard: React.FC<DailyTipCardProps> = ({ dailyTip }) => {
  return (
    <View style={{ marginHorizontal: Tokens.space[5], marginTop: 80, marginBottom: Tokens.space[6], overflow: 'visible', position: 'relative' }}>
      <LinearGradient
        colors={[Tokens.color.green[200], Tokens.color.green[300]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-5 py-6"
        style={{
          borderRadius: 20,
          paddingRight: 190,
          minHeight: 180,
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        <Text 
          className="text-[16px] font-extrabold mb-1.5 leading-snug"
          style={{ color: Tokens.color.green[800] }}
        >
          {dailyTip.title}
        </Text>
        <Text 
          className="text-[12px] font-semibold leading-[18px]"
          style={{ color: Tokens.color.green[700] }}
        >
          {dailyTip.content}
        </Text>
      </LinearGradient>
      
      <View
        style={{
          position: 'absolute',
          right: -15,
          top: -75,
          width: 220,
          height: 220,
          zIndex: 10,
        }}
      >
        <EnvironmentCuateSvg width="100%" height="100%" />
      </View>
    </View>
  );
};

export default DailyTipCard;
