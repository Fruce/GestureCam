# GestureCam Simulation

A web-based 3D simulation of the **GestureCam** automotive camera system.

The simulation represents a camera module mounted on an **SG90 servo mechanism**, where the camera orientation can be controlled using hand-gesture-inspired inputs.

## Overview

GestureCam is being developed as an automotive camera system in which the driver can control the movement of a vehicle-mounted camera using a wearable hand-gesture controller.

This simulation provides a digital representation of the camera module and its mechanical movement before integration with the physical hardware.

### Current Simulation

The current simulation models:

- ESP32-CAM camera module
- SG90 servo mechanism
- Camera mounting mechanism
- Yaw movement
- Pitch movement
- Interactive mouse and button controls

## Controls

### Yaw

Move the mouse horizontally to rotate the camera assembly around the **Y-axis**.

```text
Mouse → Horizontal movement → Yaw
