document.addEventListener("DOMContentLoaded", function () {
  //Search button
  const button = document.querySelector("#searchBtn");
  button.addEventListener("click", (e) => {
    const route = document.querySelector("#routeInsert").value.toUpperCase(); //Get bus number

    //Clear Container
    const directionContainer = document.querySelector("#directionContainer");
    directionContainer.innerHTML = "";
    const stopContainer = document.querySelector("#stopContainer");
    stopContainer.innerHTML = "";

    fetchRouteData(route);
  });
});

async function fetchRouteData(route) {
  try {
    //Use 2. Route List API
    const routeListAPI = "https://data.etabus.gov.hk/v1/transport/kmb/route/";
    const res = await fetch(routeListAPI);
    const routeList = await res.json();

    //Create directionContainer
    //Error message if route not exist
    if (routeList.data.findIndex((el) => el.route === route) < 0) {
      Message("此路線不存在");
    } else {
      Message("選擇前往方向:");
    }

    //Get start & end from API
    for (let i = 0; i < routeList.data.length; i++) {
      if (routeList.data[i].route === route) {
        let routeStart = routeList.data[i].orig_tc;
        let routeEnd = routeList.data[i].dest_tc;
        let bound = routeList.data[i].bound;

        //Create direction boxs
        const direction = document.createElement("button");
        direction.className = "direction";
        direction.setAttribute("bound", bound);
        direction.textContent = `${routeStart} => ${routeEnd}`;
        directionContainer.appendChild(direction);
      }
    }

    //Direction button
    const directionArray = document.querySelectorAll(".direction");
    directionArray.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        //Clear container
        const stopContainer = document.querySelector("#stopContainer");
        stopContainer.innerHTML = "";

        fetchStopData(route, btn);
      });
    });
  } catch (err) {
    Message("路線資料暫時無法讀取");
  }
}

async function fetchStopData(route, btn) {
  try {
    let bound = btn.getAttribute("bound");
    if (bound === "I") {
      bound = "inbound";
    } else if (bound === "O") {
      bound = "outbound";
    }

    //7. Route-Stop API
    const stopListAPI = `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route}/${bound}/1`;
    const res = await fetch(stopListAPI);
    const stopList = await res.json();

    //Create each stop box
    let count = 1;
    for (let j = 0; j < stopList.data.length; j++) {
      let stopNameID = stopList.data[j].stop;

      const stopNameAPI = `https://data.etabus.gov.hk/v1/transport/kmb/stop/${stopNameID}`; //Use 5. Stop API
      const res2 = await fetch(stopNameAPI);
      const stopNameData = await res2.json();

      //Get ETA
      const etaAPI = `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopNameID}/${route}/1`; //Use 8.ETA API
      const res3 = await fetch(etaAPI);
      const etaData = await res3.json();
      let time = etaData.data[0].eta.substring(11, 16);

      //Create stopName box
      let stop = document.createElement("div");
      stop.className = "stop";
      stop.textContent = `#${count} 車站: ${stopNameData.data.name_tc} 到站時間: ${time}`;
      count++;
      stopContainer.appendChild(stop);
    }
  } catch (err) {
    Message("路線資料暫時無法讀取");
  }
}

function Message(message) {
  const direction = document.createElement("div");
  direction.className = "message";
  direction.textContent = message;
  directionContainer.appendChild(direction);
}
