import React from 'react'
import { StatusBar } from 'react-native'
import { Header, Item, Icon, Input, Text } from 'native-base'

const SearchHeader = props => (
  <Header searchBar rounded style={{ backgroundColor: 'darkblue' }}>
    <StatusBar barStyle="light-content" />
    <Item>
      <Icon name="md-map" />
      <Input placeholder="Enter a stop, or an address" onChangeText={text => props.handleSearch(text)} value={props.searchInput} />
      {props.searchInput ? <Icon name="ios-close-circle" onPress={props.clearSearch} /> : <Text />}
    </Item>
  </Header>
)

export default SearchHeader
