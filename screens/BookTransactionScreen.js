import React from 'react';
import { Text,
   View,
   TouchableOpacity,
   TextInput,
   Image,
   StyleSheet,
  KeyboardAvoidingView ,
ToastAndroid,Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
    checkBookId = async()=>{
      const bookRef = await db
      .collection("books")
      .where("bookId","==",this.state.scannedBookId)
      .get()
      var transactionType="";
      if(bookRef.docs.length === 0){
        transactionType = false;
        this.setState({
          scannedBookId:"",
          scannedStudentId:""
        })
        Alert.alert("This Book ID is not valid")
      } else{
        bookRef.docs.map(doc=>{
          var data = doc.data()
          if(data.bookAvailability){
            transactionType = "Issue"
          } else{
            transactionType = "Return"
          }
        })
      }
      return transactionType
    }
    checkStudentIdforIssue = async()=>{
      const IssueRef = await db
      .collection("students")
      .where("studentId","==",this.state.scannedStudentId)
      .get();
      var studentIssueRef = "";
      if(IssueRef.docs.length === 0){
        studentIssueRef = false
        Alert.alert("this Student ID is not valid")
      } else{
        IssueRef.docs.map(doc=>{
          var Books = doc.data()
          if(Books.numberOfBooksIssued <2){
            studentIssueRef = true
          }else {
            studentIssueRef = false
            this.setState({
              scannedStudentId:"",
              scannedBookId:""
            })
            Alert.alert("Student has already issued 2 books");
          }
        })
      }
      return studentIssueRef
    }

    checkStudentIdforReturn = async()=>{
      const ReturnRef = await db
      .collection("transactions")
      .where("studentId","==",this.state.scannedStudentId)
      .limit(1)
      .get();
      var studentReturnRef = "";
      if (ReturnRef.docs.length=== 0){
        studentReturnRef = false
        Alert.alert("There was no such transaction for this book")
        this.setState({
          scannedBookId:"",
          scannedStudentId: ""
        })
      } else{
        ReturnRef.docs.map(doc=>{
          var Books = doc.data()
          if(Books.studentId === this.state.scannedStudentId){
            studentReturnRef = true
          }else {
            studentReturnRef= false
            this.setState({
              scannedStudentId:"",
              scannedBookId:""
            })
            Alert.alert("Book wasn't issued by this student");
          }
        })
      }
      return studentReturnRef
    }

    initiateBookIssue = async()=>{
      //add a transaction
      db.collection("transaction").add({
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Issue"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': false
      })
      //change number of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
      })

    this.setState({
      scannedStudentId: '',
      scannedBookId: ''
    })
    }

    initiateBookReturn = async()=>{
      //add a transaction
      db.collection("transactions").add({
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Return"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': true
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
      })

      this.setState({
        scannedStudentId: '',
        scannedBookId: ''
      })
    }

    handleTransaction = async () => {
     var transactionType = await this.checkBookId();

     if(!transactionType){
    this.setState({
      scannedStudentId:"",
      scannedBookId:""
    }) 
    } else if(transactionType === "Issue"){
      var studentEligibility = await this.checkStudentIdforIssue();
      if(studentEligibility === true){
        this.initiateBookIssue();
        Alert.alert("Book Issued to Student");
      }
    } else if(transactionType === "Return"){
      var studentEligibility = await this.checkStudentIdforReturn();
      if(studentEligibility === true){
        this.initiateBookReturn();
        Alert.alert("Book has been returned");
      }
    }

  }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView  style={styles.container} behavior="padding" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text =>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText ={text => this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async()=>{
                var transactionMessage = await this.handleTransaction();
              }}>
          <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  });