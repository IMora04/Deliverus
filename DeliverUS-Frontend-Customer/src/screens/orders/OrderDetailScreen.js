/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, ImageBackground, Image, FlatList } from 'react-native'
import { getDetail } from '../../api/OrderEndPoints'
import ImageCard from '../../components/ImageCard'
import * as getDetailRestaurant from '../../api/RestaurantEndpoints'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'

export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState([])

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  const fetchOrderDetail = async () => {
    try {
      const fetchedOrder = await getDetail(route.params.id)
      setOrder(fetchedOrder)
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
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
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

  return (
    <FlatList
        ListEmptyComponent={renderEmptyProductsList}
        data={order.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
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
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
