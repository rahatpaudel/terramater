import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale
);

interface DataGraphProps {
  newValueTrigger: number;
  co2_value: number;
}

const DataGraph = ({ newValueTrigger, co2_value }: DataGraphProps) => {
  const [data, setData] = useState<number[]>([]);
  const [time, setTime] = useState<number[]>([]);

  const generateData = () => {
    const newData = co2_value;
    setData((prevData) => {
      const updatedData = [...prevData, newData];
      if (updatedData.length > 10) updatedData.shift();
      return updatedData;
    });

    setTime((prevTime) => {
      const updatedTime = [
        ...prevTime,
        prevTime.length ? prevTime[prevTime.length - 1] + 1 : 0,
      ];
      if (updatedTime.length > 10) updatedTime.shift();
      return updatedTime;
    });
  };

  useEffect(() => {
    generateData();
  }, [newValueTrigger]);

  const chartData = {
    labels: time,
    datasets: [
      {
        label: "Value",
        data: data,
        fill: false,
        borderColor: "rgba(54, 162, 235, 1)",
        tension: 0,
      },
    ],
  };

  return (
    <Line
      data={chartData}
      options={{
        scales: {
          x: {
            ticks: {
              display: false,
            },
          },
          y: {
            min: 100,
            max: 500,
          },
        },
        animation: {
          duration: 0,
        },
        elements: {
          line: {
            tension: 1,
          },
        },
      }}
    />
  );
};

export default DataGraph;
