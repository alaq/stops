import React from 'react'
import { View, ImageBackground } from 'react-native'
import { Text, H1, Button, Icon } from 'native-base'

const DetailsScreen = ({ navigation }) => (
  <ImageBackground source={require('../map.jpg')} style={{ width: '100%', height: '100%' }}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
      <H1>{navigation.state.params.place.name}</H1>
      <Text>Estimated time to destination: 45 minutes</Text>
      <Text />
      <Text />
      <Button
        large
        dark
        block
        iconLeft
        style={{ alignSelf: 'auto' }}
        onPress={() => {
          navigation.state.params.setDestination(navigation.state.params.place)
          navigation.goBack(null)
        }}
      >
        <Icon name="bus" />
        <Text>I am going there</Text>
      </Button>
      <Text />
      <Button style={{ alignSelf: 'auto' }} onPress={() => navigation.goBack(null)}>
        <Text>Go back</Text>
      </Button>
    </View>
  </ImageBackground>
)

export default DetailsScreen
