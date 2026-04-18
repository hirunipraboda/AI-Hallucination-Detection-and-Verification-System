import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { FeedbackForm } from "./components/FeedbackForm";
import { FeedbackDashboard } from "./components/FeedbackDashboard";
import { styles, C } from "./styles/feedback.styles";

export default function FeedbackSystem() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("form");

  const tabs = [
    { key: "form", label: "Submit" },
    { key: "history", label: "History" },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => {}}>
          <Text style={styles.headerBackText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Feedback</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          marginBottom: 4,
          backgroundColor: "#161b22",
          borderRadius: 12,
          padding: 4,
          borderWidth: 1,
          borderColor: "#1e2a38",
        }}
      >
        {tabs.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 9,
              alignItems: "center",
              backgroundColor: activeTab === key ? C.teal + "22" : "transparent",
              borderWidth: activeTab === key ? 1 : 0,
              borderColor: activeTab === key ? C.tealBorder : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: activeTab === key ? C.teal : C.textMuted,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "form" ? (
        <FeedbackForm
          onSubmitted={() => {
            setRefreshKey((k) => k + 1);
            setActiveTab("history");
          }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: 12 }]}
          showsVerticalScrollIndicator={false}
        >
          <FeedbackDashboard refresh={refreshKey} />
        </ScrollView>
      )}
    </View>
  );
}