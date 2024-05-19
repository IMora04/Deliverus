/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, ImageBackground, Image, FlatList, Pressable } from 'react-native'
import { getDetail, edit, remove } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import * as RestaurantEndpoints from '../../api/RestaurantEndpoints'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import restaurantBackground from '../../../assets/restaurantBackground.jpeg'
import ConfirmationModal from '../../components/ConfirmationModal'
import DeleteModal from '../../components/DeleteModal'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState([])
  const [restaurant, setRestaurant] = useState([])
  const [editing, setEditing] = useState('ready')
  const [editedOrder, setEditedOrder] = useState({})
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)

  const totalPriceOrder = (products) => {
    let totalPrice = 0
    for (const i in products) {
      totalPrice += products[i].price * products[i].quantity
    }
    return totalPrice
  }

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  useEffect(() => {
    if (editing === 'confirmed') {
      if (editedOrder.products.length !== 0) {
        edit(order.id, editedOrder)
      } else {
        showMessage({
          message: 'You cannot create an empty order.',
          type: 'warning',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
      fetchOrderDetail()
      setEditing('ready')
    }
    if (editing === 'ready') {
      fetchOrderDetail()
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
                <TextSemiBold textStyle={styles.subtext}>Shipping costs: {restaurant.shippingCosts}€ (under 10€)</TextSemiBold>
                <TextSemiBold textStyle={styles.subtext}>Total Price: <TextSemiBold textStyle={{ color: GlobalStyles.brandSecondaryTap }}>{totalPriceOrder(editedOrder.products)}€</TextSemiBold></TextSemiBold>
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
                <MaterialCommunityIcons name='plus' color={'white'} size={15}/>
          </Pressable>
          <View style={{ flex: 1, justifyContent: 'space-evenly', alignItems: 'center ' }}>
            <TextRegular textStyle={{ fontSize: 15 }}>
              {itemsSelected}
            </TextRegular>
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
                <MaterialCommunityIcons name='minus' color={'white'} size={15}/>
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
            editing !== 'editing' &&
            <Pressable
            onPress={async () => { setOrderToBeDeleted(order) }}
            style={{ flexDirection: 'row', justifyContent: 'center', margin: 20, alignItems: 'center', backgroundColor: GlobalStyles.brandPrimary, height: 40, marginTop: -60, width: 150, borderRadius: 15 }}>
              <TextSemiBold textStyle={{ textAlign: 'center', color: 'white' }}>
                Delete Order
              </TextSemiBold>
            </Pressable>
          }
          {
            editing === 'editing' &&
            <>
            <Pressable
            onPress={() => { setEditing('ready') }}
            style={{ flexDirection: 'row', justifyContent: 'center', margin: 20, alignItems: 'center', backgroundColor: GlobalStyles.brandPrimary, height: 40, marginTop: -60, width: 150, borderRadius: 15 }}>
              <TextSemiBold textStyle={{ textAlign: 'center', color: 'white' }}>
                Back
              </TextSemiBold>
            </Pressable>
            <Pressable
            onPress={() => { setEditing('confirming') }}
            style={{ flexDirection: 'row', justifyContent: 'center', margin: 20, alignItems: 'center', backgroundColor: GlobalStyles.brandBlueTap, height: 40, marginTop: -60, width: 150, borderRadius: 15 }}>
              <TextSemiBold textStyle={{ textAlign: 'center', color: 'white' }}>
                Confirm edition
              </TextSemiBold>
            </Pressable>
            </>
          }
          {
            editing === 'ready' &&
            <Pressable
            onPress={() => { setEditing('editing') }}
            style={{ flexDirection: 'row', justifyContent: 'center', margin: 20, alignItems: 'center', backgroundColor: GlobalStyles.brandBlueTap, height: 40, marginTop: -60, width: 150, borderRadius: 15 }}>
              <TextSemiBold textStyle={{ textAlign: 'center', color: 'white' }}>
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
              <View style={{ flexDirection: 'row' }}>

                      <FlatList
                      data = {editedOrder.products}
                      contentContainerStyle={{ flex: 1, marginRight: 10, marginTop: 20, width: 150 }}
                      renderItem={ ({ item }) => (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                        <TextSemiBold>{item.name}: <TextRegular> {item.quantity}  </TextRegular></TextSemiBold>
                        <TextSemiBold>{item.quantity * item.price}€ </TextSemiBold>
                        </View>
                      )}
                      keyExtractor={item => item.productId.toString()}
                      />
                        <View style={{ }}>
                          <View style={{ flexDirection: 'row' }}>
                            <TextRegular textStyle={{ fontSize: 15, marginVertical: 2, textAlign: 'left', flex: 3, marginTop: 25 }}>Price:{'\t'}</TextRegular>
                            <TextRegular textStyle={{ fontSize: 15, marginVertical: 2, textAlign: 'left', flex: 1, marginTop: 25 }}>
                              {totalPriceOrder(editedOrder.products)}€
                              </TextRegular>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <TextRegular textStyle={{ fontSize: 15, marginVertical: 2, textAlign: 'left', flex: 3 }}>Shipping:{'\t'}</TextRegular>
                            <TextRegular textStyle={{ fontSize: 15, marginVertical: 2, textAlign: 'left', flex: 1 }}>
                              {totalPriceOrder(editedOrder.products) < 10
                                ? restaurant.shippingCosts + '€'
                                : 'FREE!'}
                          </TextRegular>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <TextSemiBold textStyle={{ marginVertical: 5, textAlign: 'left', flex: 3, fontSize: 15 }}>Order total:{'\t'}</TextSemiBold>
                            <TextSemiBold textStyle={{ marginVertical: 5, textAlign: 'left', flex: 1, fontSize: 15 }}>
                              {totalPriceOrder(editedOrder.products) < 10
                                ? totalPriceOrder(editedOrder.products) + restaurant.shippingCosts
                                : totalPriceOrder(editedOrder.products)}€
                            </TextSemiBold>
                          </View>
                        </View>
              </View>
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
      <DeleteModal
        isVisible={orderToBeDeleted !== null}
        onCancel={() => setOrderToBeDeleted(null)}
        onConfirm={() => [remove(orderToBeDeleted.id),
          navigation.navigate('OrdersScreen')]
        }>
      </DeleteModal>
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
    fontSize: 13,
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
  },
  cartProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginVertical: 5
  }
})
