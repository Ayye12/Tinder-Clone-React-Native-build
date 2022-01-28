import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
  cardIndex,
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import useAuth from "../hooks/useAuth";
import tw from "tailwind-rn";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  collection,
} from "@firebase/firestore";
import generateId from "../lib/generateId";

const DUMMY_DATA = [
  {
    firstName: "Ayoub",
    lastName: " Boujrad",
    job: "Software Developer",
    photoURL: "https://avatars.githubusercontent.com/u/24712956?v=4",
    age: 25,
    id: 123,
  },
  {
    firstName: "Elon",
    lastName: " Musk",
    job: "Entrepreneur",
    photoURL:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Elon_Musk_2015.jpg/408px-Elon_Musk_2015.jpg",
    age: 50,
    id: 124,
  },
  {
    firstName: "Susanne",
    lastName: " Bach",
    job: "Nurse Specialist",
    photoURL:
      "http://4.bp.blogspot.com/-yRK-oavoXYw/Ty_BLGDmGBI/AAAAAAAAHDY/Xm_rufhoZZU/s1600/images.jpg",
    age: 25,
    id: 125,
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const swipeRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  //Tar oss till modal om det är ny users som inte har någon profil
  useLayoutEffect(
    () =>
      onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (!snapshot.exists()) {
          navigation.navigate("Modal");
        }
      }),
    []
  );

  useEffect(() => {
    let unsub;

    const fetchCards = async () => {
      const passes = getDocs(collection(db, "users", user.uid, "passes")).then(
        //Vi går in i tabellen, db --> users --> user.uid --> passes.
        (snapshot) => snapshot.docs.map((doc) => doc.id)
      );

      const swipes = getDocs(collection(db, "users", user.uid, "swipes")).then(
        //Vi går in i tabellen, db --> users --> user.uid --> passes.
        (snapshot) => snapshot.docs.map((doc) => doc.id)
      );

      const passedUserIds = passes.length > 0 ? passes : ["test"];
      const swipedUserIds = swipes.length > 0 ? swipes : ["test"];

      unsub = onSnapshot(
        query(
          collection(db, "users"),
          where("id", "not-in", [...passedUserIds, ...swipedUserIds])
        ),
        (snapshot) => {
          setProfiles(
            snapshot.docs
              .filter((doc) => doc.id !== user.uid)
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
          );
        }
      );
    };

    fetchCards();
    return unsub;
  }, []);

  const swipeLeft = (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    const loggedInProfile = await(await getDocs(db, "users", user.uid)).data();

    //check if users swapped on you--------------
    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          //users has matched with you befre you matched with them........
          //Create a match
          console.log(`Hoooray!! You Matched with ${userSwiped.displayName}`);

          setDoc(
            doc(db, "users", user.uid, "passes", userSwiped.id),
            userSwiped
          );
          //CREATE a match!
          setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid]: loggedInProfile,
              [userSwiped.id]: userSwiped,
            },
            usersMatched: [user.uid, userSwiped, id],
            timestamp: serverTimestamp(),
          });
          //when you navigate you can actually pass info as well as a prop
          navigation.navigate("Match", {
            loggedInProfile,
            userSwiped,
          });
        } else {
          //User has swiped as first interaction between the two or didnt get swiped on.....
          console.log(
            `You swiped on ${userSwiped.displayName} (${userSwiped.job})`
          );
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );
        }
      }
    );
  };

  const swipeRight = async (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];

    console.log(`You swiped on ${userSwiped.displayName} (${userSwiped.job})`);
    setDoc(doc(db, "users", user.uid, "swipes", userSwiped.id), userSwiped);
  };

  return (
    <SafeAreaView style={tw("flex-1")}>
      {/*Header */}
      <View style={tw("flex-row items-center justify-between relative px-5")}>
        {/*Istället för designa Tochableopacities så kna lägga felex-row och justifiy-between i viewn */}

        <TouchableOpacity onPress={logout}>
          <Image
            style={tw("h-10 w-10 rounded-full")}
            source={{ uri: user.photoURL }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
          <Image
            style={tw("h-12 w-12 rounded-full")}
            source={require("../tinderlogo.png.png")}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color="#FF5864" />
        </TouchableOpacity>
      </View>
      {/*End of Header*/}

      {/*Cards*/}
      <View style={tw("flex-1 -mt-6")}>
        <Swiper
          ref={swipeRef}
          containerStyle={{ backgroundColor: "transparent" }}
          cards={profiles}
          stackSize={5}
          cardIndex={0}
          animateCardOpacity //opacity of the image changes when swping all the way
          verticalSwipe={false}
          onSwipedLeft={() => {
            console.log("Swipe PASS");
            swipeLeft(cardIndex);
          }}
          onSwipedRight={() => {
            console.log("Swipe MATCH");
            swipeRight(cardIndex);
          }}
          backgroundColor={"#4FD0E9"}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  textAlign: "right",
                  color: "red",
                },
              },
            },
            right: {
              title: "MATCH",
              style: {
                label: {
                  color: "#4DED30",
                },
              },
            },
          }}
          renderCard={(card) =>
            card ? (
              <View
                key={card.id}
                style={tw(" relative bg-white h-3/4 rounded-xl")}
              >
                <Image
                  style={tw("absolute top-0 h-full w-full rounded-xl")}
                  source={{ url: card.photoURL }}
                />
                <View
                  style={[
                    tw(
                      "absolute bottom-0 bg-white w-full flex-row justify-between items-center h-20 px-6 py-2 rounded-b-xl"
                    ),
                    styles.cardshadow,
                  ]}
                >
                  <View>
                    <Text style={tw("text-xl font-bold")}>
                      {card.displayName}
                    </Text>
                    <Text>{card.job}</Text>
                  </View>
                  <Text style={tw("text-2xl font-bold")}>{card.age}</Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  tw(
                    "relative bg-white h-3/4 rounded-xl justify-center items-center"
                  ),
                  styles.cardshadow,
                ]}
              >
                <Text style={tw("font-bold pb-5")}>No more profiles</Text>
                <Image
                  style={tw("h-20 w-full")}
                  height={100}
                  width={100}
                  source={{ uri: "https://links.papareact.com/6gb" }}
                />
              </View>
            )
          }
        />
      </View>

      <View style={tw("flex flex-row justify-evenly")}>
        <TouchableOpacity
          onPress={() => swipeRef.current.swipeLeft()}
          style={tw(
            "items-center justify-center rounded-full w-16 h-16 bg-red-200"
          )}
        >
          <Entypo name="cross" size={24} color="red" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swipeRef.current.swipeRight()}
          style={tw(
            "items-center justify-center rounded-full w-16 h-16 bg-green-200"
          )}
        >
          <AntDesign name="heart" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  cardshadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
});
