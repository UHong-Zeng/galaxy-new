"use client";

import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";
import { getUsersPosition, updatePosition } from "@/lib/actions/user.actions";

const Map = ({ userId }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(120.24);
  const [lat] = useState(23);
  const [zoom] = useState(10);
  const [API_KEY] = useState("RqBiuK3vwqHCAXRC99jE");
  const [usersInform, setUsersInform] = useState([]);

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/cadastre-satellite/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );

    const getUserInform = async () => {
      const result = await getUsersPosition(userId);
        result.forEach((user) => {
          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
            `<span style='color: black;'>Name: ${user.name}</span>`
          )
          const el = document.createElement("div");
          el.className = "marker";
          el.style.backgroundImage = `url(${user.image})`;
          el.style.backgroundSize = "cover";
          el.style.width = "50px";
          el.style.height = "50px";

          new maplibregl.Marker({ element: el })
          .setLngLat([user.lng, user.lat])
          .setPopup(popup) // sets a popup on this marker
          .addTo(map.current);
        })
    }

    // get Currency
    const options = {
      enableHighAccuracy: false,
      timeout: 10000,
    };
    const successCallback = (position) => {
      const updateNewPosition = async () => {
        await updatePosition(
          userId,
          position.coords.longitude,
          position.coords.latitude
        );

        
      };
      console.log(position);
      updateNewPosition();
    };

    const errorCallback = (error) => {
      console.log(error);
    };
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options
    );
    const watchDog = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback
    );

    getUserInform();
  }, [API_KEY, lng, lat, zoom]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
};

export default Map;
