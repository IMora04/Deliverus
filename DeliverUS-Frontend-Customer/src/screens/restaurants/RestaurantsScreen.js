/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getAll } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'

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

  return (
    <View style={styles.container}>
      <View style={styles.FRHeader}>
        <TextSemiBold>FR1: Restaurants listing.</TextSemiBold>
        <TextRegular>List restaurants and enable customers to navigate to restaurant details so they can create and place a new order</TextRegular>
        <TextSemiBold>FR7: Show top 3 products.</TextSemiBold>
        <TextRegular>Customers will be able to query top 3 products from all restaurants. Top products are the most popular ones, in other words the best sellers.</TextRegular>
      </View>
      <Pressable
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: 1 }) // TODO: Change this to the actual restaurant id as they are rendered as a FlatList
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandPrimaryTap
              : GlobalStyles.brandPrimary
          },
          styles.button
        ]}
      >
        <TextRegular textStyle={styles.text}>Go to Restaurant Detail Screen</TextRegular>
      </Pressable>
    </View>
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
    color: 'white',
    textAlign: 'center'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
