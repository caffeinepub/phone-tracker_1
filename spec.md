# Phone Tracker

## Current State
New project with no existing code.

## Requested Changes (Diff)

### Add
- A phone/device registry where users can add and name devices
- Location tracking: devices can submit their current GPS coordinates (latitude, longitude, timestamp)
- A dashboard showing all registered devices and their last known location
- Location history per device (list of past coordinates with timestamps)
- Ability to remove a device from the registry

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Store devices (id, name, owner) and location entries (deviceId, lat, lng, timestamp)
2. Backend APIs: add device, remove device, list devices, submit location update, get latest location per device, get location history for a device
3. Frontend: Dashboard with a device list panel and a map-like coordinate display, device detail view with location history, add/remove device controls

## UX Notes
- Clean dashboard layout with a sidebar listing devices
- Each device shows its name, last seen timestamp, and last known coordinates
- Clicking a device shows its location history
- Simple form to add a new device by name
- Visual indicator if a device has reported recently vs. not recently
