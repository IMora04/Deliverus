/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, ScrollView, Dimensions } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import { create } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import shoppingCart from '../../../assets/shoppingCart.png'
import restaurantBackground from '../../../assets/restaurantBackground.jpeg'
import logo from '../../../assets/logo.png'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [restaurant, setRestaurant] = useState([])
  const [confirmed, setConfirmed] = useState(0) // TO BE USED
  const [productsByCategory, setProductsByCategory] = useState([])
  const [showOrder, setShowOrder] = useState(false)
  const [categories, setCategories] = useState(null)

  const windowDimensions = Dimensions.get('window')
  const screenDimensions = Dimensions.get('screen')

  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions
  })

  const [columnInfo, setColumnInfo] = useState({
    numColumns: 1,
    cardWidth: 350
  })

  const [maxColumns, setMaxColumns] = useState(10)

  const initialOrder = {
    restaurantId: restaurant.id,
    products: [],
    address: loggedInUser?.address
  }

  const [orderData, setOrderData] = useState(initialOrder)

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window, screen }) => {
        setDimensions({ window, screen })
      }
    )
    return () => subscription?.remove()
  })

  useEffect(() => {
    const windowSizePerCard = dimensions.window.width / 360
    console.log(360 + ((dimensions.window.width - maxColumns * 360) / maxColumns))
    setColumnInfo({
      numColumns: windowSizePerCard > maxColumns ? maxColumns : Math.floor(windowSizePerCard),
      cardWidth: windowSizePerCard > maxColumns ? 350 + ((dimensions.window.width - maxColumns * 360) / maxColumns) : Math.floor(350 + (360 / Math.floor(windowSizePerCard)) * (windowSizePerCard - Math.floor(windowSizePerCard)))
    })
  }, [dimensions, maxColumns])

  useEffect(() => {
    if (!restaurant.products || restaurant.products.length === 0) {
      return
    }
    const prods = {}
    const categories = new Set()
    for (const i in restaurant.products) {
      const categoryName = restaurant.products[i].productCategory.name
      categories.add(categoryName)
      if (!prods[categoryName]) {
        prods[categoryName] = []
      }
      prods[categoryName].push(restaurant.products[i])
    }
    setMaxColumns(Math.max(...Object.values(prods).flatMap(l => l.length)))
    setCategories(categories)
    setProductsByCategory(prods)
  }, [restaurant])

  useEffect(() => {
    fetchRestaurantDetail()
  }, [route])

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : restaurantBackground} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : logo} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const renderCartProduct = ({ item }) => {
    return (
      <View style={styles.cartProduct}>
        <TextSemiBold> {item.name} : <TextRegular> {item.quantity}{'\t'}</TextRegular></TextSemiBold>
        <View style={{ height: 35 }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
              <Pressable
              style={[styles.pressButton, { width: 35, margin: 1 }]}
              onPress={() => {
                item.quantity = item.quantity + 1
                const newOrderData = { ...orderData }
                setOrderData(newOrderData)
              }}>
                <MaterialCommunityIcons name='plus' color={'white'} size={15}/>
              </Pressable>
              <Pressable
              style={[styles.pressButton, { width: 35, margin: 1 }]}
              onPress={() => {
                if (item.quantity === 1) {
                  orderData.products.splice(orderData.products.indexOf(item), 1)
                }
                item.quantity = item.quantity - 1
                const newOrderData = { ...orderData }
                setOrderData(newOrderData)
              }}>
                <MaterialCommunityIcons name='minus' color={'white'} size={15}/>
              </Pressable>
              <View style={{ width: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <TextSemiBold>{item.quantity * item.price}€ </TextSemiBold>
              </View>
          </View>
        </View>

      </View>
    )
  }

  const renderOrderButtons = ({ item }) => {
    const productInArray = orderData.products.find(p => p.productId === item.id)
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
            for (let i = 0; i < orderData.products.length; i++) {
              const product = orderData.products[i]
              if (product.productId === item.id) {
                product.quantity = product.quantity + 1
                found = true
              }
            }
            if (!found) {
              orderData.products.push({ productId: item.id, quantity: 1, name: item.name, price: item.price })
            }
            const newOrderData = { ...orderData }
            setOrderData(newOrderData)
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
            for (let i = 0; i < orderData.products.length; i++) {
              const product = orderData.products[i]
              if (product.productId === item.id) {
                if (product.quantity === 1) {
                  orderData.products.splice(i, 1)
                }
                product.quantity = product.quantity - 1
              }
            }
            const newOrderData = { ...orderData }
            setOrderData(newOrderData)
          }}>
                <MaterialCommunityIcons name='minus' color={'white'} size={15}/>
          </Pressable>
        </View>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      <View style={{ width: columnInfo.cardWidth, marginHorizontal: 5 }}>
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
            { loggedInUser &&
            renderOrderButtons({ item })
            }
          </View>
        </ImageCard>
      </View>
    )
  }

  const totalPriceOrder = (products) => {
    let totPrice = 0
    for (const i in products) {
      totPrice += products[i].price * products[i].quantity
    }
    return totPrice
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
      <View style={styles.contentContainer}>
      <TextRegular>
        No products have been selected
      </TextRegular>
      </View>
    )
  }

  const renderOneCategory = ({ item }) => {
    return (
      <FlatList
      ListHeaderComponent={
        <TextSemiBold textStyle={{ fontSize: 20 }}>
          · {item}
        </TextSemiBold>
      }
      ListHeaderComponentStyle={{ margin: 20 }}
      ListEmptyComponent={renderEmptyProductsList}
      data={productsByCategory[item]}
      numColumns={columnInfo.numColumns}
      renderItem={renderProduct}
      key={columnInfo.numColumns}
      />
    )
  }

  return (
    <ScrollView>
      {
        renderHeader()
      }
      {
        loggedInUser &&
        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: -80 }}>
          <Pressable
            style={[styles.pressButton, { width: 60, margin: 10, padding: 5, height: 60, backgroundColor: GlobalStyles.brandSecondary }]}
          onPress={() => {
            setShowOrder(!showOrder)
          }}>

            <Image style={styles.shoppingCart} source={shoppingCart} />

          </Pressable>
        </View>
      }
      <View style={{ flexDirection: 'row' }}>

      <FlatList
      ListEmptyComponent={renderEmptyProductsList}
      data={categories ? Array.from(categories) : []}
      renderItem={renderOneCategory}
      keyExtractor={item => item}
      />

      {
        showOrder &&
        <View style={styles.cartBox}>
          <FlatList
          style={styles.cartList}
          data = {orderData.products}
          contentContainerStyle={styles.contentContainer}
          renderItem={renderCartProduct}
          scrollEnabled={false}
          keyExtractor={item => item.productId.toString()}
          ListEmptyComponent={renderEmptyOrder}
          >
          </FlatList>
          <TextSemiBold style={{ alignSelf: 'center' }}>Total price: {totalPriceOrder(orderData.products)}€</TextSemiBold>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Pressable
            style={[styles.pressButton, { width: 35, margin: 1 }]}
            onPress={() => {
              showMessage({
                message: 'Order confirmed',
                type: 'success',
                style: GlobalStyles.flashStyle,
                titleStyle: GlobalStyles.flashTextStyle
              })
              try {
                create(orderData)
              } catch (error) {
                console.log(error)
              }
              setConfirmed(confirmed === 0 ? 1 : 0)
              setOrderData(initialOrder)
              setShowOrder(false)
            }}>
              <TextSemiBold>Confirm Order</TextSemiBold>
            </Pressable>

            <Pressable
            style={[styles.pressButton, { width: 35, margin: 1 }]}
            onPress={() => {
              showMessage({
                message: 'Order dismissed',
                type: 'success',
                style: GlobalStyles.flashStyle,
                titleStyle: GlobalStyles.flashTextStyle
              })
              try {
                setOrderData(initialOrder)
              } catch (error) {
                console.log(error)
              }
              setShowOrder(false)
            }}>
              <TextSemiBold>Dismiss Order</TextSemiBold>
            </Pressable>
          </View>
        </View>
      }

      </View>
   </ScrollView>
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 20
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
    width: 300,
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginVertical: 5
  },
  cartBox: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    zIndex: 1,
    marginLeft: -355,
    backgroundColor: GlobalStyles.brandSecondary,
    borderColor: 'black',
    borderRadius: 15,
    marginRight: 5,
    marginTop: 5
  },
  cartList: {
    width: 350,
    padding: 10,
    borderRadius: 15
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
    justifyContent: 'flex-start',
    alignItems: 'center'
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
  shoppingCart: {
    height: 50,
    width: 50,
    margin: 5
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
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  }
})
