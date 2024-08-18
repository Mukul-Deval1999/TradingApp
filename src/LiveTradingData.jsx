import React, { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const LiveTradingData = () => {
  const [data, setData] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket( 
      "wss://ws.finnhub.io?token=cr0e0h9r01qhal3o3v3gcr0e0h9r01qhal3o3v40"
    );

    const ws = socketRef.current;
    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "subscribe", symbol: "AAPL" }));
      ws.send(JSON.stringify({ type: "subscribe", symbol: "BINANCE:BTCUSDT" }));
      ws.send(JSON.stringify({ type: "subscribe", symbol: "IC MARKETS:1" }));
    });

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "trade") {
        setData((prevData) => [...prevData, ...message.data]);
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  const chartData = useMemo(
    () => ({
      labels: data.map((item) => new Date(item.t).toLocaleTimeString()),
      datasets: [
        {
          label: "Price",
          data: data.map((item) => item.p),
          borderColor: "#1f77b4",
          backgroundColor: "rgba(31, 119, 180, 0.3)",
          borderWidth: 3,
          fill: true,
          pointRadius: 5,
          pointBorderColor: "#1f77b4",
          pointBackgroundColor: "#fff",
        },
      ],
    }),
    [data]
  );
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#1f77b4",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `Price: $${tooltipItem.raw.toFixed(2)}`,
          },
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#1f77b4",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
            color: "#1f77b4",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          ticks: {
            color: "#1f77b4",
          },
        },
        y: {
          title: {
            display: true,
            text: "Price",
            color: "#1f77b4",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          beginAtZero: true,
          ticks: {
            color: "#1f77b4",
            callback: (value) => `$${value}`,
          },
        },
      },
    }),
    []
  );

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center p-6">
      <div className="container mx-auto max-w-6xl p-6 bg-white shadow-lg rounded-lg border border-gray-300">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Live Trading Data
        </h1>
        <div className="mb-8">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
              >
                <p className="text-xl font-semibold text-gray-900">
                  Symbol: <span className="text-teal-600">{item.s}</span>
                </p>
                <p className="text-gray-700">
                  Price:{" "}
                  <span className="font-medium text-teal-600">
                    ${item.p.toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-700">
                  Volume:{" "}
                  <span className="font-medium text-teal-600">
                    {item.v.toFixed(4)}
                  </span>
                </p>
                <p className="text-gray-700">
                  Timestamp:{" "}
                  <span className="font-medium text-teal-600">
                    {new Date(item.t).toLocaleTimeString()}
                  </span>
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center">
              No data available yet...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTradingData;
