import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { styles } from "../styles";

export default function ChatScreen({
  weatherData = null,
  quakes = [],
  nearestShelter = null,
  placeLabel = "",
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hi, I’m your disaster preparedness assistant. Ask me about floods, earthquakes, storms, fire safety, shelters, weather, or emergency kits.",
      bot: true,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    "How do I prepare for a flood?",
    "What should be in an emergency kit?",
    "Is there any earthquake risk nearby?",
    "Where is the nearest shelter?",
  ];

  async function sendMessage(userText) {
    setMessages((prev) => [...prev, { text: userText, bot: false }]);
    setLoading(true);

    try {
      const response = await fetch("http://192.168.68.115:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          context: {
            weatherData,
            quakes,
            nearestShelter,
            placeLabel,
          },
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          text: data.reply || "Sorry, I could not generate a reply.",
          bot: true,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "The assistant is currently unavailable. Please try again later.",
          bot: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    await sendMessage(userText);
  }

  async function handleQuickQuestion(question) {
    if (loading) return;
    await sendMessage(question);
  }

  return (
    <View style={styles.screenPad}>
      <Text style={styles.sectionTitle}>Safety Assistant</Text>
      <Text style={styles.sectionBody}>
        Ask quick questions about emergency preparation and response.
      </Text>

      <View style={styles.quickQuestionsWrap}>
        {quickQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickQuestionBtn}
            onPress={() => handleQuickQuestion(question)}
          >
            <Text style={styles.quickQuestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.chatMessages}
        contentContainerStyle={styles.chatMessagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.chatBubble,
              msg.bot ? styles.chatBubbleBot : styles.chatBubbleUser,
            ]}
          >
            <Text
              style={[
                styles.chatBubbleText,
                msg.bot ? styles.chatBubbleTextBot : styles.chatBubbleTextUser,
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.chatBubble, styles.chatBubbleBot]}>
            <ActivityIndicator />
          </View>
        )}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TextInput
          style={styles.chatInput}
          placeholder="Ask something..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSend}>
          <Text style={styles.primaryButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}