import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { updateProfile } from "../../redux/slices/userSlice";

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Notification settings state
  const [notifications, setNotifications] = useState({
    expenseReminders: true,
    budgetAlerts: true,
    weeklyReports: false,
    savingsGoals: true,
    appUpdates: true,
  });

  // Toggle handler
  const toggleSetting = (setting: keyof typeof notifications) => {
    const newValue = !notifications[setting];
    setNotifications({
      ...notifications,
      [setting]: newValue,
    });

    // Save to user preferences
    dispatch(
      updateProfile({
        preferences: {
          notifications: {
            ...notifications,
            [setting]: newValue,
          },
        },
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Expense Reminders</Text>
              <Text style={styles.settingDescription}>Get reminded to track your daily expenses</Text>
            </View>
            <Switch
              value={notifications.expenseReminders}
              onValueChange={() => toggleSetting("expenseReminders")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Budget Alerts</Text>
              <Text style={styles.settingDescription}>Get notified when you&apos;re close to your budget limits</Text>
            </View>
            <Switch
              value={notifications.budgetAlerts}
              onValueChange={() => toggleSetting("budgetAlerts")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>Receive weekly summaries of your financial activity</Text>
            </View>
            <Switch
              value={notifications.weeklyReports}
              onValueChange={() => toggleSetting("weeklyReports")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Savings Goals</Text>
              <Text style={styles.settingDescription}>Get updates on your savings goals progress</Text>
            </View>
            <Switch
              value={notifications.savingsGoals}
              onValueChange={() => toggleSetting("savingsGoals")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>App Updates</Text>
              <Text style={styles.settingDescription}>Get notified about new features and updates</Text>
            </View>
            <Switch
              value={notifications.appUpdates}
              onValueChange={() => toggleSetting("appUpdates")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.disclaimer}>You can change these settings at any time from your profile page.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  rightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#EFEFEF",
  },
  disclaimer: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 30,
  },
});
