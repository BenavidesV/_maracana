import React from 'react';
import moment from 'moment';
import { CredentialsContext } from '../CredentialsContext';
import { Card} from 'antd-mobile';
import { Button, Flex, WingBlank } from '@ant-design/react-native';
import './bookingList.css';
class bookingList extends React.Component {
  
  static contextType = CredentialsContext;
  constructor(props) {
    super(props);
    this.state = {
      reiterative: [],
      isLoading: false,
      bookings:[]
    };
  }
  componentDidMount() {
    if (this.context.storedCredentials.token 
      && this.context.storedCredentials.userRole !== "a") {
        this.fetchMyBookings();
    }
    if (this.context.storedCredentials.token 
      && this.context.storedCredentials.userRole === "a") {
        this.fetchBookings();
    }
  }
  fetchMyBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          query {
            bookings {
              _id
             createdAt
             attendance
             event {
               _id
               date
             }
             user{
              fullname
              _id
            }
            }
          }
        `
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
        const bookings = resData.data.bookings;
        this.setState({ bookings: bookings, isLoading: false });
        //console.log("Se ejecuta MyBookings: "+bookings);
        //return(bookings);
        
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };
  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          query {
            approvalBookings {
              _id
              approved
             event {
               _id
               date
             }
             user{
               fullname
               _id
             }
            }
          }
        `
    };

    fetch('https://api-swimming.herokuapp.com/graphql', {//fetch('http://localhost:8000/graphql', {
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
        const bookings = resData.data.approvalBookings;
        bookings.forEach(b => {
          b['reiterative'] = false; 
        });
        this.setState({ bookings: bookings, isLoading: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };
  onReiterative(operator, bookingParam) {
    this.props.bookings.map(booking => {
      
      if (moment(bookingParam.event.date).day() == moment(booking.event.date).day() &&
        moment(bookingParam.event.date).year() == moment(booking.event.date).year() &&
        moment(bookingParam.event.date).month() == moment(booking.event.date).month() &&
        moment(bookingParam.event.date).hour() == moment(booking.event.date).hour() &&
        bookingParam.user._id==booking.user._id) {
        if (operator === 'confirm') this.props.onConfirm(booking._id);
        if (operator === 'cancel') this.props.onCancel(booking._id);
        
      }
    });
  }
  weekDay(day) {
    switch (day) {
      case 1:
        return 'lunes'
      case 2:
        return 'martes'
      case 3:
        return 'miércoles'
      case 4:
        return 'jueves'
      case 5:
        return 'viernes'
      case 6:
        return 'sábado'

      default:
        return 'domingo'
    }
  }

  render() {
    return (<Card>
      <WingBlank style={{ marginBottom: 5 }}>
          <Flex>
            <Flex.Item style={{ paddingLeft: 4, paddingRight: 4 }}>
              {this.context.storedCredentials.userRole === "a" &&
              <h2 size="small">Reservaciones pendientes de aprobación</h2>}
              {this.context.storedCredentials.userRole != "a" &&
              <h2 size="small">Mis reservaciones</h2>}
            </Flex.Item>
          </Flex>
        </WingBlank>
      <ul className="bookings__list">
      {!this.state.isLoading && this.state.bookings.map(booking => {

        return (
          <li key={booking._id}>
            <div className="bookings__item-data">
              {booking.user.fullname} -{' '}-{this.weekDay(moment(booking.event.date).day())}-{' '}
              {(moment(booking.event.date).format("DD/MM/YYYY"))}-{' '}
              {new Date(booking.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="bookings__item-actions">
              <button className="btn-decline" title="Rechazar"
                //onClick={this.onReiterative('cancel', moment(booking.event.date))}
                onClick={this.props.onDelete.bind(this, booking._id)}>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
              <button className="btn-decline" title={"Rechazar todos los " + this.weekDay(moment(booking.event.date).day()) + " del mes"}
                onClick={() => this.onReiterative('cancel', booking)}
              >
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-arrow-repeat" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                  <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                </svg>
              </button>
            </div>
            <div className="bookings__item-actions">
              <button title="Aprobar" className="btn-accept"
                onClick={this.props.onConfirm.bind(this, booking._id)}>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-check" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z" />
                </svg>
              </button>
              <button className="btn-accept" title={"Aprobar todos los " + this.weekDay(moment(booking.event.date).day()) + " del mes"}
                onClick={() => this.onReiterative('confirm', booking)}>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-check" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z" />
                </svg>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-arrow-repeat" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                  <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                </svg>
              </button>

            </div>
          </li>
        );
      })}
    </ul>
    </Card>);

  }

}
export default bookingList;
