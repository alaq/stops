import React from 'react'
import { List, ListItem, Left, Icon, Body, Text, View } from 'native-base'

const SearchResult = props => (
  <List>
    {/* <ListItem
      icon
      onPress={() =>
        props.navigation.navigate('Details', {
          place: props.searchInput
        })
      }
    >
      <Left>
        <Icon name="ios-search" />
      </Left>
      <Body>
        <Text>Search "{props.searchInput}" as an address...</Text>
      </Body>
    </ListItem> */}
    {props.searchResult.map(result => {
      return (
        <ListItem
          key={result.id}
          icon
          style={{
            borderRadius: 10,
            backgroundColor: 'white',
            marginRight: 15,
            marginBottom: 5,
            marginTop: 17,
            padding: 25,
            shadowColor: 'black',
            shadowOpacity: 0.1,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 }
          }}
          onPress={() =>
            props.navigation.navigate('Details', {
              place: result,
              setDestination: props.setDestination
            })
          }
        >
          <Left>{result.types.includes('subway_station') ? <Icon name="md-subway" /> : <Icon name="md-bus" />}</Left>
          <Body>
            <Text>{result.name}</Text>
          </Body>
        </ListItem>
      )
    })}
  </List>
)

export default SearchResult
