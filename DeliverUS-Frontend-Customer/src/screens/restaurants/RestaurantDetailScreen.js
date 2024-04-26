/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, ScrollView } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [restaurant, setRestaurant] = useState({})
  // TODO: Use user address
  const [orderData, setOrderData] = useState({
    restaurantId: restaurant.id,
    products: [],
    address: 'testAddress'
  })
  const [showOrder, setShowOrder] = useState(0)

  useEffect(() => {
    fetchRestaurantDetail()
  }, [route])

  const renderHeader = () => {
    return (
      <View>
        <View style={styles.FRHeader}>
          <TextSemiBold>FR3: Add, edit and remove products to a new order.</TextSemiBold>
          <TextRegular>A customer can add several products, and several units of a product to a new order. Before confirming, customer can edit and remove products. Once the order is confirmed, it cannot be edited or removed.</TextRegular>
          <TextSemiBold>FR4: Confirm or dismiss new order.</TextSemiBold>
          <TextRegular>Customers will be able to confirm or dismiss the order before sending it to the backend.</TextRegular>
        </View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const renderCartProduct = ({ item }) => {
    return (
      <View>
        <TextSemiBold> {item.name} : <TextRegular> {item.quantity} </TextRegular> </TextSemiBold>
        <>
            <Pressable
              onPress={() => {
                item.quantity = item.quantity + 1
                const newOrderData = { ...orderData }
                setOrderData(newOrderData)
              }}>
              <TextRegular>+</TextRegular>
            </Pressable>
            <Pressable
              onPress={() => {
                if (item.quantity !== 1) {
                  item.quantity = item.quantity - 1
                } else {
                  orderData.products.splice(orderData.products.indexOf(item))
                }
                const newOrderData = { ...orderData }
                setOrderData(newOrderData)
              }}>
              <TextRegular>-</TextRegular>
            </Pressable>
          </>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    const productInArray = orderData.products.find(p => p.productId === item.id)
    const itemsSelected = productInArray ? productInArray.quantity : 0
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {!item.availability &&
          <TextRegular textStyle={styles.availability }>Not available</TextRegular>
        }
        { loggedInUser &&
          <>
            <Pressable
            // TODO: Order just when logged in
            // TODO: Change button style
              onPress={() => {
                if (!item.availability) {
                  return
                }
                let found = false
                for (let i = 0; i < orderData.products.length; i++) {
                  const product = orderData.products[i]
                  if (product.productId === item.id) {
                    product.quantity = product.quantity + 1
                    found = true
                  }
                }
                if (!found) {
                  orderData.products.push({ productId: item.id, quantity: 1, name: item.name })
                }
                const newOrderData = { ...orderData }
                setOrderData(newOrderData)
              }}>
              <TextRegular>+</TextRegular>
            </Pressable>
            <TextRegular>{itemsSelected}</TextRegular>
            <Pressable
              onPress={() => {
                for (let i = 0; i < orderData.products.length; i++) {
                  const product = orderData.products[i]
                  if (product.productId === item.id) {
                    if (product.quantity !== 1) {
                      product.quantity = product.quantity - 1
                    } else {
                      orderData.products.splice(i)
                    }
                  }
                }
                const newOrderData = { ...orderData }
                setOrderData(newOrderData)
              }}>
              <TextRegular>-</TextRegular>
            </Pressable>
          </>
        }
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
      orderData.restaurantId = fetchedRestaurant.id
      setOrderData(orderData)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderEmptyOrder = () => {
    return (
      <TextRegular>
        No products have been selected
      </TextRegular>
    )
  }

  return (
    <ScrollView>
      <FlatList
        ListHeaderComponent={renderHeader}
      />
      <View style={{ flexDirection: 'row' }}>
        <View style={[{ flex: 2 }]}></View>
        <Pressable
        style={[styles.button, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
        onPress={() => {
          setShowOrder(showOrder === 0 ? 1 : 0)
        }}>

          {
            showOrder === 0 &&
            <TextSemiBold style={styles.buttonText}>
            Show Order details
            </TextSemiBold>
          }

          {
            showOrder === 1 &&
            <TextSemiBold style={styles.buttonText}>
            Hide order details
            </TextSemiBold>
          }

        </Pressable>
        <View style={[{ flex: 2 }]}></View>
      </View>

      {
        showOrder === 1 &&
        <FlatList
        style={{ marginVertical: 20 }}
        data = {orderData.products}
        contentContainerStyle={styles.contentContainer}
        renderItem={renderCartProduct}
        scrollEnabled={false}
        keyExtractor={item => item.productId.toString()}
        ListEmptyComponent={renderEmptyOrder}
        />
      }
      <FlatList
          ListEmptyComponent={renderEmptyProductsList}
          data={restaurant.products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
        />
   </ScrollView>
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 20
  },
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    textAlign: 'center',
    color: 'white'
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
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%',
    backgroundColor: GlobalStyles.brandPrimary
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  }
})
