import React from 'react'
import { Text, Button, Icon } from 'native-base'

const GeofenceList = props => (
  <Button
    rounded
    block
    iconLeft
    style={{
      position: 'absolute',
      bottom: 25,
      right: 15,
      left: 15,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowColor: 'black',
      shadowOffset: { height: 0, width: 0 }
    }}
  >
    <Icon name="bus" />
    <Text>
      You are going to <Text style={{ fontWeight: 'bold', color: 'white' }}>{props.destination.name}</Text>
    </Text>
  </Button>
)

export default GeofenceList
