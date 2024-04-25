import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, FlatList } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { getAll } from '../../api/OrderEndPoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/logo.png'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function OrdersScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    async function fetchOrders () {
      try {
        const fetchedOrders = await getAll()
        fetchedOrders.sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt))
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
  }, [route, loggedInUser])

  const renderOrder = ({ item }) => {
    // TODO: add some more properties and reorder them
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
        <TextRegular>Deliver time: <TextRegular textStyle={{ color: GlobalStyles.flashStyle }}>{String(item.deliveredAt).slice(11, 19)}</TextRegular></TextRegular>
        </>
      }

      {
        item.sentAt && !item.deliveredAt &&
        <>
        <TextRegular>Order date: <TextRegular textStyle={{ color: GlobalStyles.flashStyle }}>{String(item.sentAt).slice(0, 10)}</TextRegular></TextRegular>
        <TextRegular>Shipping time: <TextRegular textStyle={{ color: GlobalStyles.flashStyle }}>{String(item.sentAt).slice(11, 19)}</TextRegular></TextRegular>
        </>
      }

      <TextRegular>Address: <TextRegular textStyle={{ color: GlobalStyles.brandPrimary }}>{item.address}</TextRegular></TextRegular>
      <TextSemiBold>Total Price: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.price}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    // TODO: Center, bold text.
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
      ListEmptyComponent={renderEmptyOrdersList}
      />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  }
})
