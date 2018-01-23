import React from 'react'
import { View } from 'react-native'
import { Text, H1, Button, Icon } from 'native-base'

const DetailsScreen = ({ navigation }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <H1>{navigation.state.params.place.structured_formatting.main_text}</H1>
    <Text>{navigation.state.params.place.structured_formatting.secondary_text}</Text>
    <Text />
    <Text />
    <Button
      large
      dark
      block
      iconLeft
      style={{ alignSelf: 'auto' }}
      onPress={() => {
        navigation.state.params.setDestination(navigation.state.params.place.structured_formatting.main_text)
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
)

export default DetailsScreen
