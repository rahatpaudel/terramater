import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./App.css";
import { forbidden, default_trees, edge_blocks } from "./coords";
import DataGraph from "./components/Graph";
import axios from "axios";

function App() {
  type AmbienceItem = {
    weight: number;
    value: string;
  };

  const resetValues = async () => {
    try {
      await axios.post("http://localhost:5000/end", {
        value: "TERMINATE",
      });
    } catch (error) {
      console.error(error);
    }
  };

  window.onload = () => {
    resetValues();
  };

  const ambience: AmbienceItem[] = [
    { value: "empty", weight: 0.99 },
    { value: "rock_1", weight: 0.001 },
    { value: "rock_2", weight: 0.001 },
    { value: "rock_3", weight: 0.001 },
    { value: "rock_4", weight: 0.001 },
    { value: "flowers", weight: 0.006 },
  ];
  const totalWeight = ambience.reduce((sum, item) => sum + item.weight, 0);

  const defaultLand = [];

  const getRandomAmbience = (): string => {
    let randomNum = Math.random() * totalWeight;
    for (let item of ambience) {
      randomNum -= item.weight;
      if (randomNum < 0) {
        return item.value;
      }
    }
    return "";
  };

  for (let i = 0; i < 56; i++) {
    let defaultLandRow = [];
    for (let j = 0; j < 56; j++) {
      if (default_trees.some((item) => item[0] === i && item[1] === j)) {
        defaultLandRow.push("trees");
      } else if (forbidden.some((item) => item[0] === i && item[1] === j)) {
        defaultLandRow.push("blocked");
      } else if (edge_blocks.some((item) => item[0] === i && item[1] === j)) {
        defaultLandRow.push("empty");
      } else {
        defaultLandRow.push(getRandomAmbience());
      }
    }
    defaultLand.push(defaultLandRow);
  }

  const [land, setLand] = useState(defaultLand);
  const [selectedItem, setSelectedItem] = useState("trees");
  const [co2Trigger, setCo2Trigger] = useState(0);
  const [notification, setNotification] = useState(
    "Greetings! I am EcoBot, your guide on this extraordinary journey to a the past world where we can save our planet by making better choices. Imagine a world where the ice caps are melting at an alarming rate, causing sea levels to rise and threatening coastal communities. The solution lies in our hands: by reducing carbon dioxide emissions, we can lower global temperatures and slow down this melting process. Every small action counts. Thank you for joining me on this journey. Remember, the power to save our planet lies within each of us."
  );
  const [notificationID, setNotificationID] = useState(0);
  const [notificationExpanded, setNotificationExpanded] = useState(false);
  const [processedValue, setProcessedValue] = useState({
    temperature: 20,
    co2_value: 400,
  });

  const items: string[] = [
    "trees",
    "hydro",
    "wind",
    "house",
    "solar",
    "nuclear",
    "tofu",
    "beef",
    "coal",
    "building",
    "car",
    "ev",
    "wheat",
  ];

  type ItemNames = {
    [key: string]: string; // This allows any string key with a string value
  };

  const itemNames: ItemNames = {
    trees: "Trees",
    hydro: "Hydropower Plant",
    wind: "Wind Farm",
    house: "House",
    solar: "Solar Energy Panelled House",
    nuclear: "Nuclear Energy Farm",
    tofu: "Tofu Factory",
    beef: "Beef Factory",
    coal: "Coal Farm",
    building: "Building",
    car: "Normal Car",
    ev: "Electric Car",
    wheat: "Wheat Farm",
  };

  const sendNewDataTrigger = () => {
    setCo2Trigger((prev) => prev + 1);
  };

  const placeItem = (row: number, col: number) => {
    if (
      selectedItem &&
      land[row][col] &&
      ["empty", "flowers", "rock_1", "rock_2", "rock_3", "rock_4"].includes(
        land[row][col]
      )
    ) {
      const newLand = [...land];
      newLand[row][col] = selectedItem;
      setLand(newLand);
      sendNewDataTrigger();
      sendValue({
        change: selectedItem,
        sign: true,
      });
    }
  };

  const sendValue = async (value: { change: string; sign: boolean }) => {
    try {
      const response = await axios.post("http://localhost:5000/process", {
        value: value,
      });
      const { temperature, co2_value } = response.data;
      setProcessedValue({ temperature, co2_value });
    } catch (error) {
      console.error(error);
    }
    if (processedValue.co2_value == 200) {
      setNotification("Yay! You have successfully saved the world!");
      setNotificationID(0);
    } else if (processedValue.co2_value >= 480) {
      setNotification("The glaciers have melted now! This is not good...");
      setNotificationID(3);
    } else if (processedValue.co2_value >= 460) {
      setNotification(
        "Oh no! Flood has taken over. Please add more renewables!!"
      );
      setNotificationID(2);
    } else if (processedValue.co2_value >= 440) {
      setNotification(
        "Oh no! There is a wildfire in the town right now. Consider adding more renewables."
      );
      setNotificationID(1);
    }
  };

  return (
    <div className="h-screen w-screen" style={{ imageRendering: "pixelated" }}>
      <div
        className={`fixed bottom-10 left-1/2 z-40 bg-black bg-opacity-75 w-fit h-fit grid grid-flow-col grid-cols-${items.length} gap-4 justify-center`}
        style={{
          transform: "translateX(-50%)",
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            className={`relative w-16 h-16 flex cursor-pointer ${
              selectedItem == item && "outline outline-gray-200 outline-4 "
            }`}
          >
            {item == selectedItem && (
              <p
                className="fixed bottom-24 left-1/2 z-50 bg-black bg-opacity-75 text-white px-4 py-2 text-lg"
                style={{
                  transform: "translateX(-50%)",
                }}
              >
                {itemNames[item]}
              </p>
            )}
            <img
              src={`/src/assets/${item}.png`}
              onClick={() => setSelectedItem(item)}
              className="absolute inset-0 w-auto h-full object-cover mx-auto p-1"
              alt={item}
            />
          </div>
        ))}
      </div>
      <div className="absolute right-5 bottom-1/2 z-20 bg-black bg-opacity-90 text-white p-5">
        <h1 className="text-3xl text-center font-semibold mb-5">
          After 25 Years...
        </h1>
        <h2>
          CO<sub>2</sub> Concentration (parts per million)
        </h2>
        <DataGraph
          newValueTrigger={co2Trigger}
          co2_value={processedValue.co2_value}
        ></DataGraph>
        <p className="mt-5">
          Temperature: {Math.ceil(processedValue.temperature)} degrees
        </p>
      </div>
      <div className="absolute left-5 top-60 z-20 bg-black bg-opacity-90 text-white p-5">
        <div className="flex">
          <img src="src/assets/robot.png" className="h-10 w-10"></img>
          <h1 className="text-4xl font-semibold ml-3">EcoBot</h1>
        </div>
        <div className="w-80">
          <h3 className="my-5">{notification}</h3>
          {notificationID >= 1 && (
            <button
              className="bg-white text-black px-5 py-1"
              onClick={() => setNotificationExpanded(true)}
            >
              More info
            </button>
          )}
        </div>
      </div>
      {notificationExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative w-1/2 bg-white rounded-lg overflow-hidden shadow-lg">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-700 hover:text-red-500"
              onClick={() => setNotificationExpanded(false)}
            >
              &times;
            </button>
            <img
              src={`src/assets/table_${notificationID}.png`}
              alt="Info on the problem"
              className="w-full h-auto mt-10"
            />
          </div>
        </div>
      )}
      <TransformWrapper
        limitToBounds={true}
        initialScale={2.5}
        minScale={2.5}
        disablePadding={true}
        doubleClick={{ disabled: true }}
        panning={{
          allowLeftClickPan: false,
          allowRightClickPan: true,
          allowMiddleClickPan: true,
        }}
        centerZoomedOut={true}
        centerOnInit={true}
      >
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "100%",
          }}
        >
          <div
            onContextMenu={(e) => e.preventDefault()}
            className="grid grid-cols-56 grid-rows-56 gap-0 p-0 m-0 overflow-visible"
            style={{
              backgroundImage: `url('/src/assets/map.png')`,
            }}
          >
            {land.map((row, rowIndex) =>
              row.map((item: string, colIndex: number) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => placeItem(rowIndex, colIndex)}
                  className="p-0 w-[16px] h-[16px] flex items-end justify-center overflow-visible hover:outline-1 hover:outline-dashed hover:outline-gray-800"
                >
                  {item != "empty" && item != "blocked" && (
                    <img
                      className={`w-[16px] h-auto overflow-visible`}
                      src={`/src/assets/${item}.png`}
                    ></img>
                  )}
                </div>
              ))
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default App;
