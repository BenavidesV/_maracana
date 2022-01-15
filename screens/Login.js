import React, { useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';

// formik
import { Formik } from 'formik';
import { Image, Space } from 'antd-mobile'
import {
  StyledContainer,
  PageLogo,
  PageTitle,
  SubTitle,
  StyledInputLabel,
  StyledFormArea,
  StyledButton,
  StyledTextInput,
  LeftIcon,
  RightIcon,
  InnerContainer,
  ButtonText,
  MsgBox,
  Line,
  ExtraView,
  ExtraText,
  TextLink,
  TextLinkContent,
  Colors,
} from './../components/styles';
import { View, ActivityIndicator } from 'react-native';

//colors
const { darkLight, brand, primary } = Colors;

// icon
import { Octicons, Fontisto, Ionicons } from '@expo/vector-icons';

// keyboard avoiding view
import KeyboardAvoidingWrapper from './../components/KeyboardAvoidingWrapper';

// api client
import axios from 'axios';

// Async storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// credentials context
import { CredentialsContext } from './../components/CredentialsContext';

const Login = ({ navigation }) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [message, setMessage] = useState();
  const [messageType, setMessageType] = useState();

  // credentials context
  const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext);

  const handleLogin = (credentials, setSubmitting) => {
    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userRole
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: credentials.email,
        password: credentials.password
      }
    };
    handleMessage(null);
  
    const url = 'https://api-swimming.herokuapp.com/graphql';//https://whispering-headland-00232.herokuapp.com/user/signin
  
    fetch
      (url,{
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => response.json())
        .then((response) => {
          if (response.hasOwnProperty('errors')) {
            let error_message=response.errors[0].message;
            setSubmitting(false);
            switch (error_message) {
              case 'Password is incorrect!':
                handleMessage('Las credenciales no corresponden con nuestros registros');    
                break;
                case 'User does not exist!':
                  handleMessage('El usuario no aparece en nuestros registros');    
                  break;
              default:
                handleMessage('Houston tenemos un problema');
                break;
            }
          }
          console.log("response.json: "+response.data.login.userId)
          persistLogin({ ...response.data.login }, message, response.status);
        })
        .catch((errors)=>{
          
          
        })
        
      .catch((error) => {
        setSubmitting(false);
        console.log("Desde el catch: "+error)
      })
  };
  
  const handleMessage = (message, type = '') => {
    setMessage(message);
    setMessageType(type);
  };

  // Persisting login
  const persistLogin = (credentials, message, status) => {
    AsyncStorage.setItem('flowerCribCredentials', JSON.stringify(credentials))
      .then(() => {
        handleMessage(message, status);
        setStoredCredentials(credentials);
      })
      .catch((error) => {
        handleMessage('Ha ocurrido un error');
        console.log(error);
      });
  };

  return (
    <KeyboardAvoidingWrapper>
      <StyledContainer>
        <StatusBar style="dark" />
        <InnerContainer>
          <Image src={require('./../assets/img/natacioncq.png')} width={100} height={100} />
          <PageLogo resizeMode="cover" source={require('./../assets/img/natacioncq.png')} />
          
          <SubTitle>Inicio de sesión</SubTitle>

          <Formik
            initialValues={{ email: '', password: '' }}
            onSubmit={(values, { setSubmitting }) => {
              if (values.email == '' || values.password == '') {
                handleMessage('Por favor llene todos los campos');
                setSubmitting(false);
              } else {
                handleLogin(values, setSubmitting);
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, isSubmitting }) => (
              <StyledFormArea>
                <MyTextInput
                  label="Email"
                  placeholder="andyj@gmail.com"
                  placeholderTextColor={darkLight}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  icon="mail"
                />
                <MyTextInput
                  label="Contraseña"
                  placeholder="* * * * * * * *"
                  placeholderTextColor={darkLight}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry={hidePassword}
                  icon="lock"
                  isPassword={true}
                  hidePassword={hidePassword}
                  setHidePassword={setHidePassword}
                />
                <MsgBox type={messageType}>{message}</MsgBox>

                {!isSubmitting && (
                  <StyledButton onPress={handleSubmit}>
                    <ButtonText>Login</ButtonText>
                  </StyledButton>
                )}
                {isSubmitting && (
                  <StyledButton disabled={true}>
                    <ActivityIndicator size="large" color={primary} />
                  </StyledButton>
                )}

                <Line />

                <ExtraView>
                  <ExtraText>¿Aún no tiene cuenta? </ExtraText>
                  <TextLink onPress={() => navigation.navigate('Signup')}>
                    <TextLinkContent>Registrarse</TextLinkContent>
                  </TextLink>
                </ExtraView>
              </StyledFormArea>
            )}
          </Formik>
        </InnerContainer>
      </StyledContainer>
    </KeyboardAvoidingWrapper>
  );
};

const MyTextInput = ({ label, icon, isPassword, hidePassword, setHidePassword, ...props }) => {
  return (
    <View>
      <LeftIcon>
        <Octicons name={icon} size={30} color={brand} />
      </LeftIcon>
      <StyledInputLabel>{label}</StyledInputLabel>
      <StyledTextInput {...props} />
      {isPassword && (
        <RightIcon
          onPress={() => {
            setHidePassword(!hidePassword);
          }}
        >
          <Ionicons name={hidePassword ? 'md-eye-off' : 'md-eye'} size={30} color={darkLight} />
        </RightIcon>
      )}
    </View>
  );
};

export default Login;
