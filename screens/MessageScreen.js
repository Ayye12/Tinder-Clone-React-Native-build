import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  Button,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Keyboard,
} from "react-native";
import React, { useEffect } from "react";
import { Header } from "../components/Header";
import getMatchedUserInfo from "../lib/getMatchedUserInfo";
import useAuth from "../hooks/useAuth";
import { useRoute } from "@react-navigation/native";
import tw from "tailwind-rn";
import SenderMessage from "../components/SenderMessage";
import ReceiverMessage from "../components/ReceiveMessage";
import { addDoc, collection } from "@firebase/firestore";
import { db } from "../firebase";
import { serverTimestamp } from "@firebase/firestore";

const MessageScreen = () => {
  const { user } = useAuth();
  const { params } = useRoute();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const { matchDetails } = params;

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches", matchDetails.id, "messages"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) =>
          setMessages(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          )
      )[(matchDetails, db)]
  );

  const sendMessage = () => {
    addDoc(collection(db, "matches", matchDetails.id, "messages"), {
      timestamp: serverTimestamp(),
      userId: user.uid,
      displayName: user.displayName,
      photoUrl: matchDetails.users[user.uid].photoUrl,
      message: input,
    });

    setInput("");
  };

  return (
    <SafeAreaView style={tw("flex-1")}>
      <Header
        title={getMatchedUserInfo(matchDetails.users, user.uid).displayName}
        callEnabled
      />
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={tw("flex-1")}
        keyboardVerticalOffset={10}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            inverted={-1}
            style={tw("pl-4")}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
              message.userId === user.uid ? (
                <SenderMessage key={message.id} message={message} />
              ) : (
                <ReceiverMessage key={message.id} message={message} />
              )
            }
          />
        </TouchableWithoutFeedback>
        <View
          style={tw(
            "flex-row justify-between bg-white items-center border-t border-gray-200 px-5 py-2"
          )}
        >
          <TextInput
            style={tw("h-10 text-lg")}
            placeholder="Send Message..."
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            value={input}
          />
          <Button onPress={sendMessage} title="Send" color="#FF5864" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessageScreen;
