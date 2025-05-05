import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { useThemeContext } from "../components/ThemeProvider";
import { ThemeSettings } from "../components/ThemeSettings";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button, Card, Separator, Text, TextInput, View } from "../components/ThemedComponents";

export default function ThemeDemoScreen() {
  const { theme, colors } = useThemeContext();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "Theme Demo",
          headerRight: () => <ThemeToggle showLabel={false} style={styles.headerToggle} />,
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Theme Demo</Text>
        <Text style={styles.subtitle}>
          Current theme: <Text style={{ fontWeight: "bold" }}>{theme}</Text>
        </Text>

        <Separator />

        <ThemeSettings />

        <Text style={styles.sectionTitle}>UI Components Preview</Text>

        <Card>
          <Text style={styles.cardTitle}>Card Component</Text>
          <Text>This is a card with themed styling</Text>
        </Card>

        <Text style={styles.label}>Text Input:</Text>
        <TextInput placeholder="Enter some text" />

        <Text style={styles.label}>Button:</Text>
        <Button title="Press Me" onPress={() => {}} />

        <Card style={styles.colorSwatch}>
          <Text style={styles.cardTitle}>Theme Colors</Text>
          {Object.entries(colors).map(([name, color]) => (
            <View key={name} style={styles.colorRow}>
              <View style={[styles.colorPreview, { backgroundColor: color }]} />
              <Text style={styles.colorName}>{name}</Text>
              <Text style={styles.colorValue}>{color}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  headerToggle: {
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  colorSwatch: {
    marginTop: 24,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  colorName: {
    width: 100,
    fontSize: 14,
    fontWeight: "500",
  },
  colorValue: {
    fontSize: 14,
    opacity: 0.7,
  },
});
