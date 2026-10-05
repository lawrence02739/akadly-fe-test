import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

export interface TenantInfo {
  name: string;
  slug: string;
}

export type PortalKind = 'admin' | 'root' | 'tenant';

export interface PortalState {
  status: 'loading' | 'ready' | 'notfound' | 'unavailable' | 'error';
  kind?: PortalKind;
  tenant?: TenantInfo;
  retry?: () => void;
}

const PortalContext = createContext<PortalState>({ status: 'loading' });

export function usePortal(): PortalState {
  return useContext(PortalContext);
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PortalState>({ status: 'loading' });

  const load = () => {
    setState((s) => ({ ...s, status: 'loading' }));
    // Use a plain axios call — NOT the shared intercepted api instance —
    // so that a 401 here doesn't trigger a redirect loop.
    axios
      .get(`${API_BASE_URL}/portal/info`, { withCredentials: true })
      .then((res) => {
        // Normalise {success, data} envelope or plain data
        const payload = res.data?.data ?? res.data;
        const kind: PortalKind = payload?.kind;
        if (!kind) {
          setState({ status: 'error', retry: load });
          return;
        }
        setState({
          status: 'ready',
          kind,
          tenant: payload?.tenant,
        });
      })
      .catch((err: { response?: { status?: number } }) => {
        const status = err.response?.status;
        if (status === 404) {
          setState({ status: 'notfound' });
        } else if (status === 403) {
          setState({ status: 'unavailable' });
        } else {
          setState({ status: 'error', retry: load });
        }
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PortalContext.Provider value={state}>{children}</PortalContext.Provider>
  );
}
