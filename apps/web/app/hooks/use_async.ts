import * as React from "react";

type AsyncState<DataType> = {
  status: "idle" | "pending" | "resolved" | "rejected";
  data: DataType | null;
  error: unknown | null;
};

type AsyncAction<DataType> =
  | { type: "idle" }
  | { type: "pending" }
  | { type: "resolved"; payload: DataType }
  | { type: "rejected"; error: unknown };

export function useAsync<DataType>() {
  const [{ data, error, status }, setState] = React.useReducer(
    (
      state: AsyncState<DataType>,
      action: AsyncAction<DataType>,
    ): AsyncState<DataType> => {
      switch (action.type) {
        case "idle": {
          return {
            status: "idle",
            data: null,
            error: null,
          };
        }
        case "pending": {
          return {
            status: "pending",
            data: null,
            error: null,
          };
        }
        case "resolved": {
          return {
            status: "resolved",
            data: action.payload,
            error: null,
          };
        }
        case "rejected": {
          return {
            status: "rejected",
            data: null,
            error: action.error,
          };
        }
      }
      // logic here
    },
    { status: "idle", data: null, error: null },
  );

  const safeSetState = useSafeDispatch(setState);

  const setData = React.useCallback(
    (data: DataType) => safeSetState({ payload: data, type: "resolved" }),
    [safeSetState],
  );
  const setError = React.useCallback(
    (error: unknown) => safeSetState({ error, type: "rejected" }),
    [safeSetState],
  );
  const reset = React.useCallback(
    () => safeSetState({ type: "idle" }),
    [safeSetState],
  );

  const run = React.useCallback(
    (promise: Promise<DataType>) => {
      if (!promise || !promise.then) {
        throw new Error(
          `The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?`,
        );
      }
      safeSetState({ type: "pending" });
      return promise.then(
        (data) => {
          setData(data);
          return data;
        },
        (error) => {
          setError(error);
          return Promise.reject(error);
        },
      );
    },
    [safeSetState, setData, setError],
  );

  return {
    // using the same names that react-query uses for convenience
    isIdle: status === "idle",
    isLoading: status === "pending",
    isError: status === "rejected",
    isSuccess: status === "resolved",

    setData,
    setError,
    error,
    status,
    data,
    run,
    reset,
  };
}

const useSafeDispatch = <Action>(dispatch: React.Dispatch<Action>) => {
  const mounted = React.useRef(false);

  React.useLayoutEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return React.useCallback(
    (...args: Parameters<React.Dispatch<Action>>) =>
      mounted.current ? dispatch(...args) : void 0,
    [dispatch],
  );
};
