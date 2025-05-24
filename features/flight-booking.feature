@flight @ui
Feature: Flight Booking

  Background:
    Given I am on the flight booking page

  Scenario Outline: Book a flight between airports <fromAirport> and <toAirport>
    When I select "<fromAirport>" as the from airport
    And I select "<toAirport>" as the to airport
    And I select "<tripType>" as the trip type
    When I select "<departureDate>" as the "departure" date
    # Only select arrival date if present
    When I select "<arrivalDate>" as the "arrival" date
    Then the selected flight details should be:
      | key           | value           |
      | fromAirport   | <fromAirport>   |
      | toAirport     | <toAirport>     |
      | tripType      | <tripType>      |
      | departureDate | <departureDate> |
      | arrivalDate   | <arrivalDate>   |

    Examples:
      | fromAirport        | toAirport         | tripType   | departureDate    | arrivalDate      |
      | MAA Chennai, India | ATL Atlanta, GA   | Round Trip | 12 days from now | 15 days from now |
      | DEL Delhi, India   | BOM Mumbai, India | One Way    | 10 days from now |                  |
      | JAI Jaipur, India  | DEL Delhi, India  | Round Trip | today            | tomorrow         |
