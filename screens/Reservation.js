import React, { useContext, useState } from 'react';
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
} from '../components/styles';

// Async storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// credentials context
import { CredentialsContext } from '../components/CredentialsContext';
import moment from 'moment';
//import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Picker, Button, Switch, Input, Image, Card, Modal, Space, Selector, Toast} from 'antd-mobile'

const basicColumns = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['1', '222', '3'],
]
const msInHour = 60 * 60 * 1000;
 
  const now = new Date();
 
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
  const [monthlyWeekdayEvents, setMonthlyWeekdayEvents] = useState([]);
  const [ItemList, setItemList] = useState([
    {
      label: 'Lunes',
      value: '1',
    },
    {
      label: 'Martes',
      value: '2',
    }
  ]);
  
  const handleUpdate = (monthlyWeekdayEvents) => {
    //setMonthlyWeekdayEvents(monthlyWeekdayEvents);
    setItemList(monthlyWeekdayEvents);
  }
  const chargeMonthlyEvents=(weekday_selected)=>{
    var daysInMonth = moment(date_selected).daysInMonth();
    var dateMonth = moment(date_selected).format('MM');
    var dateYear = moment(date_selected).year();
    var dateHour = '00:00';
    var arrDays = [];
    while (daysInMonth) {
      var current = moment().date(daysInMonth);
      arrDays.push(current);
      daysInMonth--;
    }
    for (const day1 in arrDays) {

      var currentDate = moment((dateYear + "-" + dateMonth + "-" + (Number(day1) + 1) + "T" + dateHour), 'YYYY-MM-DD HH:mm');
      console.log(day1 + "**" + currentDate.format('YYYY-MM-DD HH:mm'));
      var week_number=0;
      if (currentDate.day() == weekday_selected) {
        console.log("Hay uno igual " + day1 + "/" + currentDate.format('YYYY-MM-DD HH:mm'));
        week_number+=1;
        const requestBody = {
          query: `
            query 
              dateEvents($date: String){
                dateEvents(date:$date){
                _id
                title
                description
                date
                capacity
                creator {
                  _id
                  email
                }
                suscribers{
                  email
                  fullname
                  _id
                }
              }
            }
          `,
        variables: {
          date: currentDate
        }
            
        };
        //if (isLoading) {
          fetch('https://api-swimming.herokuapp.com/graphql', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
            }
            return res.json();
          })
          .then(resData => {
            week_number+=1;
            const events = resData.data.dateEvents;
            events.forEach(event => {
              event['start'] = moment(event.date);
              event['end'] = moment(event.date).add(1, 'hours');
              event['label'] = event.description;
              event['value'] = event._id;
              event['key']=event._id;
              //event['value'] = event.runway.toString();
            });
            //events.week=week_number;
            monthlyWeekdayEvents.push(events[0]);
            handleUpdate(monthlyWeekdayEvents);
          })
          .catch(err => {
            console.log(err);
          });
             
      }
      
    }
    setIsLoading(false);
    
    //setItemList(monthlyWeekdayEvents);
    //console.log("MonthlyWeekdayEvents: "+JSON.stringify(monthlyWeekdayEvents));
  }
  const chargeEvents = (date_selected_c) => {
    const requestBody = {
      query: `
        query 
          dateEvents($date: String){
            dateEvents(date:$date){
            _id
            title
            description
            date
            capacity
            creator {
              _id
              email
            }
            suscribers{
              email
              fullname
              _id
            }
          }
        }
      `,
    variables: {
      date: date_selected_c,
    }
        
    };
    //if (isLoading) {
      fetch('https://api-swimming.herokuapp.com/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const events = resData.data.dateEvents;
        events.forEach(event => {
          event['start'] = moment(event.date);
          event['end'] = moment(event.date).add(1, 'hours');
          event['label'] = event.description;
          event['value'] = event._id;
          event['key']=event._id;
          //event['value'] = event.runway.toString();
        });
        setIsLoading(false);
        setItemList(events);
      })
      .catch(err => {
        console.log(err);
      });  
    //}
        
  };
  const handleCheched=(checked_) => {
    setChecked(checked_)
    console.log("Funcion fuera del componente: "+checked_+">>>"+checked)
  }

  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [date_selected, setDate_selected] = useState('');
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
            <Image src={require('./../assets/img/natacioncq.png')} width={100} height={100} />
            
            <Card>
              <Input 
                placeholder='Fecha' 
                //value={date_selected} 
                clearable 
                type='date'
                onChange={v => {
                  if (v.length) {
                    console.log("!checked: "+v)
                    setIsLoading(true)
                    setDate_selected(v)
                    chargeEvents(v)
                  }
                }} 
              />  
              
             </Card>
             <Selector
                options={ItemList}
                value={['_id']}
                onChange={(item) => {
                  ItemList.forEach(element => {
                    if (element._id==item) {
                      Modal.confirm({
                        content:<Card>
                          
                          <Switch
                            checkedText="Recurrente"
                            uncheckedText="No recurrente"
                            checked={checked}
                            onClick={handleCheched(checked)} 
                            // onChange={ checked => {
                            //   console.log("checked: "+checked)
                            //   setChecked(checked)
                            //   console.log("checked2: "+JSON.stringify({checked}))
                            //   reload();
                            // }}
                          />
                          <Space direction='vertical'>
                          <p>{element.description + "  " +
                            moment(element.date).format("DD/MM/YYYY hh:mm A")}</p>
                          <p>Cupos disponibles: {element.capacity - element.suscribers.length} personas</p>
                          {element.suscribers &&
                              element.suscribers.length > 0 && (
                                  <div className="">
                                      <h6 className="text-center">Inscritos ({element.suscribers.length})</h6>
                                  </div>
                              )}
                      </Space>
                        </Card>
                        ,
                        showCloseButton:true,
                        confirmText: "Reservar",
                        cancelText: "Cancelar",
                        onConfirm: () => {
                          console.log('Confirmed>>'+element.capacity)
                        },
                    })    
                    }
                  });
                  

              }}
              />
             
             
            <Button
              color='primary' 
              fill='solid'
              //onClick={chargeMonthlyEvents(value)}
            >
              Cargar//Reservar
            </Button>
            <Picker
              columns={basicColumns}
              visible={visible}
              confirmText="Confirmar"
              cancelText="Cancelar"
              onClose={() => {
                setVisible(false)
              }}
              value={value}
              onConfirm={v => {
                setValue(v)
              }}
            />
            <StyledButton onPress={clearLogin}>
              <ButtonText>Logout</ButtonText>
            </StyledButton>
            <StyledButton onPress={() => navigation.navigate('Welcome')}>
              <ButtonText>Home</ButtonText>
            </StyledButton>
          </StyledFormArea>
        </WelcomeContainer>
        

      </InnerContainer>
    </>
  );
};

export default Welcome;
