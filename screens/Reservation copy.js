import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import '../assets/index.css';
import { scheduleData } from '../assets/datasource';
import { ScheduleComponent, ViewsDirective, ViewDirective, Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
import { CalendarComponent } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
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
} from '../components/styles';

// Async storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// credentials context
import { CredentialsContext } from '../components/CredentialsContext';
import { Default } from '../components/Calendar';
/************************/
import {
  AvailabilityCalendar,
  AvailabilityEvent,
  MsSinceMidnightRange,
  Booking,
  Range,
  CalendarThemeProp,
} from 'react-availability-calendar';
import moment from 'moment';
 
import 'bootstrap/dist/css/bootstrap.min.css';
 
const msInHour = 60 * 60 * 1000;
 
  const now = new Date();
 
  const onAvailabilitySelected = (a: AvailabilityEvent) =>
    console.log('Availability slot selected: ', a);
 
  const onChangedCalRange = (r: Range) =>
    console.log('Calendar range selected (fetch bookings here): ', r);
 
  const blockOutPeriods: MsSinceMidnightRange[] = [
    [0 * msInHour, 9 * msInHour],
    [19 * msInHour, 24 * msInHour],
  ];
 
  const bookings: Booking[] = [
    {
      startDate: new Date(2020, 2, 1, 19),
      endDate: new Date(2020, 2, 1, 20),
    },
    {
      startDate: new Date(2020, 2, 1, 16, 30),
      endDate: new Date(2020, 2, 1, 17),
    },
  ];
 
  const providerTimeZone = 'America/New_York';
 
/********************* */


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
        navigation.navigate('Login');
      })
      .catch((error) => console.log(error));
  };

  return (
    <>
      <StatusBar style="light" />
      <InnerContainer>
        <WelcomeImage resizeMode="cover" source={require('./../assets/img/swimmer.jpg')} />

        <WelcomeContainer>
          <PageTitle welcome={true}>Reservación</PageTitle>
          <SubTitle welcome={true}>{name || 'Usuario'}</SubTitle>
          <SubTitle welcome={true}>{email || 'cuenta@gmail.com'}</SubTitle>

          <StyledFormArea>
            <Avatar resizeMode="cover" source={AvatarImg} />

            <Line />
            
            <StyledButton onPress={clearLogin}>
              <ButtonText>Logout</ButtonText>
            </StyledButton>
            <StyledButton onPress={() => navigation.navigate('Welcome')}>
              <ButtonText>Home</ButtonText>
            </StyledButton>
          </StyledFormArea>
        </WelcomeContainer>
        <div style={{ width: 350 }}>
      <AvailabilityCalendar
        bookings={bookings}
        providerTimeZone={providerTimeZone}
        moment={moment}
        initialDate={now}
        onAvailabilitySelected={onAvailabilitySelected}
        onCalRangeChange={onChangedCalRange}
        blockOutPeriods={blockOutPeriods}
        pass theme={{requestAppointmentLabel: "Solicitando reserva"}}
      />
    </div>
      </InnerContainer>
    </>
  );
};

export default Welcome;
