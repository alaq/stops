import React, { Component } from 'react'
import { Platform, View, AsyncStorage } from 'react-native'
import { Button, Container, Text, Content, H1, Root, Toast, Icon, StyleProvider } from 'native-base'
import getTheme from '../native-base-theme/components'
// import material from '../native-base-theme/variables/material'
// import commonColor from '../native-base-theme/variables/commonColor'
import platform from '../native-base-theme/variables/platform'
import { StackNavigator } from 'react-navigation'
import BackgroundGeolocation from 'react-native-background-geolocation'
import PushNotification from 'react-native-push-notification'

import DetailsScreen from './DetailsScreen'
import Onboarding from './Onboarding'
import GeofenceList from './GeofenceList'
import SearchHeader from './SearchHeader'
import SearchResult from './SearchResult'
import checkIfFirstLaunch from './checkIfFirstLaunch'

import getDirections from 'react-native-google-maps-directions'

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function(token) {
    console.log('TOKEN:', token)
  },

  // (required) Called when a remote or local notification is opened or received
  onNotification: function(notification) {
    console.log('NOTIFICATION:', notification)

    // process the notification

    // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
    notification.finish(PushNotificationIOS.FetchResult.NoData)
  },

  // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
  senderID: 'YOUR GCM SENDER ID',

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   */
  requestPermissions: true
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
      isFirstLaunch: false,
      hasCheckedAsyncStorage: false
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.setDestination = this.setDestination.bind(this)
    this.clearSearch = this.clearSearch.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  async componentWillMount() {
    // AsyncStorage.clear() // Use when you want to display the onboarding screen again
    const isFirstLaunch = await checkIfFirstLaunch()
    this.setState({ isFirstLaunch, hasCheckedAsyncStorage: true })
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

      BackgroundGeolocation.removeGeofence(identifier)

      PushNotification.localNotification({
        /* Android Only Properties */
        id: '0', // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
        ticker: 'My Notification Ticker', // (optional)
        autoCancel: true, // (optional) default: true
        largeIcon: 'ic_launcher', // (optional) default: "ic_launcher"
        smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher"
        bigText: 'My big text that will be shown when notification is expanded', // (optional) default: "message" prop
        subText: 'This is a subText', // (optional) default: none
        color: 'red', // (optional) default: system default
        vibrate: true, // (optional) default: true
        vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        tag: 'some_tag', // (optional) add tag to message
        group: 'group', // (optional) add group to message
        ongoing: false, // (optional) set whether this is an "ongoing" notification

        /* iOS and Android properties */
        title: 'You have reached your stop!', // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
        message: 'You have reached', // + this.state.destination, // (required)
        playSound: true, // (optional) default: true
        soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        // number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
        repeatType: 'day', // (Android only) Repeating interval. Could be one of `week`, `day`, `hour`, `minute, `time`. If specified as time, it should be accompanied by one more parameter 'repeatTime` which should the number of milliseconds between each interval
        actions: '["Yes", "No"]' // (Android only) See the doc for notification actions to know more
      })
    })
  }

  setDestination(destination) {
    this.setState({
      destination: destination,
      searchResult: [],
      searchInput: ''
    })

    // Now we set the geofence for the destination
    BackgroundGeolocation.addGeofence({
      identifier: destination.name,
      radius: 100,
      latitude: destination.geometry.location.lat,
      longitude: destination.geometry.location.lng,
      notifyOnEntry: true,
      notifyOnDwell: true
    })

    console.log('Geofence added:', destination.name, destination.geometry.location.lat, destination.geometry.location.lng)
  }
  handleSearch(text) {
    const placesAutocomplete = text => {
      fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${this.state.latitude},${
          this.state.longitude
        }&radius=50000&type=transit_station&key=AIzaSyBa2s7Y4_idfCl6UQOhAOJtasI01mQwv0g&keyword=` + text
      )
        .then(response => {
          const jsonPredictions = JSON.parse(response._bodyText).results
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

  clearSearch() {
    this.setState({ searchInput: '', searchResult: [] })
  }

  handleGetDirections = () => {
    const data = {
      source: {
        latitude: -33.8356372,
        longitude: 18.6947617
      },
      destination: {
        latitude: -33.8600024,
        longitude: 18.697459
      },
      params: [
        {
          key: 'dirflg',
          value: 'w'
        }
      ]
    }

    getDirections(data)
  }

  handleCancel() {
    BackgroundGeolocation.removeGeofence(this.state.destination.name)
    this.setState({ destination: '' })
  }

  render() {
    if (!this.state.hasCheckedAsyncStorage) return null

    if (this.state.isFirstLaunch) return <Onboarding />
    else
      return (
        <StyleProvider style={getTheme(platform)}>
          <Container>
            <SearchHeader searchInput={this.state.searchInput} clearSearch={this.clearSearch} handleSearch={this.handleSearch} />
            <Content style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                  backgroundColor: 'white'
                }}
              >
                {this.state.searchInput ? (
                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      zIndex: 2,
                      backgroundColor: 'white'
                    }}
                  >
                    <SearchResult
                      searchInput={this.state.searchInput}
                      searchResult={this.state.searchResult}
                      navigation={this.props.navigation}
                      setDestination={this.setDestination}
                    />
                  </View>
                ) : (
                  <Text style={{ height: 0 }} />
                )}
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    paddingBottom: 100
                  }}
                >
                  <H1>Stops</H1>
                  <Text>Don't worry, we'll wake you up</Text>
                  <Text />
                  {this.state.destination ? (
                    <View>
                      <Button large dark block iconLeft style={{ alignSelf: 'auto' }} onPress={this.handleGetDirections}>
                        <Icon name="md-map" />
                        <Text>Open in Google Maps</Text>
                      </Button>
                      <Text />
                      <Button bordered warning style={{ alignSelf: 'auto' }} onPress={this.handleCancel} style={{ alignItems: 'center' }}>
                        <Text>Cancel</Text>
                      </Button>
                    </View>
                  ) : (
                    <Text />
                  )}
                  <Text />
                </View>
              </View>
            </Content>
            {this.state.destination ? <GeofenceList destination={this.state.destination} /> : <Text style={{ height: 0 }} />}
          </Container>
        </StyleProvider>
      )
  }
}

const RootNavigator = StackNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    Details: {
      path: 'stop/:place',
      screen: DetailsScreen
    },
    Onboarding: {
      path: 'stop/onboarding',
      screen: Onboarding
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
