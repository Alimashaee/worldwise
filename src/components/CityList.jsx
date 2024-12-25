import styles from "./CityList.module.css";
import CityItem from "./CityItem";
import Spinner from "./Spinner";
import Message from "./Message";
import { useCities } from "../contexts/CitiesContext";

function CityList() {
  const { cities, error, isLoading } = useCities();
  if (!cities.length && !isLoading && !error)
    return (
      <Message message="Add your first city by clicking on a city on the map" />
    );
  return (
    <>
      {error && <p>{error}</p>}
      {!error && isLoading && <Spinner />}
      {!error && !isLoading && (
        <ul className={styles.cityList}>
          {cities.map((city) => (
            <CityItem city={city} key={city.id} />
          ))}
        </ul>
      )}
    </>
  );
}

export default CityList;
