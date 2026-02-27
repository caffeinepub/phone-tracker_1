import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Map "mo:core/Map";

actor {
  type DeviceId = Nat;
  type Timestamp = Time.Time;

  type Device = {
    id : DeviceId;
    name : Text;
    owner : Principal;
  };

  type Location = {
    latitude : Float;
    longitude : Float;
    timestamp : Timestamp;
  };

  type DeviceWithLocations = {
    device : Device;
    locations : [Location];
  };

  type DeviceWithLatestLocation = {
    device : Device;
    latestLocation : ?Location;
  };

  var nextDeviceId = 0;

  let devices = Map.empty<DeviceId, Device>();
  let deviceLocations = Map.empty<DeviceId, List.List<Location>>();

  public shared ({ caller }) func registerDevice(name : Text) : async DeviceId {
    let deviceId = nextDeviceId;
    nextDeviceId += 1;

    let device : Device = {
      id = deviceId;
      name;
      owner = caller;
    };

    devices.add(deviceId, device);
    deviceLocations.add(deviceId, List.empty<Location>());
    deviceId;
  };

  public shared ({ caller }) func removeDevice(deviceId : DeviceId) : async () {
    switch (devices.get(deviceId)) {
      case (null) { Runtime.trap("Device not found") };
      case (?device) {
        if (device.owner != caller) {
          Runtime.trap("Only the owner can remove this device");
        };
        devices.remove(deviceId);
        deviceLocations.remove(deviceId);
      };
    };
  };

  public query ({ caller }) func getMyDevices() : async [Device] {
    devices.values().toArray().filter(
      func(device) { device.owner == caller }
    );
  };

  public shared ({ caller }) func updateLocation(deviceId : DeviceId, latitude : Float, longitude : Float) : async () {
    switch (devices.get(deviceId)) {
      case (null) { Runtime.trap("Device not found") };
      case (?_) {
        let location : Location = {
          latitude;
          longitude;
          timestamp = Time.now();
        };

        let locations = switch (deviceLocations.get(deviceId)) {
          case (null) { List.empty<Location>() };
          case (?list) { list };
        };

        locations.add(location);
        if (locations.size() > 100) {
          let trimmedLocations = locations.toArray().sliceToArray(0, 100);
          deviceLocations.add(deviceId, List.fromArray<Location>(trimmedLocations));
        } else {
          deviceLocations.add(deviceId, locations);
        };
      };
    };
  };

  public query ({ caller }) func getLatestLocation(deviceId : DeviceId) : async ?Location {
    switch (deviceLocations.get(deviceId)) {
      case (null) { null };
      case (?locations) {
        if (locations.isEmpty()) { null } else { ?locations.at(0) };
      };
    };
  };

  public query ({ caller }) func getLocationHistory(deviceId : DeviceId) : async [Location] {
    switch (deviceLocations.get(deviceId)) {
      case (null) { [] };
      case (?locations) { locations.toArray() };
    };
  };

  public query ({ caller }) func getAllDevicesWithLatestLocation() : async [DeviceWithLatestLocation] {
    let deviceEntries = devices.toArray();
    deviceEntries.map(
      func((_, device)) {
        let latestLocation = switch (deviceLocations.get(device.id)) {
          case (null) { null };
          case (?locations) {
            if (locations.isEmpty()) {
              null;
            } else {
              ?locations.at(0);
            };
          };
        };
        {
          device;
          latestLocation;
        };
      }
    );
  };

  public query ({ caller }) func getDeviceWithLocations(deviceId : DeviceId) : async ?DeviceWithLocations {
    switch (devices.get(deviceId)) {
      case (null) { null };
      case (?device) {
        let locations = switch (deviceLocations.get(deviceId)) {
          case (null) { List.empty<Location>().toArray() };
          case (?locList) { locList.toArray() };
        };
        ?{
          device;
          locations;
        };
      };
    };
  };

  public query ({ caller }) func getAllDevices() : async [Device] {
    devices.values().toArray();
  };
};
