import React, { useEffect, useRef, useState } from "react";
import './style.css';

const SeatsIOChart = () => {
  const chartContainerRef = useRef(null);
  const scriptLoaded = useRef(false);
  const chartInitialized = useRef(false);

  // State to store selected seats
  const [selectedSeats, setSelectedSeats] = useState([]);
  console.log("selectedSeats from useState", selectedSeats);

  useEffect(() => {
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn-eu.seatsio.net/chart.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initChart = async () => {
      if (chartInitialized.current) {
        return;
      }

      try {
        if (!scriptLoaded.current) {
          await loadScript();
          scriptLoaded.current = true;
        }

        const existingIframe = document.querySelector(
          'iframe[src^="https://cdn-eu.seatsio.net"]'
        );
        if (existingIframe) {
          existingIframe.remove();
        }

        const loadingScreen = document.querySelector(".seatsio-loading-screen");
        if (loadingScreen) {
          loadingScreen.remove();
        }

        const chart = new seatsio.SeatingChart({
          publicKey: "36ca952f-9c6e-457f-8305-2acecbebe027",
          event: "723028ae-c2b7-4fc6-8c85-a861b7264905",
          divId: "chart",
          pricing: [
            { category: 1, price: 20 },
            { category: 2, price: 15 },
          ],
          onObjectSelected: function (object) {
            console.log("Object selected:", object);
            console.log("selectedSeats==>", selectedSeats);

            setSelectedSeats((prevSeats) => [
              ...prevSeats,
              {
                id: object.id,
                label: object.label || "N/A",
                category: object?.category?.key || "N/A",
                pricing: object?.category?.pricing?.price || "N/A",
              },
            ]);
          },
          onObjectDeselected: function (object) {
            console.log("Object deselected:", object);
            // Remove deselected seat from the state
            setSelectedSeats((prevSeats) =>
              prevSeats.filter((seat) => seat.id !== object.key)
            );
          },
        }).render();

        chartInitialized.current = true;

        if (
          chartContainerRef.current &&
          !chartContainerRef.current.children.length
        ) {
          chartContainerRef.current.appendChild(chart.container);
        }

        return () => {
          chart.destroy();
        };
      } catch (error) {
        console.error("Error loading the Seats.io chart:", error);
      }
    };

    initChart();

    return () => {
      const script = document.querySelector(
        'script[src="https://cdn-eu.seatsio.net/chart.js"]'
      );
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div
        id="chart"
        ref={chartContainerRef}
        style={{ height: "600px", width: "80%" }}
      ></div>

      {/* Display selected seats */}
      <div className="selected-seats">
  <h3>Selected Seats</h3>
  <ul>
    {selectedSeats.length > 0 ? (
      selectedSeats.map((seat) => (
        <li key={seat.id} className="seat-item">
          <div className="seat-info">
            <span className="seat-id">Seat {seat.id}</span>
            <span className="seat-category">Category {seat.category}</span>
            <span className="seat-price">Price: ${seat.pricing}</span>
          </div>
        </li>
      ))
    ) : (
      <li>No seats selected</li>
    )}
  </ul>
</div>

    </div>
  );
};

export default SeatsIOChart;
