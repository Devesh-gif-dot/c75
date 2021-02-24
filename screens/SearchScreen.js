import React from 'react';
import { Text,
   View,
   TouchableOpacity,
   TextInput,
   StyleSheet,
  KeyboardAvoidingView ,
FlatList} from 'react-native';
import firebase from 'firebase';
import db from '../config';



export default class TransactionScreen extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        allTransactions:[],
        lastTransactionVisible:null,
        search:''
      }
    }
    fetchMoreTransaction = async()=>{
      var text = this.state.search.toUpperCase()
      var enteredText = text.split("");
      if(enteredText[0] === "B"){
        const query = await db.collection("transactions").where("bookId","==",text).startAfter(this.state.lastTransactionVisible).limit(10).get()
        query.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastTransactionVisible:doc
          })
        })
      } else if(enteredText[0] === "S"){
        const axe = await db.collection("transactions").where("studentId","==",text).startAfter(this.state.lastTransactionVisible).limit(10).get()
        axe.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastTransactionVisible:doc
          })
        })
      }
    }
    searchTransactions = async(text)=>{
      console.log(this.state.allTransactions + "************************************************************************************************************************************************************************************************************");
      var search = text.split("")
      if(search[0].toUpperCase() === "B"){
        const query = await db.collection("transactions").where("bookId","==",text).get()
        query.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastTransactionVisible:doc
          })
        })
      } else if(search[0].toUpperCase() === "S"){
        const Squery = await db.collection("transactions").where("studentId","==",text).get()
        Squery.docs.map((doc)=>{
          this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()],
            lastTransactionVisible:doc
          })
        })
      }
      console.log(this.state.allTransactions + "************************************************************************************************************************************************************************************************************");
    }
    componentDidMount = async()=>{
      const query = await db.collection("transactions").limit(10).get();
      query.docs.map((doc)=>{
        this.setState({
          allTransactions:[],
          lastTransactionVisible:doc
        })
      })
    }
    

    render() {
      return(
        <View style={styles.container}>
          <View style={styles.searchBar}>
          <TextInput 
          style={styles.bar}
          placeholder={"Write Book or Student ID here"}
          onChangeText={(text)=>{this.setState({search:text})}}
          />
          <TouchableOpacity 
          style={styles.searchButoon}
          onPress={()=>{this.searchTransactions(this.state.search)}}>
            <Text>Submit</Text></TouchableOpacity>
          </View>
          <FlatList
          data={this.state.allTransactions}
          renderItem={({text})=>(
            <View>
              <Text>{"Book Id:" + text.bookId} </Text>
              <Text>{"student Id:" + text.studentId} </Text>
              <Text>{"date:" + text.date.toDate()} </Text>
              <Text>{"Type:" + text.transactionType} </Text>
            </View>
            )
          }
          keyExtractor={(text,index)=>{index.toString()}}
          onEndReached={this.fetchMoreTransaction()}
          onEndReachedThreshold={0.7}
          
          />
        </View>
        )
   }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })