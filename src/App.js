import React, { Component } from 'react'
import { Platform, View, StatusBar } from 'react-native'
import { Header, Item, Icon, Container, Text, Content, Input, List, ListItem, Left, Body, H1, Button, Root, Toast } from 'native-base'
import { StackNavigator } from 'react-navigation'
import BackgroundGeolocation from 'react-native-background-geolocation'

import DetailsScreen from './DetailsScreen'

const device = Platform.select({
  ios: 'You are using iOS',
  android: 'You are using Android'
})

class HomeScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      searchInput: '',
      searchResult: [],
      isLoading: false,
      destination: '',
      showToast: false,
      gflatitude: 37.33233141,
      gflongitude: -122.0312186
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.setDestination = this.setDestination.bind(this)
  }

  componentDidMount() {
    console.log('component is mounting')

    navigator.geolocation.watchPosition(
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

    BackgroundGeolocation.on('location', this.onLocation, this.onError)

    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.on('motionchange', this.onMotionChange)

    // This event fires when a change in motion activity is detected
    BackgroundGeolocation.on('activitychange', this.onActivityChange)

    // This event fires when the user toggles location-services authorization
    BackgroundGeolocation.on('providerchange', this.onProviderChange)

    BackgroundGeolocation.on('geofence', this.onGeofence)

    ////
    // 2.  #configure the plugin (just once for life-time of app)
    //
    BackgroundGeolocation.configure(
      {
        // Geolocation Config
        desiredAccuracy: 0,
        distanceFilter: 10,
        // Activity Recognition
        stopTimeout: 1,
        // Application config
        debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
        startOnBoot: true // <-- Auto start tracking when device is powered-up.
      },
      state => {
        console.log('- BackgroundGeolocation is configured and ready: ', state.enabled)

        if (!state.enabled) {
          ////
          // 3. Start tracking!
          //
          BackgroundGeolocation.start(function() {
            console.log('- Start success')
          })
        }
      }
    )

    BackgroundGeolocation.onGeofence(function(geofence, taskId) {
      try {
        var identifier = geofence.identifier
        var action = geofence.action
        var location = geofence.location

        console.log('- A Geofence transition occurred')
        console.log('  identifier: ', identifier)
        console.log('  action: ', action)
        console.log('  location: ', JSON.stringify(location))
      } catch (err) {
        console.error('An error occurred in my code!', err)
      }
      // Be sure to call #finish!!
      BackgroundGeolocation.finish(taskId)
    })
  }

  setDestination(destination) {
    this.setState({ destination: destination })

    // Now we set the geofence for the destination
    BackgroundGeolocation.addGeofence({
      identifier: 'Home',
      radius: 200,
      latitude: this.state.gflatitude,
      longitude: this.state.gflongitude,
      notifyOnEntry: true,
      notifyOnDwell: true
    })
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

  componentWillUnmount() {
    // Remove BackgroundGeolocation listeners
    BackgroundGeolocation.un('location', this.onLocation)
    BackgroundGeolocation.un('motionchange', this.onMotionChange)
    BackgroundGeolocation.un('activitychange', this.onActivityChange)
    BackgroundGeolocation.un('providerchange', this.onProviderChange)

    // Or just remove them all-at-once
    BackgroundGeolocation.removeListeners()
  }
  onLocation(location) {
    // console.log('- [event] location: ', location)
    console.log(location.coords.latitude, location.coords.longitude)
  }
  onError(error) {
    console.warn('- [event] location error ', error)
  }
  onActivityChange(activity) {
    console.log('- [event] activitychange: ', activity) // eg: 'on_foot', 'still', 'in_vehicle'
  }
  onProviderChange(provider) {
    console.log('- [event] providerchange: ', provider)
  }
  onMotionChange(location) {
    console.log('- [event] motionchange: ', location.isMoving, location)
  }

  onGeofence(geofence) {
    console.log('we hit the geofence!', geofence)
  }

  render() {
    return (
      <Container>
        <Header searchBar rounded style={{ backgroundColor: 'darkblue' }}>
          <StatusBar barStyle="light-content" />
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
              <Text>
                {this.state.gflatitude} : {this.state.gflongitude}
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
        {this.state.destination ? <GeofenceList destination={this.state.destination} /> : <Text />}
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
