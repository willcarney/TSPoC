/*
The following information is to be included:

Copyright © <2022– 2022> Esri UK Ltd.

All rights reserved under the copyright laws of the United Kingdom.

You may not redistribute or use this software, with or

without modification, without prior permission of Esri UK Ltd
*/
//

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Expand",
    "esri/widgets/Search",
    "./src/utils/ui.js",
    "./src/utils/routeFinder.js",
    "./src/utils/api.js",
    "dojo/dom",
    "dojo/domReady!",
  ], function(
    Map,
    MapView,
    Expand,
    Search,
    ui,
    routeFinder,
    api,
    dom
  ) {
    if (!fetch || !Promise) {
        alert(
            "This app requires a modern browser (e.g., Chrome, Firefox, Safari, Edge)."
        );
        return;
    }

    async function getToken(){
        let token = await api().tokenGenerator()
    

        return token

    }


    function createDiv(config){

        var map = new Map({
            basemap: "streets-night-vector", 
          });
  
          // Create a new map view and set its container
          var view = new MapView({
            container: "viewDiv",
            map: map,
            center: [config.map.view.centroid.x, config.map.view.centroid.y],
            zoom: config.map.view.zoom
          });

          const searchWidget = new Search({
            view: view
          });

          view.ui.add(searchWidget, {
            position: "top-left",
            index: 1
          })


          

          return view

    }


    function createUIcompontents(view, token){
        ui().newRouteUI(view,token)
        ui().searchUI(view, token)

    }
    fetch('config.json')
    .then(response => response.json())
    .then(async config => {
      try {
        const token = await getToken(); 
        setInterval(getToken, 3600000 ); // pass getToken as a function to setInterval
        const view = createDiv(config, token);
        createUIcompontents(view, token);
      } catch (error) {
        console.error(error);
      }
    });
    
  async function getToken() {

    try {
      const token = await api().tokenGenerator();
      return token;
    } catch (error) {
      console.error(error);
      throw new Error('Unable to generate token');
    }
  }
  

});