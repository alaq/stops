import React from 'react'
import { List, ListItem, Left, Icon, Body, Text } from 'native-base'

const SearchResult = props => (
  <List>
    <ListItem
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
    </ListItem>
    {props.searchResult.map(result => {
      return (
        <ListItem
          key={result.id}
          icon
          onPress={() =>
            props.navigation.navigate('Details', {
              place: result,
              setDestination: props.setDestination
            })
          }
        >
          <Left>
            <Icon name="md-map" />
          </Left>
          <Body>
            <Text>{result.name}</Text>
          </Body>
        </ListItem>
      )
    })}
  </List>
)

export default SearchResult
