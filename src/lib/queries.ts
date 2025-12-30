export const DEVICES_QUERY = /* GraphQL */ `
  query Devices($filter: DeviceFilterInput, $page: PageRequestInput) {
    devices(filter: $filter, page: $page) {
      content {
        id
        name
        type
        building
        room
        active
      }
      totalElements
      page
      size
    }
  }
`;
