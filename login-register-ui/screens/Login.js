import { View, Text, TextInput, TouchableOpacity, Pressable, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from '../constants/colors';
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import Button from '../components/Button';
import { useForm, Controller } from "react-hook-form";
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../redux/user/actions'
import axios from '../axios';
import * as SecureStore from 'expo-secure-store'

const Login = ({ navigation }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    
    const { control, handleSubmit, formState: { errors } } = useForm();

    const dispatch = useDispatch();
    const user = useSelector((store)=> store.user.user)

    const [form, setForm] = useState({
        email:'',
        password:'',
    })

    const [error, setError] = useState([])
    const login = () => {
        setError([])
        axios.post('login', form).then(async ({ data }) => {
          dispatch(setUser(data.user))
          await SecureStore.setItemAsync('token', data.token)
          navigation.navigate('Driver')
        }).catch((err) => {
          setError(err.response.data.errors)
        })
      }
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <View style={{ flex: 1, marginHorizontal: 22 }}>
                <View style={{ marginVertical: 22 }}>
                    <Text style={{
                        fontSize: 22,
                        fontWeight: 'bold',
                        marginVertical: 12,
                        color: COLORS.black
                    }}>
                        Hi Welcome Back ! 👋 
                    </Text>
                    

                    <Text style={{
                        fontSize: 16,
                        color: COLORS.black
                    }}>Hello again you have been missed!</Text>
                </View>

                <Text style={{color:'red', fontSize: 16 }}>{error?.message ? error.message: ''}</Text>
                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 400,
                        marginVertical: 8
                    }}>Email address</Text>

                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                onBlur={onBlur}
                                onChangeText={(text) =>{form.email = text}}
                                value={value}
                                placeholder='Enter your email address'
                                placeholderTextColor={COLORS.black}
                                keyboardType='email-address'
                                style={{
                                    width: "100%",
                                    height: 48,
                                    borderColor: COLORS.black,
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    paddingLeft: 22
                                }}
                            />
                        )}
                        name="email"
                        rules={{ 
                            required: 'Email address is required', 
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                                message: 'Email is invalid'
                            }
                        }}
                    />
                    <Text style={{color:'red' }}>{error?.email ? error.email[0]: ''}</Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 400,
                        marginVertical: 8
                    }}>Password</Text>

                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <TextInput
                                    onBlur={onBlur}
                                    onChangeText={(text) =>{form.password = text}}
                                    value={value}
                                    placeholder='Enter your password'
                                    placeholderTextColor={COLORS.black}
                                    secureTextEntry={!isPasswordShown}
                                    style={{
                                        width: "100%",
                                        height: 48,
                                        borderColor: COLORS.black,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        paddingLeft: 22
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordShown(!isPasswordShown)}
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: 12
                                    }}
                                >
                                    <Ionicons name={isPasswordShown ? "eye-off" : "eye"} size={24} color={COLORS.black} />
                                </TouchableOpacity>
                            </View>
                        )}
                        name="password"
                        rules={{ 
                            required: 'Password is required', 
                            minLength: {
                                value: 3, 
                                message: 'Password should be minimum of 3 characters long'
                            } 
                        }}
                    />
                    <Text style={{color:'red' }}>{error?.password ? error.password[0]: ''}</Text>
                </View>

                <View style={{
                    flexDirection: 'row',
                    marginVertical: 6
                }}>
                    <Checkbox
                        style={{ marginRight: 8 }}
                        value={isChecked}
                        onValueChange={setIsChecked}
                        color={isChecked ? COLORS.primary : undefined}
                    />

                    <Text>Remember Me</Text>
                </View>

                <Button
                    title="Login"
                    filled
                    style={{
                        marginTop: 18,
                        marginBottom: 4,
                    }}
                    onPress={() => {login() }}
                />

                {/* Or login with */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <View
                        style={{
                            flex: 1,
                            height: 1,
                            backgroundColor: COLORS.grey,
                            marginHorizontal: 10
                        }}
                    />
                    <Text style={{ fontSize: 14 }}>Or Login with</Text>
                    <View
                        style={{
                            flex: 1,
                            height: 1,
                            backgroundColor: COLORS.grey,
                            marginHorizontal: 10
                        }}
                    />
                </View>

                {/* Facebook and Google login */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}>
                    <TouchableOpacity
                        onPress={() => console.log("Pressed")}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            height: 52,
                            borderWidth: 1,
                            borderColor: COLORS.grey,
                            marginRight: 4,
                            borderRadius: 10
                        }}
                    >
                        <Image
                            source={require("../assets/facebook.png")}
                            style={{
                                height: 36,
                                width: 36,
                                marginRight: 8
                            }}
                            resizeMode='contain'
                        />

                        <Text>Facebook</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.log("Pressed")}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            height: 52,
                            borderWidth: 1,
                            borderColor: COLORS.grey,
                            marginRight: 4,
                            borderRadius: 10
                        }}
                    >
                        <Image
                            source={require("../assets/google.png")}
                            style={{
                                height: 36,
                                width: 36,
                                marginRight: 8
                            }}
                            resizeMode='contain'
                        />

                        <Text>Google</Text>
                    </TouchableOpacity>
                </View>

                {/* Don't have an account */}
                <View style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginVertical: 22
                }}>
                    <Text style={{ fontSize: 16, color: COLORS.black }}>Don't have an account ? </Text>
                    <Pressable
                        onPress={() => navigation.navigate("Signup")}
                    >
                        <Text style={{
                            fontSize: 16,
                            color: COLORS.primary,
                            fontWeight: "bold",
                            marginLeft: 6
                        }}>Register</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Login;
