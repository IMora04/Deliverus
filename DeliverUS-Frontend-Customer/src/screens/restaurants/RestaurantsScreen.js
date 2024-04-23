/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Pressable, FlatList } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getAll } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'

export default function RestaurantsScreen ({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])

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

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retreived.
      </TextRegular>
    )
  }

  const renderHeader = () => {
    return (
      <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
        <TextRegular textStyle={styles.text}>
          Restaurant List
        </TextRegular>
      </View>
    )
  }

  return (
     <FlatList
      data={restaurants}
      renderItem={renderRestaurant}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyRestaurantsList}
    />
  )
}
const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
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
    color: 'black',
    textAlign: 'center'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
