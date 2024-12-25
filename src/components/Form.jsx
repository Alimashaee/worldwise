// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import Spinner from "./Spinner";
import Message from "./Message";
import { useURLposition } from "../hooks/useURLposition";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client?";

function Form() {
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [emoji, setEmoji] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [lat, lng] = useURLposition();
  const [isLoadingGeocoding, setIsLoaddingGeocoding] = useState(false);
  const [errorGeocoding, setErrorGeocoding] = useState(null);
  const { createCity, isLoading } = useCities();
  const navigate = useNavigate();

  useEffect(
    function () {
      async function fetchCityData() {
        try {
          setErrorGeocoding(null);
          setIsLoaddingGeocoding(true);
          const res = await fetch(
            `${BASE_URL}latitude=${lat}&longitude=${lng}`
          );
          if (!res.ok) throw new Error("Failed to fetch data!");
          const data = await res.json();
          if (!data.countryCode)
            throw new Error(
              "That doesn't seem to be a city, please click somewhere else😉"
            );
          setCityName(data.city || data.locality || "");
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
          console.log(data);
        } catch (err) {
          setErrorGeocoding(err.message);
        } finally {
          setIsLoaddingGeocoding(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: {
        lat: Number(lat),
        lng: Number(lng),
      },
    };

    await createCity(newCity);
    navigate("/app/cities");
  }

  return (
    <>
      {isLoadingGeocoding && <Spinner />}
      {!lat && !lng && (
        <Message message="Start by clicking somewhere on the map" />
      )}
      {!errorGeocoding ? (
        <form
          className={`${styles.form} ${isLoading ? styles.loading : ""}`}
          onSubmit={(e) => handleSubmit(e)}
        >
          <div className={styles.row}>
            <label htmlFor="cityName">City name</label>
            <input
              id="cityName"
              onChange={(e) => setCityName(e.target.value)}
              value={cityName}
            />
            {/* <span className={styles.flag}>{emoji}</span> */}
          </div>

          <div className={styles.row}>
            <label htmlFor="date">When did you go to {cityName}?</label>
            {/* <input
              id="date"
              onChange={(e) => setDate(e.target.value)}
              value={date}
            /> */}
            <DatePicker
              id="date"
              selected={date}
              onChange={(date) => setDate(date)}
            />
          </div>

          <div className={styles.row}>
            <label htmlFor="notes">Notes about your trip to {cityName}</label>
            <textarea
              id="notes"
              onChange={(e) => setNotes(e.target.value)}
              value={notes}
            />
          </div>

          <div className={styles.buttons}>
            <Button
              type="primary"
              onClick={() => {
                return 0;
              }}
            >
              Add
            </Button>
            <BackButton />
          </div>
        </form>
      ) : (
        <Message message={errorGeocoding} />
      )}
    </>
  );
}
export default Form;
