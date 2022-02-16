import React, { Component } from 'react';
//import ReCAPTCHA from 'react-google-recaptcha';
import './../assets/Auth.css';
// credentials context
import { CredentialsContext } from './../components/CredentialsContext';
import CookieConsent from "react-cookie-consent";
//import { Button, Provider, Toast } from '@ant-design/react-native';
import { View, Text } from 'react-native';
import { Button, NoticeBar, InputItem, List, Card} from '@ant-design/react-native';
// Async storage
import AsyncStorage from '@react-native-async-storage/async-storage';

class Login extends Component {
  state = {
    isLogin: true,
    type:'',
    message:'',
    email:'',
    password:'',
    identification:'',
    phone:'',
    fullname:'',
  };

  static contextType = CredentialsContext;

  constructor(props) {
    super(props);

    this.handleCaptchaResponseChange = this.handleCaptchaResponseChange.bind(this);
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      console.log('isLogin:'+ this.state.isLogin);
      return { isLogin: !prevState.isLogin };
    });
  };
  openNotification = (message_,type_)=>{
    this.setState({message:message_, type: type_})
  }

  submitHandler = event => {
    event.preventDefault();
    let email = this.state.email;
    let password = this.state.password;


    if (email.trim().length === 0 || password.trim().length === 0) {
      this.openNotification("Hay campos requeridos sin completar",'warning');
      return;
    }

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
        email: email,
        password: password
      }
    };

    if (!this.state.isLogin) {
      const identification = this.state.identification;
      const phone = this.state.phone;
      const fullname = this.state.fullname;
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!, $identification: String!,
            $phone: String, $fullname: String!) {
            createUser(userInput: {email: $email, password: $password, role: "u",
              identification: $identification, phone: $phone, fullname: $fullname}) {
              _id
              email
            }
          }
        `,
        variables: {
          email: email,
          password: password,
          identification: identification,
          phone: phone,
          fullname: fullname
        }
      };
    }
    fetch('https://api-swimming.herokuapp.com/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res=> {
        return res.json();
      })
      .then(resData => {
        if (resData.data.createUser) {
          this.setState({ isLogin: true })
          this.persistLogin({ ...resData.data.login }, "Bienvenido", resData.status);
          this.props.navigation.navigate('Reservation');
        } else {
          if (resData.data.login.token) {
            this.persistLogin({ ...resData.data.login }, "Bienvenido", resData.status);
            this.props.navigation.navigate('Reservation');
            // this.context.login(
            //   resData.data.login.token,
            //   resData.data.login.userId,
            //   resData.data.login.userRole,
            //   resData.data.login.tokenExpiration
            // );
          }
        }

        })
      .then(errors => {
        console.log("handle.res: "+errors.errors[0].message);
        // if (errors.errors[0].message=="Password is incorrect!") {
        //   this.openNotification("Los datos suministrados no coinciden con nuestros registros",'error');
        // }
        // if (errors.errors[0].message=="User exists already.") {
        //   this.openNotification("Ese usuario ya existe en nuestros registros",'warning');
        // }
        if (!errors.ok) throw new Error(errors.error);
         throw new Error(errors);
      })
      // .then(errors => {
      //   console.log("handle.res: "+errors.errors[0].message);
      //   if (errors.errors[0].message=="Password is incorrect!") {
      //     this.openNotification("Los datos suministrados no coinciden con nuestros registros",'error');
      //   }
      //   if (errors.errors[0].message=="User exists already.") {
      //     this.openNotification("Ese usuario ya existe en nuestros registros",'warning');
      //   }
      //   if (errors.errors[0].message=="User does not exist!") {
      //     this.openNotification("Ese usuario no existe en nuestros registros",'warning');
      //   }
      //   if (!errors.ok) throw new Error(errors.error);
      //    throw new Error(errors);
      // })
      .catch(err => {
        console.log("desde el catch "+err);
      });
  };
  handleCaptchaResponseChange(response) {
    //this.recaptcha.reset();
    this.setState({
      recaptchaResponse: response,
    });

  }
  handleMessage = (_message, _type = '') => {
    this.setState({ message: _message, type: _type });
  };

  // Persisting login
  persistLogin = (credentials, message, status) => {
    AsyncStorage.setItem('flowerCribCredentials', JSON.stringify(credentials))
      .then(() => {
        this.handleMessage(message, status);
        window.location.reload();
        //setStoredCredentials(credentials);
      })
      .catch((error) => {
        this.handleMessage('Ha ocurrido un error');
        console.log(error);
      });
  };


  render() {
    return (
      <View>
        <NoticeBar mode="closable">
              {this.message}
        </NoticeBar>

        <h3 style={{display: 'flex',  justifyContent:'center', alignItems:'center', marginTop:'2rem'}}>Autenticación</h3>
      
        <List>
          <InputItem
              value={this.state.email}
              type="email"
              labelNumber={7}
              onChange={email_ => {
                this.setState({
                  email:email_,
                });
              }}
              placeholder="Email"
          >
              Email
          </InputItem>
          <InputItem
              value={this.state.password}
              type="password"
              labelNumber={7}
              onChange={password_ => {
                this.setState({
                  password:password_,
                });
              }}
              placeholder="*****"
            >
              Contraseña
            </InputItem>
            </List>
       {!this.state.isLogin &&
          <React.Fragment>
          <List>
          <InputItem
            value={this.state.password_confirm}
            type="password"
            labelNumber={7}
            onChange={password_c => {
              this.setState({
                password_confirm:password_c,
              });
            }}
            placeholder="*****"
          >
            Confirmación de la contraseña
          </InputItem>
         
          <InputItem className="w-200"
            value={this.state.fullname}
            labelNumber={7}
            onChange={fullname_ => {
              this.setState({
                fullname:fullname_,
              });
            }}
            placeholder="Nombre completo"
          >
            Nombre
          </InputItem>
          <InputItem
            value={this.state.phone}
            type="phone"
            labelNumber={7}
            onChange={phone_ => {
              this.setState({
                phone:phone_,
              });
            }}
            placeholder="Teléfono de contacto"
          >
            Teléfono
          </InputItem>
          <InputItem
            value={this.state.identification}
            labelNumber={7}
            onChange={identification_ => {
              this.setState({
                identification:identification_,
              });
            }}
            placeholder="Cédula de indentidad"
          >
            Cédula
          </InputItem>
          
      </List>

        </React.Fragment>
        }
      
      {/* <form className="auth-form" onSubmit={this.submitHandler}>
        


        <div className="form-actions">
          <button type="submit">Enviar</button>
          <button type="button" onClick={this.switchModeHandler}>
            {this.state.isLogin ? 'Crear cuenta' : 'Tengo cuenta. Iniciar sesión'}
          </button>
        </div>
        <CookieConsent
          location="bottom"
          buttonText="Entendido"
          cookieName="myAwesomeCookieName2"
          style={{ background: "#2B373B" }}
          buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
          expires={150}
        >
          Este sitio usa cookies para optimizar su experiencia como usuario
        </CookieConsent>
      </form> */}
      <List>
      <List.Item>
          <form onSubmit={this.submitHandler}>

            <div>
              <Button onPress={this.submitHandler} type="primary">Enviar</Button>
              <Button onPress={this.switchModeHandler}>
                {this.state.isLogin ? 'No tiene cuenta. Registrarse' : 'Tengo cuenta. Iniciar sesión'}
              </Button>
            </div>
            <CookieConsent
              location="bottom"
              buttonText="Entendido"
              cookieName="myAwesomeCookieName2"
              style={{ background: "#2B373B" }}
              buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
              expires={150}
            >
              Este sitio usa cookies para optimizar su experiencia como usuario
            </CookieConsent>
          </form>
          </List.Item>
          </List>
          </View>
    )
  }
}

export default Login;
