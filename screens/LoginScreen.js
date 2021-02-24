import React from 'react';
import { Text,
   View,
   TouchableOpacity,
   TextInput,
   Image,
   StyleSheet,
  KeyboardAvoidingView ,
ToastAndroid,Alert} from 'react-native';
import firebase from 'firebase';
import db from '../config';

export default class LoginScreen extends React.Component {
    constructor(){
      super();
      this.state = {
       email:"",
       passcode:""
      }
    }
    Login = async(email,password)=>{
      if(email&&password){
        try{
          const response = await firebase.auth().signInWithEmailAndPassword(email,password)
          if(response){
            this.props.navigation.navigate('Transaction')
          }
        } catch(error){
          switch(error.code){
            case 'auth/user-not-found':Alert.alert("User dosen't exist")
            break;
            case 'auth/invalid-email':Alert.alert("Incorrect Email or Password")
            break;
            default:break;
          }
        }
      }else {
        Alert.alert("Enter Email and Password");
      }
    }
    

    render() {
      return(
        <KeyboardAvoidingView behavior={'padding'} enabled>
          <View style={{marginTop:30}}>
          <TextInput
          style={styles.input} 
          placeholder={"Username/email"}
          onChangeText={(text)=>{this.setState({email:text})}}
          value={this.state.email}
          />
          <TextInput 
          style={styles.input}
          placeholder={"Passcode"}
          onChangeText={(text)=>{this.setState({passcode:text})}}
          value={this.state.passcode}
          secureTextEntry={true}
          />
          </View>
          <View>
          <TouchableOpacity 
          style={styles.signIN}
          onPress={()=>{this.Login(this.state.email,this.state.passcode)}}
          ><Text>Sign in</Text>
          </TouchableOpacity>
          </View>
        </KeyboardAvoidingView> 
        );
    }
    
  }

  const styles = StyleSheet.create({
    input:{
      marginTop:30,
      width:200,
      height:40,
      borderWidth:1,
      borderColor:'black',
      color:'black'
    },
    signIN:{
      marginTop:15,
      backgroundColor:'red',
      alignItems:'center',
      justifyContent:'center'
    }
  });