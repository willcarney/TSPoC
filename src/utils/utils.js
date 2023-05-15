define([
    "dojo/_base/declare", 

  ], function (declare) {
    var clazz = declare(null, {


        getData: async function(url){
            try {
              const response = await fetch(url);
              const data = await response.json();
              return data
              // do something with the data here
            } catch (error) {
              console.error(error);
            }
          },

    
          dragElement: function(elmnt) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (document.getElementById(elmnt.id + "header")) {
              /* if present, the header is where you move the DIV from:*/
              document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
            } else {
              /* otherwise, move the DIV from anywhere inside the DIV:*/
              elmnt.onmousedown = dragMouseDown;
            }
          
            function dragMouseDown(e) {
              e = e || window.event;
              e.preventDefault();
              // get the mouse cursor position at startup:
              pos3 = e.clientX;
              pos4 = e.clientY;
              document.onmouseup = closeDragElement;
              // call a function whenever the cursor moves:
              document.onmousemove = elementDrag;
            }
          
            function elementDrag(e) {
              e = e || window.event;
              e.preventDefault();
              // calculate the new cursor position:
              pos1 = pos3 - e.clientX;
              pos2 = pos4 - e.clientY;
              pos3 = e.clientX;
              pos4 = e.clientY;
              // set the element's new position:
              elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
              elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }
          
            function closeDragElement() {
              /* stop moving when mouse button is released:*/
              document.onmouseup = null;
              document.onmousemove = null;
            }
          },
          

         downloadCSV: function(data) {
          const headers = [
            "label",
            "tripid",
            "start",
            "end",
            "distance",
            "time",
            "abnormality time",
            "traffic"
          ];
        
          // Create the CSV content
          let csvContent = headers.join(",") + "\n";
          console.log(csvContent)
          data.forEach(row => {
            const { tripid, start, end, distance, time, abnormality, traffic } = row;
            const rowContent = `"${label}","${tripid}","${start}","${end}",${distance},${time},${abnormality},${traffic}\n`;
            csvContent += rowContent;
          });

          console.log(csvContent)
        
          // Create a Blob object with the CSV content
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        console.log(blob)
          // Create a URL for the Blob object
          const url = URL.createObjectURL(blob);

          console.log("TEST")
        
          // Create a link element and set its properties
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `Info_${label}.csv`);
          link.style.display = "none";
        
          // Append the link element to the document
          document.body.appendChild(link);
        
          // Simulate a click on the link to trigger the download
          link.click();
        
          // Clean up by revoking the URL object
          URL.revokeObjectURL(url);
          
        },





    getRouteQualityColor: function (routeQuality) {
  switch (routeQuality) {
    case 0:
      return "red";
    case 1:
      return "yellow";
    case 2:
      return "light-green";
    case 3:
        return "green";
    default:
      return "black"; // Default color if the value is not 0, 1, or 2
  }
},

getClosureColor: function (closures) {
  switch (closures) {
    case "Yes":
      return "red";
    case "No":
        return "green";
    default:
      return "black"; // Default color if the value is not 0, 1, or 2
  }
},

formatTimestamp: function(timestamp) {
  const date = new Date(timestamp);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}



    });

    
    return clazz;
  });
  