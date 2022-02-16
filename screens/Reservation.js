import React, { Component, useEffect } from 'react';
//import ReCAPTCHA from 'react-google-recaptcha';
import './../assets/Auth.css';
// credentials context
import { CredentialsContext } from './../components/CredentialsContext';
//import { Button, Provider, Toast } from '@ant-design/react-native';
import { View, Text } from 'react-native';
import { Picker, Button, Switch, Input, Image, Card, Modal, Space, Selector} from 'antd-mobile'
import { DatePicker, Provider, NoticeBar, InputItem, List, Toast} from '@ant-design/react-native';
import moment from 'moment';
import Swimmer from '../components/Admin/Swimmer';
import '../components/Admin/AdminEvent.css';
import Dragula from 'react-dragula';
import {
  CloseSquareOutlined
} from '@ant-design/icons';

// Async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
function showToast(_message, _type) {
  if (_type=='info') {
    Toast.info(_message, 4);  
  }
  if (_type=='fail') {
    Toast.fail(_message, 6);  
  }
}
var dragula = require('react-dragula');
class Reservation extends Component {
  state = {
    date_selected:'',
    ItemList:[],
    checked:false,
    bookings:[],
    isActive:false
  };
  
  static contextType = CredentialsContext;
  
  constructor(props) {
    super(props);
  }
  setRunway(currentUserId, runwaySelected) {

    var currentBookings = [...this.state.bookings];
    const list = currentBookings.map((element, i) => {

      if (element.user._id === currentUserId) {
        element.runway = runwaySelected;
        element.attendance = true;
        if (runwaySelected === 0) element.attendance = false;
      }
    });

    console.log("desde setRunway: " + JSON.stringify(this.state.bookings));
  }
  componentWillUnmount() {
    this.isActive = false;
    var drake = dragula(Array.from(document.getElementsByClassName('cont-dragula')));
    drake.destroy();
  }
  componentDidUpdate() {
    var drake = dragula(Array.from(document.getElementsByClassName('cont-dragula')),
      {
        direction: 'horizontal'
      }
    );
    drake.on('drop', (el, target) => {
      this.setRunway(el.id, Number.parseInt(target.id, 10));
    });

  }
  
