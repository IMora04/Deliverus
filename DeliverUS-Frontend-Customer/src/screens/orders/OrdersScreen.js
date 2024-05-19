import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, FlatList, ImageBackground, View } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { getAll } from '../../api/OrderEndpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/logo.png'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { useIsFocused } from '@react-navigation/native'
import ordersBackground from '../../../assets/ordersBackground2.png'

export default function OrdersScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [orders, setOrders] = useState([])
  const isFocused = useIsFocused()

  useEffect(() => {
    if (!isFocused) {
      return
    }
    async function fetchOrders () {
      try {
        const fetchedOrders = await getAll()
        fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setOrders(fetchedOrders)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving orders. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchOrders()
  }, [isFocused, loggedInUser])

  const renderOrder = ({ item }) => {
    return (
      <ImageCard
      imageUri = {item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogo}
      title={item.name}
      onPress={() => {
        navigation.navigate('OrderDetailScreen', { id: item.id })
      }}
      >
      <TextSemiBold>{item.restaurant.name}</TextSemiBold>
      <TextRegular>Order status: <TextRegular textStyle={{ color: GlobalStyles.brandGreen }}>{item.status}</TextRegular></TextRegular>

      {
        item.deliveredAt &&
        <>
        <TextRegular>Order date: <TextRegular textStyle={{ color: GlobalStyles.flashStyle }}>{String(item.deliveredAt).slice(0, 10)}</TextRegular></TextRegular>
        </>
      }

      {
        item.sentAt && !item.deliveredAt &&
        <>
        <TextRegular>Order date: <TextRegular textStyle={{ color: GlobalStyles.flashStyle }}>{String(item.sentAt).slice(0, 10)}</TextRegular></TextRegular>
        </>
      }

      <TextRegular>Address: <TextRegular textStyle={{ color: GlobalStyles.brandPrimary }}>{item.address}</TextRegular></TextRegular>
      <TextSemiBold>Total Price: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.price}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  const renderOrdersHeader = () => {
    return (
      <View>
        <ImageBackground source={ ordersBackground } style={styles.imageBackground}>
          <View style={styles.headerContainer}>
            <TextSemiBold textStyle={styles.title}>Orders</TextSemiBold>
          </View>
        </ImageBackground>
      </View>
    )
  }
  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No orders were retreived.
      </TextRegular>
    )
  }
  return (
    <FlatList
      data = {orders}
      renderItem={renderOrder}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderOrdersHeader}
      ListEmptyComponent={renderEmptyOrdersList}
      />
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  buttonText: {
    borderRadius: 8,
    margin: 10,
    padding: 10,
    width: '50%',
    backgroundColor: GlobalStyles.brandPrimary
  },
  title: {
    color: 'white',
    fontSize: 24,
    margin: 10,
    padding: 10
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  headerContainer: {
    height: 150,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  }
})
