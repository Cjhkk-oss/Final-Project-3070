import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles";

export default function SectionCard({
  title,
  subtitle,
  children,
  style,
  titleStyle,
  bodyStyle,
}) {
  return (
    <View style={[styles.card, styles.sectionCard, style]}>
      {title ? (
        <Text style={[styles.cardTitle, titleStyle]}>
          {title}
        </Text>
      ) : null}

      {subtitle ? (
        <Text style={[styles.cardBody, styles.sectionCardSubtitle, bodyStyle]}>
          {subtitle}
        </Text>
      ) : null}

      {children}
    </View>
  );
}