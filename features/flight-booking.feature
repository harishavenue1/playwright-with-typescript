@flight @smoke @ui
Feature: Flight Booking
#   Scenario: Book a round trip flight
#     Given I am on the flight booking page
#     When I select "JAI Jaipur, India" as the from airport
#     And I select "DEL Delhi, India" as the to airport
#     And I select "Round Trip" as the trip type
#     # And I select "2025-06-01" as the departure date
#     When I select "today" as the "departure" date
#     When I select "tomorrow" as the "arrival" date
# # When I select "10 days from now" as the departure date
# # When I select "2025-06-10" as the departure date
#     # And I select "2024-06-10" as the return date
#     # Then the form should reflect my selections

  Background:
    Given I am on the flight booking page

  Scenario Outline: Book a flight between airports <fromAirport> and <toAirport>
    When I select "<fromAirport>" as the from airport
    And I select "<toAirport>" as the to airport
    And I select "<tripType>" as the trip type
    When I select "<departureDate>" as the "departure" date
    # Only select arrival date if present
    When I select "<arrivalDate>" as the "arrival" date

    Examples:
      | fromAirport        | toAirport         | tripType   | departureDate    | arrivalDate      |
      | JAI Jaipur, India  | DEL Delhi, India  | Round Trip | today            | tomorrow         |
      | DEL Delhi, India   | BOM Mumbai, India | One Way    | 10 days from now |                  |
      | MAA Chennai, India | ATL Atlanta, GA   | Round Trip | 12 days from now | 15 days from now |
