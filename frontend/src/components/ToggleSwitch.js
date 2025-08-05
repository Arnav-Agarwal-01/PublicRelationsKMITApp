/**
 * Custom Toggle Switch component for student/council selection
 * Modern design with smooth animations
 */

import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const ToggleSwitch = ({ 
  options = ['Student', 'Council'], 
  selectedIndex = 0, 
  onToggle,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.toggleContainer}>
        <View
          style={[
            styles.slider,
            { left: selectedIndex === 0 ? 2 : 102 }
          ]}
        />
        {options.map((option, index) => (
          <TouchableOpacity
            key={option}
            style={styles.option}
            onPress={() => onToggle(index)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                selectedIndex === index && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 25,
    padding: 2,
    position: 'relative',
    width: 200,
    height: 50,
  },
  slider: {
    position: 'absolute',
    top: 2,
    width: 96,
    height: 46,
    backgroundColor: colors.accent,
    borderRadius: 23,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    zIndex: 1,
  },
  optionText: {
    ...typography.body1,
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 14,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default ToggleSwitch;