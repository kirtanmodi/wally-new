import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { updateProfile } from "../../redux/slices/userSlice";

export default function PrivacyScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    dataCollection: true,
    locationServices: false,
    marketingEmails: true,
    twoFactorAuth: false,
    biometricLogin: true,
  });

  // Toggle handler
  const toggleSetting = (setting: keyof typeof privacy) => {
    const newValue = !privacy[setting];
    setPrivacy({
      ...privacy,
      [setting]: newValue,
    });

    // Save to user preferences
    dispatch(
      updateProfile({
        preferences: {
          privacy: {
            ...privacy,
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
        <Text style={styles.title}>Privacy & Security</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Data Collection</Text>
              <Text style={styles.settingDescription}>Allow app to collect usage data to improve services</Text>
            </View>
            <Switch
              value={privacy.dataCollection}
              onValueChange={() => toggleSetting("dataCollection")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingDescription}>Allow app to access your location for relevant features</Text>
            </View>
            <Switch
              value={privacy.locationServices}
              onValueChange={() => toggleSetting("locationServices")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Marketing Emails</Text>
              <Text style={styles.settingDescription}>Receive promotional emails about new features</Text>
            </View>
            <Switch
              value={privacy.marketingEmails}
              onValueChange={() => toggleSetting("marketingEmails")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Security Settings</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
              <Text style={styles.settingDescription}>Enable additional security for your account</Text>
            </View>
            <Switch
              value={privacy.twoFactorAuth}
              onValueChange={() => toggleSetting("twoFactorAuth")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Biometric Login</Text>
              <Text style={styles.settingDescription}>Use fingerprint or face recognition to access the app</Text>
            </View>
            <Switch
              value={privacy.biometricLogin}
              onValueChange={() => toggleSetting("biometricLogin")}
              trackColor={{ false: "#E9E9EA", true: "#8A2BE2" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Delete Account Data</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>Your privacy is important to us. Read our full privacy policy for more information.</Text>
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
    marginTop: 8,
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
  actionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8A2BE2",
  },
  disclaimer: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginVertical: 20,
  },
});
