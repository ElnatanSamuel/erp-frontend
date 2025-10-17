'use client';

import { useEffect, useState } from 'react';
import { authClient } from '../utils/authClient';

export function useClientSession() {
  const [data, setData] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<any>(null);
  
  useEffect(() => {
    authClient.getMe()
      .then(({ data, error }) => {
        setData(data);
        setError(error);
        setIsPending(false);
      })
      .catch((err) => {
        setError(err);
        setIsPending(false);
      });
  }, []);
  
  return { data, isPending, error };
}
