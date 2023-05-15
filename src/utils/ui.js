define([
    "dojo/_base/declare", 
    "esri/geometry/Point", 
    "esri/symbols/SimpleMarkerSymbol",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/support/webMercatorUtils",
    "./src/utils/routeFinder.js",
    "./src/utils/utils.js"
  ], function (declare, Point, SimpleMarkerSymbol, GraphicsLayer, Graphic, webMercatorUtils,routeFinder, utils) {
    var clazz = declare(null, {
      createGraphics: function (selectedPTS, graphicLyr) {
        graphicLyr.removeAll()
        for (let i in selectedPTS){
          pt = selectedPTS[i]
          let graphic = new Graphic({  
            geometry: new Point({
              x: pt.x,
              y: pt.y
            }), 
            symbol: new SimpleMarkerSymbol({
              color: [34, 61, 152],
              size: "16px",
              style: "diamond",
              outline: {  // autocasts as new SimpleLineSymbol()
                color: [ 255, 255, 0 ],
                width: 3  // points
              }
            }) 
          });
          graphicLyr.add(graphic)
        }

        return graphicLyr
      },
  
      newRouteUI: function (view, token) {
        let isCrosshairMode = false;
        let selectedLocations = []
        const newBTN = document.getElementById('new');
        const findBtn = document.getElementById('find')
        const undoBtn = document.getElementById('undo')
        const clearBtn = document.getElementById('clear')
        const lookupBtn =  document.getElementById('lookup')
        let ptsLayer = new GraphicsLayer({
          graphics: []
          
        })


        
      newBTN.addEventListener('click', () => {
          if (!isCrosshairMode) {
            document.body.style.cursor = 'crosshair';
            isCrosshairMode = true;
            drawingPanel.style.display = 'block'; // 
          } else {
            document.body.style.cursor = 'auto';
            isCrosshairMode = false;
            drawingPanel.style.display = 'none'; 
            selectedLocations = []
            ptsLayer.removeAll()
            document.getElementById('helper').style.display = "block"
          }
        });


        lookupBtn.addEventListener('click', () => {
              document.body.style.cursor = 'auto';
              isCrosshairMode = false;
              drawingPanel.style.display = 'none'; 
              selectedLocations = []
              ptsLayer.removeAll()
              document.getElementById('helper').style.display = "block"
            
          });
  
        view.on("click", function(event) {
          if (isCrosshairMode) {
            view.hitTest(event).then(function(response) {

                document.getElementById('helper').style.display = "none"
 

              console.log(event.mapPoint.x, event.mapPoint.y)

              let repojCoords = webMercatorUtils.xyToLngLat(event.mapPoint.x, event.mapPoint.y)

              selectedLocations.push({"x": repojCoords[0], "y": repojCoords[1]})
              view.map.remove()
              ptsLayer = this.createGraphics(selectedLocations, ptsLayer)
              view.map.add(ptsLayer)

   
              if((selectedLocations.length)>= 2){
                findBtn.removeAttribute('disabled');
                findBtn.classList.remove('disabled');
                journeyForm.style.display = "block";
              }
            }.bind(this))
          }
        }.bind(this));
  
        undoBtn.addEventListener('click', () => {
          selectedLocations.pop()
          view.map.remove()

          if((selectedLocations.length)< 2){
            findBtn.setAttribute('disabled', '');
            findBtn.classList.add('disabled');
            journeyForm.style.display = "none";

          }

          if((selectedLocations.length)== 0){
            document.getElementById('helper').style.display = "block"
          }

          ptsLayer = this.createGraphics(selectedLocations, ptsLayer)
          view.map.add(ptsLayer)

        });
  
        clearBtn.addEventListener('click', () => {
          selectedLocations = []
          ptsLayer.removeAll()
          findBtn.setAttribute('disabled', '');
          findBtn.classList.add('disabled');
          journeyForm.style.display = "none";
          document.getElementById('helper').style.display = "block"
        });



        findBtn.addEventListener('click', () => {

            if((selectedLocations.length)>= 2){
            routeFinder().createNewRoute(selectedLocations, token, view)
            if (!isCrosshairMode) {
                document.body.style.cursor = 'crosshair';
                isCrosshairMode = true;
                drawingPanel.style.display = 'block'; // 
              } else {
                document.body.style.cursor = 'auto';
                isCrosshairMode = false;
                drawingPanel.style.display = 'none'; 
                selectedLocations = []
                ptsLayer.removeAll()
                document.getElementById('helper').style.display = "block"
              }
            }
          });
  
  



      },



     searchUI: function (view, token) {

 
        const searchBox = document.getElementById('idsearchWidget')
        const newBTN = document.getElementById('new');
        searchBox.style.display = 'none'
        const searchBtn = document.getElementById('lookup')
        const closeBtn = document.getElementById("idCloseBtn");
        const lookupButton = document.getElementById("lookupSelect");

        const idSearchButton =  document.getElementById("idSearchRun")
        const idSearchBar =  document.getElementById("searchInput")
        closeBtn.addEventListener("click", () => {
            searchBox.style.display = "none";
        });

        searchBtn.addEventListener('click', () => {
            if (searchBox.style.display == 'block') {
              searchBox.style.display = 'none'; //

            } else {
                
              searchBox.style.display = 'block'; 
            }
          });
          
          newBTN.addEventListener('click', () => {

            searchBox.style.display = 'none';

        })
         
        Papa.parse("assets/trips.csv", {
            header: true,
            download: true,
            complete: function(results) {

            const tripIds = [...new Set(results.data.map(item => item.trip_id))];
            const select = document.getElementById('select')
        
            tripIds.forEach(tripId => {
                

                const label = results.data.find(item => item.trip_id === tripId).label;

                const option = document.createElement("option");
                option.textContent = `${label} (${tripId})`;
                option.value = tripId;
        
                console.log(option)
                select.appendChild(option);
            });
        
            
        
            }


            


        });
        

        lookupButton.addEventListener('click', () => {
            const selectedOption = select.value;
            if (selectedOption !== 'Select an Option') {
              let selectedOptionElement = document.querySelector(`option[value="${selectedOption}"]`);
              let selectedId = selectedOptionElement.value;
              console.log(selectedId);
              
              routeFinder().getExisting(selectedId, token, view)
            }
          });

          idSearchButton.addEventListener('click', () => {
            if (idSearchBar.value !== '') {
              routeFinder().getExisting(idSearchBar.value, token, view)
            }
          });



     },

     


    });

    
    return clazz;
  });
  