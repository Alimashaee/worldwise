import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

const initialState = {
  cities: [],
  error: null,
  isLoading: false,
  curCity: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "fetchData":
      return { ...state, cities: action.payload, error: null };
    case "error":
      return { ...state, error: action.payload };
    case "loaded":
      return { ...state, isLoading: false };
    case "getCity":
      return { ...state, curCity: action.payload, error: null };
    case "addCity":
      return { ...state, cities: [...state.cities, action.payload] };
    case "deleteCity":
      return {
        ...state,
        cities: state.cities.filter(
          (city) => city.id !== action.payload && city
        ),
      };

    default:
      throw new Error("Action not recognized");
  }
}
const BASE_URL = "http://localhost:3000";

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { cities, error, isLoading, curCity } = state;

  useEffect(
    function () {
      async function fetchCities() {
        try {
          dispatch({ type: "loading" });
          const res = await fetch(`${BASE_URL}/cities`);
          const data = await res.json();
          dispatch({ type: "fetchData", payload: data });
        } catch {
          dispatch({
            type: "error",
            payload:
              "Failed to fetch the city data it could be a server problem",
          });
        } finally {
          dispatch({ type: "loaded" });
        }
      }
      fetchCities();
    },
    [dispatch]
  );

  const getCity = useCallback(async function getCity(id) {
    try {
      dispatch({ type: "loading" });
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();
      dispatch({ type: "getCity", payload: data });
    } catch {
      dispatch({
        type: "error",
        payload: "Failed to fetch the data make sure the server is running",
      });
    } finally {
      dispatch({ type: "loaded" });
    }
  }, []);

  async function createCity(newCity) {
    try {
      dispatch({ type: "loading" });
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("failed to send the post request");
      const data = await res.json();
      dispatch({ type: "addCity", payload: data });
    } catch (err) {
      dispatch({
        type: "error",
        payload: err.message,
      });
    } finally {
      dispatch({ type: "loaded" });
    }
  }

  async function deleteCity(id) {
    try {
      dispatch({ type: "loading" });
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });

      dispatch({ type: "deleteCity", payload: id });
    } catch {
      dispatch({
        type: "error",
        payload: "failed to delete city",
      });
    } finally {
      dispatch({ type: "loaded" });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        error,
        isLoading,
        curCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("The CitiesContext is used outside it's provider!");
  return context;
}

export { CitiesProvider, useCities };
