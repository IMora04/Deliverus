/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList, View, Pressable, ScrollView, Dimensions } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getAll } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/logo.png'
import productImage from '../../../assets/product.jpeg'
import { getTopProducts } from '../../api/ProductEndpoints'

export default function RestaurantsScreen ({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [showProducts, setShowProducts] = useState(0)

  const windowDimensions = Dimensions.get('window')
  const screenDimensions = Dimensions.get('screen')

  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions
  })

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
    async function fetchRestaurants () {
      try {
        const fetchedRestaurants = await getAll()
        setRestaurants(fetchedRestaurants)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurants. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchRestaurants()
  }, [route])

  useEffect(() => {
    async function fetchTopProducts () {
      try {
        const fetchedProducts = await getTopProducts()
        setTopProducts(fetchedProducts)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving the 3 top products. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchTopProducts()
  }, [route])

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
      imageUri = {item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
      title={item.name}
      onPress={() => {
        navigation.navigate('RestaurantDetailScreen', { id: item.id })
      }}
      >
      <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>}
      <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
      imageUri = {item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : productImage}
      title={item.name}
      onPress={() => {
        navigation.navigate('RestaurantDetailScreen', { id: item.restaurant.id })
      }}
      >
      <TextRegular numberOfLines={2}>{item.description}</TextRegular>
      <TextSemiBold>Restaurant: <TextSemiBold textStyle={{ color: 'black' }}>{item.restaurant.name}</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextSemiBold textStyle={styles.emptyList}>
        No restaurants were retreived.
      </TextSemiBold>
    )
  }

  const renderRestaurantHeader = () => {
    return (
      <TextSemiBold textStyle={[styles.text, { margin: 20 }]}>
        Restaurants
      </TextSemiBold>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular>
        No top products were retreived.
      </TextRegular>
    )
  }

  return (
  <ScrollView>
    <View style={{ flexDirection: 'row' }}>
      <View style={[{ flex: 2 }]}></View>
      <Pressable
      style={[styles.button, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
      onPress={() => {
        setShowProducts(showProducts === 0 ? 1 : 0)
      }}>

        {
          showProducts === 0 &&
          <TextSemiBold style={styles.buttonText}>
          Show top products
          </TextSemiBold>
        }

        {
          showProducts === 1 &&
          <TextSemiBold style={styles.buttonText}>
          Hide top products
          </TextSemiBold>
        }

      </Pressable>
      <View style={[{ flex: 2 }]}></View>
    </View>

    {
      showProducts === 1 &&
      <FlatList
      style={{ marginVertical: 20 }}
      horizontal = {true}
      data = {topProducts}
      contentContainerStyle={[styles.contentContainer, { flexDirection: dimensions.window.width > 450 ? 'row' : 'column' }]}
      renderItem={renderProduct}
      scrollEnabled={false}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={renderEmptyProductsList}
      />
    }

    <FlatList
      data = {restaurants}
      renderItem={renderRestaurant}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderRestaurantHeader}
      ListEmptyComponent={renderEmptyRestaurantsList}
    />
  </ScrollView>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%',
    backgroundColor: GlobalStyles.brandPrimary
  },
  productView: {
    flex: 1,
    flexShrink: 1,
    flexDirection: 'row'
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
  text: {
    fontSize: 16,
    color: 'black',
    textAlign: 'left'
  },
  emptyList: {
    fontSize: 16,
    textAlign: 'center',
    padding: 50
  }
})
