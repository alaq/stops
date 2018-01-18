import React, { Component } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import {
  Header,
  Item,
  Icon,
  Container,
  Text,
  Content,
  Input
} from 'native-base'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu'
})

export default class App extends Component<{}> {
  constructor(props) {
    super(props)

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      searchInput: '',
      searchResult: [],
      isLoading: false
    }
    this.handleSearch = this.handleSearch.bind(this)
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        })
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    )
  }

  handleSearch(text) {
    const placesAutocomplete = text => {
      fetch(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyBa2s7Y4_idfCl6UQOhAOJtasI01mQwv0g&input=' +
          text
      ).then(response => {
        const jsonPredictions = JSON.parse(response._bodyInit).predictions
        this.setState({ searchResult: jsonPredictions })
      })
    }

    if (text.length > 2 && !this.state.isLoading) {
      this.setState({ searchInput: text, isLoading: true })
      placesAutocomplete(text)
      setTimeout(() => {
        this.setState({ isLoading: false })
        placesAutocomplete(this.state.searchInput)
      }, 2000)
    } else {
      this.setState({ searchInput: text })
    }
  }

  render() {
    return (
      <Container>
        <Header searchBar rounded>
          <Item>
            <Icon name="md-map" />
            <Input
              placeholder="Enter a stop, or an address"
              onChangeText={text => this.handleSearch(text)}
              value={this.state.searchInput}
            />
            {this.state.searchInput ? (
              <Icon
                name="ios-close-circle"
                onPress={() => this.setState({ searchInput: '' })}
              />
            ) : (
              <Text />
            )}
          </Item>
        </Header>
        <Content>
          <Text>Welcome to Stops!</Text>
        </Content>
      </Container>
    )
  }
}
