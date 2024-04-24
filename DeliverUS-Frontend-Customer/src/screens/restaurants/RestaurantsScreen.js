/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList, View, Pressable, ScrollView } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getAll } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import ImageCardHorizontal from '../../components/ImageCardHorizontal'
import restaurantLogo from '../../../assets/logo.png'
import productImage from '../../../assets/product.jpeg'
import { getTopProducts } from '../../api/ProductEndpoints'

export default function RestaurantsScreen ({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [showProducts, setShowProducts] = useState(1)

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
      <ImageCardHorizontal
      imageUri = {item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : productImage}
      title={item.name}
      onPress={() => {
        navigation.navigate('RestaurantDetailScreen', { id: item.restaurant.id })
      }}
      >
      <TextRegular numberOfLines={2}>{item.description}</TextRegular>
      <TextSemiBold>Restaurant: <TextSemiBold textStyle={{ color: 'black' }}>{item.restaurant.name}</TextSemiBold></TextSemiBold>
      </ImageCardHorizontal>
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

  return (showProducts === 1
    ? <ScrollView>
    <View style={{ flexDirection: 'row' }}>
      <View style={[{ flex: 2 }]}></View>
      <Pressable
      style={[styles.button, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
      onPress={() => {
        setShowProducts(showProducts === 0 ? 1 : 0)
      }}>
        <TextSemiBold style={{ textAlign: 'center' }}>
          Show top products
        </TextSemiBold>
      </Pressable>
      <View style={[{ flex: 2 }]}></View>
    </View>
    <FlatList
      data = {restaurants}
      renderItem={renderRestaurant}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderRestaurantHeader}
      ListEmptyComponent={renderEmptyRestaurantsList}
    />
    </ScrollView>
    : <ScrollView>
    <View style={{ flexDirection: 'row' }}>
      <View style={[{ flex: 2 }]}></View>
      <Pressable
      style={[styles.button, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
      onPress={() => {
        setShowProducts(showProducts === 0 ? 1 : 0)
      }}>
        <TextSemiBold style={{ textAlign: 'center' }}>
          Hide top products
        </TextSemiBold>
      </Pressable>
      <View style={[{ flex: 2 }]}></View>
    </View>

    <FlatList
      style={[{ marginTop: 20 }]}
      horizontal = {true}
      data = {topProducts}
      contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      renderItem={renderProduct}
      scrollEnabled={false}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={renderEmptyProductsList}
    />
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
    width: '100%',
    backgroundColor: GlobalStyles.brandPrimary
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
