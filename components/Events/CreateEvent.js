import React from 'react';
import { Modal, Form, Col } from 'react-bootstrap';
import moment from 'moment';
import { Button, WhiteSpace,Card, List, Provider,InputItem,
     DatePicker, WingBlank, Flex } from '@ant-design/react-native';
import { Switch,Space} from 'antd-mobile'

import { View, Text } from 'react-native';
import {Input} from 'antd-mobile'

class createEvent extends React.Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleChangeDay = this.handleChangeDay.bind(this);

    this.state = {
      title: "",
      dateHour: "",
      dateDay: "",
      dateMonth: "",
      description: "",
      capacity: "",
      date:"",
      weekDayName:"",
      recursive:false,
      time:""
    }

  }
  handleClose() {
    this.props.handleClose();
  }
  handleChangeDay = (event) => {
    var dayName="";
    switch (event) {
      case 1:
        dayName='lunes'
        break;
      case 2:
        dayName='martes'
        break;
      case 3:
        dayName='miércoles'
        break;
      case 4:
        dayName='jueves'
        break;
      case 5:
        dayName='viernes'
        break;
      case 6:
        dayName='sábado'
        break;

      default:
        dayName='domingo'
    }
    this.setState({weekDayName:dayName})
  }
  componentDidMount() {

  }
  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value })
  }
  sendForm() {
    const title = this.state.title;
    const description = this.state.description;
    const capacity = parseInt(this.state.capacity);
    const dateMonth = moment(this.state.date).format('MM');
    const dateYear = moment(this.state.date).format('YYYY');
    const dateHour = this.state.time;
    const dateDay = this.state.dateDay;

    this.props.modalConfirmHandler(title, description, capacity, dateMonth, dateYear, dateHour, dateDay);
  }
  handleChecked=(_checked) => {
    this.setState({checked:_checked})
  };
  cancel(){
      console.log("Le di click en cancelar");
  }
  createEvent=()=>{
    const title = this.state.title;
    const description = this.state.description;
    const capacity = parseInt(this.state.capacity);
    const dateMonth = moment(this.state.date).format('MM');
    const dateYear = moment(this.state.date).format('YYYY');
    const dateHour = this.state.time;
    const dateDay = this.state.dateDay;
    console.log("title: "+title+", dateMonth: "+dateMonth+", dateYear: "+dateYear+", dateHour: "+dateHour+", dateDay: "+dateDay);
    this.props.modalConfirmHandler(title, description, capacity, dateMonth, dateYear, dateHour, dateDay);
  }

  render() {
    return <Provider>
        <View style={{ paddingTop: 30 }}>
            <Card full>
                <Card.Header
                title="Creando evento"
                thumbStyle={{ width: 30, height: 30 }}
                //thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
                extra="Nadar es salud"
                />
                <Card.Body>
                <View style={{ height: 42 }}>
                    <List>
                        <InputItem
                            value={this.state.title}
                            labelNumber={7}
                            onChange={title_ => {
                                this.setState({
                                    title:title_,
                                });
                            }}
                            placeholder="Descripción del evento"
                        >
                            Nombre
                        </InputItem>
                        
                        <List.Item arrow="horizontal">Seleccione la fecha y hora</List.Item>
                        <List.Item
                            labelNumber={7}
                            placeholder="Fecha del evento"
                            type="date"
                        >
                        
                        <Input 
                            placeholder='Fecha' 
                            value={this.state.date} 
                            clearable 
                            type='date'
                            format={'DD-MM-YYYY'}
                            onChange={v => {
                            if (v.length) {
                                this.setState({date: v})
                                //console.log("v----"+parseInt(moment(v).day(), 10))
                                this.handleChangeDay(parseInt(moment(v).day(), 10))
                            }
                            }} 
                        />
                         <WhiteSpace />
                        <Input 
                            placeholder='Hora' 
                            value={this.state.time} 
                            clearable 
                            type='time'
                            onChange={v => {
                            if (v.length) {
                                this.setState({time: v})
                                console.log("hora: "+v)
                                //this.handleChangeDay(parseInt(moment(v).day(), 10))
                            }
                            }} 
                        />
                        </List.Item>
                        <InputItem
                            value={this.state.weekDayName}
                            labelNumber={7}
                            editable="false"
                        >
                        <Switch
                              checkedText={"Recurrente para todos los "+this.state.weekDayName}
                              uncheckedText="No recurrente"
                              onChange={(value)=>
                                this.handleChecked(value)
                              } 
                            />
                            <Space direction='vertical'></Space>
                        </InputItem>    
                        <InputItem
                            value={this.state.capacity}
                            labelNumber={7}
                            type="number"
                            onChange={capacity_ => {
                                this.setState({
                                    capacity:capacity_,
                                });
                            }}
                            placeholder="Capacidad del evento"
                        >
                            Capacidad
                        </InputItem>
                        <InputItem
                            value={this.state.description}
                            labelNumber={7}
                            onChange={description_ => {
                                this.setState({
                                    description:description_,
                                });
                            }}
                            placeholder="Observaciones generales"
                        >
                            Observaciones
                        </InputItem>
                    </List>
                    <WhiteSpace />
                    <WingBlank style={{ marginBottom: 5 }}>
          <Flex>
            <Flex.Item style={{ paddingLeft: 6, paddingRight: 6 }}>
                <Button 
                    size="small"  type="warning"
                    onPress={this.cancel}>
                        Cancelar
                </Button>
            </Flex.Item>
            <Flex.Item style={{ paddingLeft: 6, paddingRight: 6 }}>
                <Button 
                    size="small"
                    type="primary"
                    onPress={this.createEvent}>
                        Crear
                </Button>
            </Flex.Item>
          </Flex>
        </WingBlank>

                </View>
                </Card.Body>
            </Card>
        </View>
    </Provider>
}
}

export default createEvent;
