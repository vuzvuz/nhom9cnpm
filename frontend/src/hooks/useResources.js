import { useEffect, useState } from 'react';

export function useResources(load) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    load()
      .then((data) => { if (active) setState({ data, error: '', loading: false }); })
      .catch(() => {
        if (active) setState({ data: null, error: 'Không thể tải dữ liệu. Vui lòng thử lại.', loading: false });
      });
    return () => { active = false; };
  }, [load, attempt]);

  return {
    ...state,
    retry() {
      setState({ data: null, error: '', loading: true });
      setAttempt((value) => value + 1);
    },
    update(updater) {
      setState((current) => ({ ...current, data: updater(current.data) }));
    },
  };
}
