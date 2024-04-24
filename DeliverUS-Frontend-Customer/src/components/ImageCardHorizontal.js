import React from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import TextSemiBold from './TextSemibold'
import * as GlobalStyles from '../styles/GlobalStyles'

// Props: defaultImageUri: {uri: xxx}, imageUri: {uri: xxx}, onPress: () => {}, title: String, badgeText: String, touchable: boolean
// Style props: cardStyle, imageContainerStyle, imageStyle, bodyStyle, titleStyle
export default function ImageCardHorizontal (props) {
  const renderImageCardBody = (props) => {
    return (
      <View style={styles.card} >
        <View>
          <Image style={styles.image} source={props.imageUri} />
        </View>
        <View style={styles.cardBody}>
            <TextSemiBold textStyle={styles.cardTitle}>{props.title}</TextSemiBold>
            {props.children}
        </View>
      </View>
    )
  }

  return (
    props.onPress
      ? <Pressable onPress={props.onPress} style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? GlobalStyles.brandPrimaryTap
            : GlobalStyles.brandBackground,
          borderRadius: 15,
          margin: 2,
          padding: 2
        }
      ]}>
          {renderImageCardBody(props)}
        </Pressable>
      : <>
          {renderImageCardBody(props)}
        </>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: '1%',
    flexDirection: 'column',
    paddingHorizontal: 5,
    paddingTop: 5,
    backgroundColor: 'white',
    borderRadius: 15
  },
  image: {
    borderRadius: 15,
    width: 123,
    height: 123
  },
  cardBody: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    flex: 4,
    position: 'relative',
    width: 123
  },
  cardTitle: {
    fontSize: 15
  }
})
