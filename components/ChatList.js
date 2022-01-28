import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import tw from "tailwind-rn";
import { onSnapshot, query, where, collection } from "@firebase/firestore";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import ChatRow from "../components/ChatRow";

//Array of matches, vi ska ta fram alla som matcher
const ChatList = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useAuth();

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches"),
          where("usersMatched", "array-contains", user.uid)
        ),
        (snapshot) =>
          setMatches(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          )
      ),
    [user]
  );

  return matches.length > 0 ? (
    <FlatList
      style={tw("h-full")}
      data={matches}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatRow matcheDetails={item} />}
    />
  ) : (
    <View style={tw("p-5")}>
      <Text style={tw("text-center text-lg")}>No matches at the moment...</Text>
    </View>
  );
};

export default ChatList;