  chargeEvents = (date_selected_c) => {
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
        });
        this.setState({ItemList:events})
        if (events.length==0)showToast("No hay eventos para la fecha seleccionada",'info');
        
        
      })
      .catch(err => {
        console.log(err);
      });  
        
  };
  handleChecked=(_checked) => {
    this.setState({checked:_checked})
    console.log("Funcion fuera del componente: "+">>>"+this.state.checked)
  };
  bookEventHandler = (event_id) => {

    if (!this.context.storedCredentials.token) {
      return;
    }
    if (this.state.checked) {

      const requestBodyEvents = {
        query: `
            query {
              events {
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
          selectedEventDate: this.state.date_selected
        }
      };
      fetch('https://api-swimming.herokuapp.com/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBodyEvents),
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
          const reiterativeEvents = resData.data.events;
          reiterativeEvents.forEach(event => {
            event['start'] = moment(event.date);
            event['end'] = moment(event.date).add(1, 'hours');
            event['value'] = event.description;
            console.log(moment(event.date) >= moment(event_id.date) +
              "day(): " + moment(event.date).day() === moment(event_id.date).day() +
              "month: " + moment(event.date).month() === moment(event_id.date).month() +
              "hour: " + moment(event.date).hour() === moment(event_id.date).hour() +
              "year: " + (moment(event.date).year() === moment(event_id.date).year()));
            if (moment(event.date) >= moment(event_id.date) &&
              (moment(event.date).day() === moment(event_id.date).day()) &&
              (moment(event.date).month() === moment(event_id.date).month()) &&
              (moment(event.date).hour() === moment(event_id.date).hour()) &&
              (moment(event.date).year() === moment(event_id.date).year())) {

              const requestB = {
                query: `
                      mutation BookEvent($id: ID!) {
                        bookEvent(eventId: $id) {
                          _id
                          user {
                            _id
                            email
                            fullname
                          }
                        }
                      }
                    `,
                variables: {
                  id: event._id
                }
              };

              fetch('https://api-swimming.herokuapp.com/graphql', {
                method: 'POST',
                body: JSON.stringify(requestB),
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + this.context.storedCredentials.token
                }
              })
                .then(res => {
                  if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed!');
                  }
                  return res.json();
                })
                .then(resData => {
                  var newBooking = {
                    _id: resData.data.bookEvent.user._id,
                    email: resData.data.bookEvent.user.email,
                    fullname: resData.data.bookEvent.user.fullname
                  };
                  if (!event.suscribers.filter(function (e) { return e._id === newBooking._id; }).length > 0) {
                    event.suscribers.push(
                      newBooking
                    )
                  }
                })
                .catch(err => {
                  console.log(err);
                });

            }
          });
      
        })
        .catch(err => {
          console.log(err);
        });


    } else {
      const stateEvents = this.state.ItemList;
      const requestBody = {
        query: `
            mutation BookEvent($id: ID!) {
              bookEvent(eventId: $id) {
                _id
                user{
                  _id
                  email
                  fullname
                }
                event{
                  _id
                }
              }
            }
          `,
        variables: {
          id: event_id._id
        }
      };

      fetch('https://api-swimming.herokuapp.com/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.context.storedCredentials.token
        }
      })
        .then(res => {
          if (res.status !== 200 && res.status !== 201) {
            showToast("Usted ya estaba registrado",'fail');
            throw new Error('Failed!');

          }
          return res.json();
        })
        .then(resData => {

          stateEvents.forEach(element => {
            var newBooking = {
              _id: resData.data.bookEvent.user._id,
              email: resData.data.bookEvent.user.email,
              fullname: resData.data.bookEvent.user.fullname
            };
            if (!element.suscribers.filter(function (e) { return e._id === newBooking._id; }).length > 0) {
              element.suscribers.push(
                newBooking
              )
            }
          });

          this.setState({ ItemList: stateEvents });
          showToast("Su solicitud está siendo procesada",'info');
        })
        .catch(err => {
          console.log(err);
        });
    }

  };
  sortRunways() {
    const sBookings = this.state.bookings;
    console.log("desde sort antes de ordenar: " + JSON.stringify(sBookings));
    var r = [];
    for (let index = 1; index <= 6; index++) {
        r.push(
            <div className="row" key={r + index}>
                
                <div id={index} className={'cont-dragula row col-11 row-'+index} ref={this.dragulaDecorator}>
                  <div className="col-1 runway-class">{index}</div>
                    {sBookings.map(booking => {
                        if (booking.runway === index) {
                            return (<Swimmer key={booking.user._id} id={booking.user._id}
                                individualBooking={booking}
                            ></Swimmer>);
                        }
                        return null;
                    })}
                    
                </div>
            </div>
        );

    }
    return r;
  };
  getBookings(eventId) {
    this.setState({isActive:false});
    const requestBody = {
      query: `
          mutation EventBookings($eventId: ID!) {
            eventBookings(eventId: $eventId) {
            _id
            attendance
            runway
            user{
              _id
              fullname
            }
            }
          }
        `,
      variables: {
        eventId: eventId
      }
    };


    fetch('https://api-swimming.herokuapp.com/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.context.storedCredentials.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({ bookings: resData.data.eventBookings, isActive:true});
        console.log("data bookings: "+JSON.stringify(this.state.bookings));
      })
      .catch(err => {
        console.log(err);
      });
  }

 

  render() {
    return (
      <Provider>
        <View>
        <h3 style={{display: 'flex',  justifyContent:'center', alignItems:'center', marginTop:'2rem'}}>Reservar</h3>
        <Card>
              <Input 
                placeholder='Fecha' 
                //value={date_selected} 
                clearable 
                type='date'
                format={'DD-MM-YYYY'}
                onChange={v => {
                  if (v.length) {
                    console.log("!checked: "+v)
                    this.setState({date_selected: v})
                    this.chargeEvents(v)
                  }
                }} 
              />  
             </Card>
        <Selector
                options={this.state.ItemList}
                value={['_id']}
                onChange={(item) => {
                  this.setState({isActive:true});
                  this.state.ItemList.forEach(element => {
                    if (element._id==item) {
                      
                      this.getBookings(element._id);
                      if (this.state.isActive && this.context.storedCredentials.userRole=='u') {
                        Modal.confirm({
                          content:<Card>
                            
                            <Switch
                              checkedText="Recurrente"
                              uncheckedText="No recurrente"
                              onChange={(value)=>
                                this.handleChecked(value)
                              } 
                            />
                            <Space direction='vertical'>
                            <p>{element.description + "  " +
                              moment(element.date).format("DD/MM/YYYY hh:mm A")}</p>
                            <p>Cupos disponibles: {element.capacity - element.suscribers.length} personas</p>
                            {element.suscribers &&
                                element.suscribers.length > 0 && (
                                    <div className="">
                                        <h6 className="text-center">Inscritos ({element.suscribers.length})</h6>
                                
                                        {element.suscribers.map((suscriber) => {     
                                          if (suscriber._id==this.context.storedCredentials.userId) {
                                            return (<h6 key={suscriber._id}>{suscriber.fullname}</h6>)  
                                          }      
                                        })}
                                    </div>
                                )}
                        </Space>
                          </Card>
                          ,
                          showCloseButton:true,
                          confirmText: "Reservar",
                          cancelText: "Volver",
                          onConfirm: () => {
                            if (element.capacity - element.suscribers.length<=0) {
                              showToast("No hay espacios disponibles",'fail');
                              
                            }else{
                              this.bookEventHandler(element);
                            }
                          },
                      })  
                      }
                      if (this.state.isActive && this.context.storedCredentials.userRole=='a') {
                        Modal.confirm({
                          content:<Card>
                            <p>{element.description + "  " +
                              moment(element.date).format("DD/MM/YYYY hh:mm A")}</p>
                            <p>Cupos disponibles: {element.capacity - element.suscribers.length} personas</p>
                            <div
                                            className="container-fluid justify-content-center cont-dragula"
                                            id='0'
                                            ref={this.dragulaDecorator}
                            ><p>Descartar nadador</p>
                            <CloseSquareOutlined />
                            </div>
                            {element.suscribers && this.state.isActive &&
                                element.suscribers.length > 0 && (
                                    
                                    <div className="">
                                        <h6 className="text-center">Inscritos ({element.suscribers.length})</h6>
                                        <div
                                            className="container-fluid justify-content-center cont-dragula"
                                            id='0'
                                            ref={this.dragulaDecorator}
                                        >
                                            En espera: 
                                            {this.state.bookings.map(item => {

                                                if (item.runway === 0) {
                                                    return (<Swimmer key={item.user._id} id={item.user._id}
                                                        individualBooking={item}
                                                    ></Swimmer>);
                                                }
                                                return
                                            }

                                            )}
                                        </div>
                                        <div id="right1" className="container-fluid justify-content-center">
                                            <h6 className="text-center">Asistentes</h6>
                                            {this.state.isActive && this.sortRunways()}

                                        </div>
                                    </div>
                                )}
                          </Card>
                          ,
                          showCloseButton:true,
                          confirmText: "Guardar",
                          cancelText: "Volver",
                          onConfirm: () => {
                            if (element.capacity - element.suscribers.length<=0) {
                              showToast("No hay espacios disponibles",'fail');
                              
                            }else{
                              this.bookEventHandler(element);
                            }
                          },
                      })
                      }
                                                                      
                    }
                  });
                  

              }}
              />
          
        </View>
      </Provider>
    )
  }
}

export default Reservation;
