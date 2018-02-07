import React from 'react'
import { StatusBar } from 'react-native'
import { Header, Item, Icon, Input, Text } from 'native-base'

const SearchHeader = props => (
  <Header searchBar rounded>
    <StatusBar barStyle="dark-content" />
    <Item style={{ shadowColor: 'black', shadowOpacity: 0.075, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } }}>
      <Icon name="ios-search" />
      <Input placeholder="Enter a stop, or an address" onChangeText={text => props.handleSearch(text)} value={props.searchInput} />
      {props.searchInput ? <Icon name="ios-close-circle" onPress={props.clearSearch} /> : <Text />}
    </Item>
  </Header>
)

export default SearchHeader
