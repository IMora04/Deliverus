import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList, View, Pressable, ImageBackground, Image, TimePickerAndroid } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { brandPrimary, brandPrimaryTap } from '../../styles/GlobalStyles'
import { getAll } from '../../api/OrderEndPoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/logo.png'

export default function OrdersScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])

  useEffect(() => {
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
  }, [route])

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
        <View style={styles.FRHeader}>
          <TextSemiBold textStyle={[styles.text, { margin: 20 }]}>
            All your orders
          </TextSemiBold>
        </View>
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
    fontSize: 18,
    color: 'black',
    textAlign: 'center'
  }
})
