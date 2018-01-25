import React from 'react'
import { View } from 'react-native'
import { Text } from 'native-base'

const GeofenceList = props => (
  <View
    style={{
      position: 'absolute',
      bottom: 25,
      right: 15,
      left: 15,
      shadowOpacity: 0.25,
      shadowRadius: 25,
      shadowColor: 'black',
      shadowOffset: { height: 0, width: 0 },
      padding: 15,
      backgroundColor: 'white'
    }}
  >
    <Text>
      You are going to <Text style={{ fontWeight: 'bold' }}>{props.destination.name}</Text>
    </Text>
    <Text>
      Your ETA is <Text style={{ fontWeight: 'bold' }}>45 minutes</Text>.
    </Text>
  </View>
)

export default GeofenceList
