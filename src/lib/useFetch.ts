"use client";

import { useEffect, useRef, useState } from "react";

type State<T> = {
  data: T | null;
  loading: boolean;
  error: boolean;
};

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[]): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: false });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setState({ data: null, loading: true, error: false });

    fetcher()
      .then((data) => {
        if (mountedRef.current) setState({ data, loading: false, error: false });
      })
      .catch(() => {
        if (mountedRef.current) setState({ data: null, loading: false, error: true });
      });

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
