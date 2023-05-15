define([
    "dojo/_base/declare", 
    "esri/geometry/Point", 
    "esri/symbols/SimpleMarkerSymbol",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "./src/utils/ui.js",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/Polyline",
    "esri/symbols/SimpleLineSymbol",
    "esri/views/MapView",
    "./src/utils/api.js",
    "./src/utils/utils.js",
  ], function (declare, Point, SimpleMarkerSymbol, GraphicsLayer, Graphic,ui, webMercatorUtils, Polyline, SimpleLineSymbol,api,MapView,utils) {
    


    var clazz = declare(null, {



        getExisting: async function (id, token, view){
            try {
                let configResponse = await fetch('config.json');
                let config = await configResponse.json();

                let baseURL = `http://${config.api.serverpath}.INRIX.com/traffic/Inrix.ashx?Action=GetRoute`;
                let routeCall = `&Routeid=${id}`;
               // let token = await api().tokenGenerator(); // call the function to get the token value
                let params = `&speedbucket=54135&Token=${token}&format=json&RouteOutputFields=d,s,w,p`;

                let call = baseURL + routeCall + params;

                console.log(call)

                let response = await utils().getData(call);

                console.log(response);


                this.handleNewResponse(response, view, token);
            } catch (error) {
                console.error(error);
            }
        },

        
        createSummaryInfo: function(response, lyr, token, view){

            let route = response.result.trip.routes[0];
            let summary = route.summary.text
            let travelTime = route.travelTimeMinutes;
            let distance = route.totalDistance;
            let abnormalityMinutes = route.abnormalityMinutes;
            let routeQuality = route.routeQuality;
            let timeStamp = utils().formatTimestamp(response.createdDate);
            let journeyId = response.result.trip.tripId;
            let hasClosure = route.hasClosures ? 'Yes' : 'No';
            let trafficConsidered = route.trafficConsidered ? 'Yes' : 'No'
            let summaryDiv =  document.getElementById('summary');
            let summaryText = document.getElementById('summaryText');
            let refreshBtn = document.getElementById('reload')

            refreshBtn.addEventListener("click", () => {
                lyr.removeAll()
                this.getExisting(journeyId, token, view)
              ;
            });


            let resetBtn = document.getElementById('reset')
            resetBtn.addEventListener("click", () => {
                lyr.removeAll()
                summaryDiv.style.display = "none"
              ;
            });


            let saveBtn = document.getElementById('save');
            saveBtn.addEventListener("click", () => {
              console.log("CLICK")
              let data = [
                {
                  label: document.getElementById('saveInput').value,
                  tripid: journeyId,
                  start: response.result.trip.wayPoints[0].geometry.coordinates,
                  end: response.result.trip.wayPoints[1].geometry.coordinates,
                  distance: distance,
                  time: travelTime,
                  'abnormality time': abnormalityMinutes,
                  traffic: trafficConsidered,
                  closures: hasClosure
                },
              ];

              console.log(data)
              utils().downloadCSV(data);
            });
            summaryDiv.style.display = "block"

            summaryText.innerHTML = `
            <h2>${summary}</h2>
            <p><span id="journeyIdSpan">ID: <b>${journeyId}</b></span></p>
            <p>Generated:<span><b>${timeStamp}</b></span></p>
            <p>Considered traffic? <span><b>${trafficConsidered}</b></span></p>
            <p>Travel Time: <span><b>${travelTime}</b> minutes <i>${abnormalityMinutes} abnormality</i></span></p>
            <p>Distance: <span><b>${distance}</b> miles</span></p>
            <p id="closureQuality"><span class="closureSpanElement">Avoids Closures?: <b>${hasClosure}</b></span></p>
            <p id="routeQualityRow"><span class="routeSpanElement">Route Quality: <b>${routeQuality} </b></span></p>
          `;
          
          
          let routeSpanElement = document.getElementById('routeQualityRow').querySelector('span');
          let closureSpanElement = document.getElementById('closureQuality').querySelector('span');
          

          routeSpanElement.style.color = utils().getRouteQualityColor(routeQuality);
          closureSpanElement.style.color = utils().getClosureColor(hasClosure);

          
          console.log(routeQuality, utils().getRouteQualityColor(routeQuality))
         

            

            summaryDiv.style.display = "block"
            document.getElementById('idsearchWidget').style.display = "none"
            document.getElementById('drawingPanel').style.display = "none"


            utils().dragElement(summaryDiv)

            

        },



        
        createRouteLyr: function (response){
            routeLayer = new GraphicsLayer({
                graphics: []
              })

            let verts = []

           console.log(response.result)
  
            points = response.result.trip.routes[0].points.coordinates

            for (let i = 0; i < points.length; i++) {
                let pt = points[i]
                let vert = [pt[0], pt[1]]
                verts.push(vert)

              }


              let line = new Polyline({
                paths: [verts],
                spatialReference: { wkid: 4326 }
              });

//[255, 180, 0, 0.75]

            let lineSymbol = new SimpleLineSymbol({
                color: [255, 180, 0, 0.65], 
                width: "4px",
                style: "solid",
                
            })

            let lineGraphic = new Graphic({  // graphic with polygon geometry
                geometry: line, // set geometry here
                symbol: lineSymbol, // set symbol here
                
              });

              routeLayer.effect = "bloom(1.5, 0px, 10%)"

            routeLayer.add(lineGraphic)
            

            return routeLayer

        },


          
        handleNewResponse: function (APIresponse, view, token){

            let routeLayer = this.createRouteLyr(APIresponse)
            view.map.addMany([routeLayer])
            view.goTo(routeLayer.graphics.items[0].geometry.extent);
          
            this.createSummaryInfo(APIresponse, routeLayer, token, view)
            

        },
          


        createNewRoute: async function (selectedPTS, token, view) {
          try {
            const response = await fetch('config.json');
            const config = await response.json();
        
            const baseURL = `http://${config.api.serverpath}.INRIX.com/traffic/Inrix.ashx`;
        
            const trafficToggle = document.getElementById('useTraffic').checked;
            const trafficString = trafficToggle ? "True" : "False";
        
            let routeType = "";
            const routeBtns = document.getElementsByName('routing');
        
            for (let i = 0; i < routeBtns.length; i++) {
              if (routeBtns[i].checked) {
                routeType = routeBtns[i].value;
                break;
              }
            }
        
            const params = `?Action=FindRoute&UseTraffic=${trafficString}&RouteOutputFields=d,s,w,p,u&speedbucket=54135&RouteType=${routeType}`;
        
            let wpParams = "";
            for (let i = 0; i < selectedPTS.length; i++) {
              const selectPt = selectedPTS[i];
              wpParams += `&WP_${i + 1}=${selectPt.y},${selectPt.x}`;
            }
        
            const tokenParam = `&Token=${token}`;
        
            const call = baseURL + params + wpParams + tokenParam + "&format=json";
            console.log(call);
        
            const responseData = await utils().getData(call);
            this.handleNewResponse(responseData, view, token);
          } catch (error) {
            console.error(error);
          }
        },
        


        

         
          
        
 
    });
    return clazz;
  });
  