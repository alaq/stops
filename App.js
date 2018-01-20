import React, { Component } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import {
  Header,
  Item,
  Icon,
  Container,
  Text,
  Content,
  Input,
  List,
  ListItem,
  Left,
  Right,
  Body,
  H1,
  Button,
  Card,
  CardItem,
  Root,
  Toast
} from 'native-base'
import { StackNavigator } from 'react-navigation'

const device = Platform.select({
  ios: 'You are using iOS',
  android: 'You are using Android'
})

class HomeScreen extends Component<{}> {
  constructor(props) {
    super(props)

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      searchInput: '',
      searchResult: [],
      isLoading: false,
      destination: 'Baguette & Company',
      showToast: false
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.setDestination = this.setDestination.bind(this)
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

  setDestination(destination) {
    this.setState({ destination: destination })
  }

  handleSearch(text) {
    const placesAutocomplete = text => {
      fetch('https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyBa2s7Y4_idfCl6UQOhAOJtasI01mQwv0g&input=' + text)
        .then(response => {
          const jsonPredictions = JSON.parse(response._bodyInit).predictions
          this.setState({ searchResult: jsonPredictions })
        })
        .catch(() => {
          Toast.show({
            text: 'No internet connectivity, cannot load destinations.',
            position: 'bottom',
            buttonText: 'Okay'
          })
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
              <Icon name="ios-close-circle" onPress={() => this.setState({ searchInput: '', searchResult: [] })} />
            ) : (
              <Text />
            )}
          </Item>
        </Header>
        <Content>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
              height: 680,
              backgroundColor: 'white'
            }}
          >
            {this.state.searchInput ? (
              <List
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  zIndex: 2,
                  backgroundColor: 'white'
                }}
              >
                <ListItem
                  icon
                  onPress={() =>
                    this.props.navigation.navigate('Details', {
                      place: this.state.searchInput
                    })
                  }
                >
                  <Left>
                    <Icon name="ios-search" />
                  </Left>
                  <Body>
                    <Text>Search "{this.state.searchInput}" as an address...</Text>
                  </Body>
                </ListItem>
                {this.state.searchResult.map(result => {
                  return (
                    <ListItem
                      key={result.id}
                      icon
                      onPress={() =>
                        this.props.navigation.navigate('Details', {
                          place: result,
                          setDestination: this.setDestination
                        })
                      }
                    >
                      <Left>
                        <Icon name="md-map" />
                      </Left>
                      <Body>
                        <Text>{result.structured_formatting.main_text}</Text>
                      </Body>
                    </ListItem>
                  )
                })}
              </List>
            ) : (
              <Text style={{ height: 0 }} />
            )}
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              <H1>Stops</H1>
              <Text>Don't worry, we'll wake you up</Text>
              <Text>{device}</Text>
              <Text>
                {this.state.latitude} : {this.state.longitude}
              </Text>
              <Text />
              <Text />
              <Text />
              <Text />
              <Text />
              <Text />
              <Text />
              <Text />
              <Text />
              <Text />
              <Text />
            </View>
          </View>
        </Content>
        <GeofenceList destination={this.state.destination} />
      </Container>
    )
  }
}

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
      You are going to <Text style={{ fontWeight: 'bold', color: 'white' }}>{props.destination}</Text>
    </Text>
  </Button>
)

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

const RootNavigator = StackNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    Details: {
      path: 'stop/:place',
      screen: DetailsScreen
    }
  },
  {
    headerMode: 'none'
  }
)

export default () => (
  <Root>
    <RootNavigator />
  </Root>
)
