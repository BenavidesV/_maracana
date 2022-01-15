import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';


import {
  Avatar,
  WelcomeImage,
  PageTitle,
  SubTitle,
  StyledFormArea,
  StyledButton,
  InnerContainer,
  WelcomeContainer,
  ButtonText,
  Line,
} from './../components/styles';

// Async storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// credentials context
import { CredentialsContext } from './../components/CredentialsContext';
import TabBar from '../components/TabBar';
import { SafeArea } from 'antd-mobile';

const Welcome = ({ navigation }) => {
  // credentials context
  const { storedCredentials, setStoredCredentials } = useContext(CredentialsContext);

  const { name, email, photoUrl } = storedCredentials;

  const AvatarImg = photoUrl
    ? {
      uri: photoUrl,
    }
    : require('./../assets/img/expo-bg1.png');

  const clearLogin = () => {
    AsyncStorage.removeItem('flowerCribCredentials')
      .then(() => {
        setStoredCredentials("");
      })
      .catch((error) => console.log(error));
  };
  const creating = true;
  return (
    <>
      <StatusBar style="light" />
      <TabBar></TabBar>
    </>
  );
};

export default Welcome;
