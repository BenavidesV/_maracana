import React, { useContext, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import moment from 'moment';
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
import {Text, View, Switch, Platform, StyleSheet} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
//react-native-date-picker has problems
//import DatePicker from 'react-native-date-picker'
import MonthYearPicker from 'react-native-simple-month-year-picker';
// Async storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// credentials context
import { CredentialsContext } from './../components/CredentialsContext';
import 'react-day-picker/lib/style.css';
import { Button } from '@ant-design/react-native';
import "react-datepicker/dist/react-datepicker.css";
const Event = ({ navigation }) => {
  // credentials context
  const { storedCredentials, setStoredCredentials } = useContext(CredentialsContext);
  const [day, setDay] = useState('1');
  const {email, photoUrl, userId } = storedCredentials;
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [weekday, setWeekDay] = useState(1);
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  //Test
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isReiterative, setIsReiterative] = useState(false);
  const toggleSwitch = () => setIsReiterative(previousState => !previousState);

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };

  ////////
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
  const creating=true;
  const datePickerCatcher=(event)=>{
    console.log("Fecha seleccionada: "+event.target.value);
    var newDate_=new Date(event.target.value);    
    setDate(moment(event.target.value).format('YYYY-MM'));
  };
  const specificDatePickerCatcher=(event)=>{
    console.log("Fecha seleccionada: "+event.target.value);    
    setDate(event.target.value);
  };
  
  const handleChange=(e)=>{
    switch (e.target.id) {
      case "description":
        setDescription(e.target.value);
        break;
        case "time":
          setTime(e.target.value);
          console.log("cambio la hora: "+moment(date+ ' '+ e.target.value).format('YYYY-MM-DD HH:mm'));
          break;
          case "capacity":
            setCapacity(e.target.valueAsNumber);
            break;
            case "title":
            setTitle(e.target.value);
            break;
            case "weekday":
            setWeekDay(e.target.value);
            break;
      default:
        break;
    }
    console.log("handleChange: "+e.target.id +"*"+e.target.value+"*time"+time)
  }
  const runway=0;
  const ConfirmHandler = () => {

    if (
      title.trim().length === 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      console.log("Hay algo que no captura");
      return;
    }

    const event = { title, date, description };

    const token = storedCredentials.token;
    var dateDay = moment(date);
    var dateMonth = moment(date).format('MM');
    var dateYear = moment(date).year();
    var dateHour = time;
    var daysInMonth = moment(date).daysInMonth();
    var arrDays = [];
    var requestBody;

    if (isReiterative) {
      while (daysInMonth) {
        var current = moment().date(daysInMonth);
        arrDays.push(current);
        daysInMonth--;
      }
      for (const day1 in arrDays) {

        var currentDate = moment((dateYear + "-" + dateMonth + "-" + (Number(day1) + 1) + "T" + dateHour), 'YYYY-MM-DD HH:mm');
        console.log(day1 + "**" + currentDate.format('YYYY-MM-DD HH:mm'));
        if (currentDate.day() == weekday) {
          console.log("Hay uno igual " + day1 + "/" + currentDate.format('YYYY-MM-DD HH:mm'));

          requestBody = {
            query: `
                mutation CreateEvent($title: String!, $desc: String!, $date: String!, $capacity: Int!) {
                  createEvent(eventInput: {title: $title, description: $desc, date: $date, 
                    capacity: $capacity}) {
                    _id
                    title
                    description
                    date
                    capacity
                  }
                }
              `,
            variables: {
              title: title,
              desc: description,
              date: currentDate.subtract({hours:6}),
              capacity: capacity,
            }
          };//http://localhost:8000/graphql
          fetch('https://api-swimming.herokuapp.com/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token
            }
          })
            .then(res => {
              if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
              }
              return res.json();
            })
            .then(resData => {
              console.log("Exitoso")
            })
            .catch(err => {
              console.log(err);
            });
        }
      }
      navigation.navigate('Reservation');

    } else {
      requestBody = {
        query: `
            mutation CreateEvent($title: String!, $desc: String!, $date: String!, 
               $capacity:Int!) {
              createEvent(eventInput: {title: $title, description: $desc, date: $date, 
                 capacity: $capacity}) {
                _id
                title
                description
                date
                capacity
              }
            }
          `,
        variables: {
          title: title,
          desc: description,
          date: moment(date+ ' '+ dateHour).subtract({hours:6}),
          //runway: runway,
          capacity: capacity
        }
      };//http://localhost:8000/graphql
      fetch('https://api-swimming.herokuapp.com/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
        .then(res => {
          if (res.status !== 200 && res.status !== 201) {
            throw new Error('Failed!');
          }
          return res.json();
        })
        .then(resData => {
          navigation.navigate('Reservation');
          
        })
        .catch(err => {
          console.log(err);
        });
    }


  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor : '#A8E9CA'
    },
    title: {
      textAlign: 'left',
      fontSize: 20,
      fontWeight: 'bold',
    },
    datePickerStyle: {
      width: 230,
    },
    text: {
      textAlign: 'left',
      width: 230,
      fontSize: 16,
      color : "#000"
    }
  });
  return (
    <>
      <StatusBar style="light" />
      <InnerContainer>
        <WelcomeImage resizeMode="cover" source={require('./../assets/img/expo-bg2.png')} />

        <WelcomeContainer>
          <PageTitle welcome={true}>Creando evento</PageTitle>
          <SubTitle welcome={true}>{userId || 'Olga Simpson'}</SubTitle>
          <SubTitle welcome={true}>{email || 'olgasimp@gmail.com'}</SubTitle>

          <StyledFormArea>
            <Avatar resizeMode="cover" source={AvatarImg} />

            <Line />
            <View>
            <Text htmlFor='name'>Título del evento:</Text>
                  <input type="text" id="title" name="title" value={title}
                  onChange={handleChange}
                  ></input>
            <Text htmlFor='name'>Descripción:</Text>
                  <input type="text" id="description" name="description" value={description}
                  onChange={handleChange}
                  ></input>         
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isReiterative ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isReiterative}
            />
            <Text>Evento recurrente</Text>
              {Platform.OS != 'web' &&
                <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
              }  
              {Platform.OS == 'web' && isReiterative &&
                <View>
                  <Text > Seleccione el día </Text>
            <Picker
                value={weekday}
                onChange={handleChange}
                id="weekday"
            >
                <Picker.Item label="Lunes" value="1" />
                <Picker.Item label="Martes" value="2" />
                <Picker.Item label="Miércoles" value="3" />
                <Picker.Item label="Jueves" value="4" />
                <Picker.Item label="Viernes" value="5" />
                <Picker.Item label="Sábado" value="6" />
            </Picker>
                  <Text htmlFor='date_'>Mes:</Text>
                  <input type="month" id="date_" name="date" value={date}
                  onChange={datePickerCatcher}
                  ></input>
                </View>
                
              }
              {!isReiterative &&
                <View>
                  <Text htmlFor='date_'>Fecha:</Text>
                    <input type="date" id="date_" name="date" value={date}
                    onChange={specificDatePickerCatcher}
                  ></input>
                </View>
              }
              <Text htmlFor='time'>Hora:</Text>
                  <input type="time" id="time" name="time" value={time}
                  onChange={handleChange}
                  ></input>
                  <Text htmlFor='capacidad'>Capacidad:</Text>
                  <input type="number" step={1} min={1} id="capacity" name="capacity" value={capacity}
                  onChange={handleChange}
                  ></input>
              
              <Button
                onPress={ConfirmHandler}
                color="#9633FF"
                accessibilityLabel="creator button"
                //onPress={() => Toast.info('This is a toast tips')}
                >
                Crear</Button>
              
              

 
      </View>
            <StyledButton onPress={clearLogin}>
              <ButtonText>Logout</ButtonText>
            </StyledButton>
            <StyledButton onPress={() => navigation.navigate('Reservation')}>
              <ButtonText>Reservar</ButtonText>
            </StyledButton>
            
          </StyledFormArea>
          
        </WelcomeContainer>
      </InnerContainer>
    </>
  );
};

export default Event;