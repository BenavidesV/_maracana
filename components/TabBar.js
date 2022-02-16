import React from 'react';
import { Text, View } from 'react-native';
import { Icon, Button, TabBar, Toast } from '@ant-design/react-native';
import Reservation from './../screens/Reservation';
import BookingList from './../components/Bookings/bookingList';
import CreateEvent from './../components/Events/CreateEvent';
// Async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CredentialsContext } from './../components/CredentialsContext';
export default class BasicTabBarExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'blueTab',
    };
  }
  static contextType = CredentialsContext;
  deleteBookingHandler = bookingId => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          mutation CancelBooking($id: ID!) {
            cancelBooking(bookingId: $id) {
            _id
             title
            }
          }
        `,
      variables: {
        id: bookingId
      }
    };

    fetch('https://api-swimming.herokuapp.com/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedBookings = prevState.bookings.filter(booking => {
            return booking._id !== bookingId;
          });
          return { bookings: updatedBookings, isLoading: false };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };
  confirmBookingHandler = bookingId => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          mutation ConfirmBooking($id: ID!) {
            confirmBooking(bookingId: $id) {
            _id
            approved
            }
          }
        `,
      variables: {
        id: bookingId
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
        // this.setState({ ItemList: stateEvents });
        showToast("Solicitud fue aprobada",'info');
        // this.setState(prevState => {
        //   const updatedBookings = prevState.bookings.filter(booking => {
        //     return booking._id !== bookingId;;
        //   });
        //   return { bookings: updatedBookings, isLoading: false };
        // });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };
  renderContent(pageText) {
    return (
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'white' }}>
        <Text style={{ margin: 50 }}>{pageText}</Text>
        <Button onPress={this.logout} type="primary">Cerrar sesión</Button>
      </View>
    );
  }
  onChangeTab(tabName) {
    this.setState({
      selectedTab: tabName,
    });
  }
  logout(){
    AsyncStorage.removeItem('flowerCribCredentials')
      .then(() => {
        console.log("ASynStorage clean");
        window.location.reload();
      })
      .catch((error) => console.log(error));
  }
  handleChangeDay = (event) => {
    this.setState({ day: parseInt(event.target.value, 10) });
  }

  render() {
    return (
      <TabBar
        unselectedTintColor="#949494"
        tintColor="#33A3F4"
        barTintColor="#f5f5f5"
      >
        <TabBar.Item
          title="Life"
          icon={<Icon name="home" />}
          selected={this.state.selectedTab === 'blueTab'}
          onPress={() => this.onChangeTab('blueTab')}
        >
          {this.renderContent(<Reservation></Reservation>)}
        </TabBar.Item>
        <TabBar.Item
          icon={<Icon name="ordered-list" />}
          title="Reservas"
          badge={2}
          selected={this.state.selectedTab === 'redTab'}
          onPress={() => this.onChangeTab('redTab')}
        >
          {this.renderContent(<BookingList
            onDelete={this.deleteBookingHandler}
            onConfirm={this.confirmBookingHandler}
           ></BookingList>)}
        </TabBar.Item>
        <TabBar.Item
          icon={<Icon name="like" />}
          title="Crear evento"
          selected={this.state.selectedTab === 'greenTab'}
          onPress={() => this.onChangeTab('greenTab')}
        >
          {this.renderContent(<CreateEvent
            handleChangeDay={this.handleChangeDay}
            //handleClose={this.handleClose}
            //modalCancelHandler={this.modalCancelHandler}
            //modalConfirmHandler={this.modalConfirmHandler}
          ></CreateEvent>)}
        </TabBar.Item>
        <TabBar.Item
          icon={<Icon name="user" />}
          title="My"
          selected={this.state.selectedTab === 'yellowTab'}
          onPress={() => this.onChangeTab('yellowTab')}
        >
          {this.renderContent('My Tab')}
        </TabBar.Item>
      </TabBar>
    );
  }
}