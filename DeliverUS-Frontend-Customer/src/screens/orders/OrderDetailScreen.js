/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, ImageBackground, Image, FlatList, Pressable } from 'react-native'
import { getDetail, edit } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import * as RestaurantEndpoints from '../../api/RestaurantEndpoints'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import restaurantBackground from '../../../assets/restaurantBackground.jpeg'
import ConfirmationModal from '../../components/ConfirmationModal'

export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState([])
  const [restaurant, setRestaurant] = useState([])
  const [editing, setEditing] = useState('ready')
  const [editedOrder, setEditedOrder] = useState({})

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  useEffect(() => {
    if (editing === 'confirmed') {
      edit(order.id, editedOrder)
      fetchOrderDetail()
      setEditing('ready')
    }
  }, [editing])

  const fetchOrderDetail = async () => {
    try {
      const fetchedOrder = await getDetail(route.params.id)
      setOrder(fetchedOrder)
      const fetchedRestaurant = await RestaurantEndpoints.getDetail(fetchedOrder.restaurantId)
      setRestaurant(fetchedRestaurant)
      const initialOrder = {
        products: [],
        address: fetchedOrder.address
      }
      for (const p in fetchedOrder.products) {
        const product = fetchedOrder.products[p]
        initialOrder.products.push({ productId: product.id, quantity: product.OrderProducts.quantity, name: product.name, price: product.price })
      }
      setEditedOrder(initialOrder)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving order details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2} textStyle={styles.description}>{item.description}</TextRegular>
        <TextRegular textStyle={styles.quantity}>
          Quantity: {item.OrderProducts.quantity}
        </TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {!item.availability &&
          <TextRegular textStyle={styles.availability }>Not available</TextRegular>
        }
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This order has no products yet.
      </TextRegular>
    )
  }

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : restaurantBackground} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : restaurantBackground} />
              <View style={[{ flexDirection: 'column' }]}>
                <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
                <TextSemiBold textStyle={styles.subtext}>Total Price: <TextSemiBold textStyle={{ color: GlobalStyles.brandSecondaryTap }}>{order.price}€</TextSemiBold></TextSemiBold>
              </View>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const renderRestaurantProducts = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <TextRegular numberOfLines={2}>{item.description}</TextRegular>
            <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
            {!item.availability &&
              <TextSemiBold textStyle={styles.availability }>Not available</TextSemiBold>
            }
          </View>
          {
          renderOrderButtons({ item })
          }
        </View>
      </ImageCard>
    )
  }

  const renderOrderButtons = ({ item }) => {
    const productInArray = editedOrder.products.find(p => p.productId === item.id)
    const itemsSelected = productInArray ? productInArray.quantity : 0

    return (
      <View style={{ height: 80 }}>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Pressable
          style={[styles.pressButton, { height: 30, width: 30 }]}
          onPress={() => {
            if (!item.availability) {
              return
            }
            let found = false
            for (let i = 0; i < editedOrder.products.length; i++) {
              const product = editedOrder.products[i]
              if (product.productId === item.id) {
                product.quantity = product.quantity + 1
                found = true
              }
            }
            if (!found) {
              editedOrder.products.push({ productId: item.id, quantity: 1, name: item.name, price: item.price })
            }
            const newOrderData = { ...editedOrder }
            setEditedOrder(newOrderData)
          }}>
            <TextSemiBold textStyle={{ color: 'white', textAlign: 'center' }}>+</TextSemiBold>
          </Pressable>
          <View style={{ flex: 1, justifyContent: 'space-evenly', alignItems: 'center ' }}>
            <TextSemiBold>
              {itemsSelected}
            </TextSemiBold>
          </View>
          <Pressable
          style={[styles.pressButton, { height: 30, width: 30 }]}
          onPress={() => {
            for (let i = 0; i < editedOrder.products.length; i++) {
              const product = editedOrder.products[i]
              if (product.productId === item.id) {
                if (product.quantity === 1) {
                  editedOrder.products.splice(i, 1)
                }
                product.quantity = product.quantity - 1
              }
            }
            const newOrderData = { ...editedOrder }
            setEditedOrder(newOrderData)
          }}>
            <TextSemiBold textStyle={{ color: 'white', textAlign: 'center' }}>-</TextSemiBold>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <>
    {
      renderHeader()
    }
      <>
      {
        order.status === 'pending' &&
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {
          editing === 'editing' &&
          <Pressable
          onPress={() => { setEditing('confirming') }}
          style={{ flexDirection: 'row', justifyContent: 'center', margin: 20, alignItems: 'center', backgroundColor: GlobalStyles.brandSecondary, height: 40, marginTop: -60, width: 150, borderRadius: 15 }}>
            <TextSemiBold textStyle={{ textAlign: 'center' }}>
              Confirm edition
            </TextSemiBold>
          </Pressable>
        }
        {
          editing === 'ready' &&
          <Pressable
          onPress={() => { setEditing('editing') }}
          style={{ flexDirection: 'row', justifyContent: 'center', margin: 20, alignItems: 'center', backgroundColor: GlobalStyles.brandSecondary, height: 40, marginTop: -60, width: 150, borderRadius: 15 }}>
            <TextSemiBold textStyle={{ textAlign: 'center' }}>
              Edit order
            </TextSemiBold>
          </Pressable>
        }
        {
          editing === 'confirming' &&
          <ConfirmationModal
          onCancel={() => { setEditing('editing') }}
          onConfirm={() => { setEditing('confirmed') }}
          >
          <FlatList
          data={editedOrder.products}
          renderItem={ ({ item }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
              <View style={{ flex: 1, width: 350 }}>
                <TextRegular textStyle={{ fontSize: 15 }}>
                  {item.quantity} {item.name}: {item.price}
                </TextRegular>
              </View>
            </View>
          )}
          />
          </ConfirmationModal>
        }
        </View>
      }
      <FlatList
          ListEmptyComponent={renderEmptyProductsList}
          data={editing !== 'ready' ? restaurant.products : order.products}
          renderItem={editing !== 'ready' ? renderRestaurantProducts : renderProduct}
          keyExtractor={item => item.id.toString()}
      />
      </>
    </>
  )
}

const styles = StyleSheet.create({
  description: {
    color: GlobalStyles.brandBlue
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  restaurantHeaderContainer: {
    height: 150,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  textTitle: {
    fontSize: 30,
    color: 'white'
  },
  subtext: {
    fontSize: 15,
    color: 'white'
  },
  quantity: {
    color: 'black'
  },
  pressButton: {
    backgroundColor: GlobalStyles.brandPrimary,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  }
})
