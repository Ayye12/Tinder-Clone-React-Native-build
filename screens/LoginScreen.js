import React from 'react'
import { useNavigation } from "@react-navigation/core";
import { View, Text, Button, ImageBackground, TouchableOpacity } from 'react-native'
import { useLayoutEffect } from 'react';
import useAuth from '../hooks/useAuth';
import tw from 'tailwind-rn';


const LoginScreen = () => {
    const {signInWithGoogle, loading } = useAuth();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
    });
}, []);

    return (
        <View style={tw("flex-1")}>
            <ImageBackground
            resizeMode='cover'
            style={tw("flex-1")}
            source={{ uri: "https://tinder.com/static/tinder.png" }}
            >
                <TouchableOpacity 
                style={[tw("absolute bottom-40 bg-white p-4 rounded-2xl w-52"),
                {marginHorizontal:"25%" },
            ]}
            onPress={signInWithGoogle}
                >
                    <Text 
                    style={tw("font-semibold text-center")}
                    >
                        Sign in & get swiping
                    
                    </Text>
                </TouchableOpacity>
                <Text>Sign in Start Swiping</Text>
            </ImageBackground>
        </View>
    );
};

export default LoginScreen;
