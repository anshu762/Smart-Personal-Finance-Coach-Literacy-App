import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  details: NetInfoState["details"];
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    isInternetReachable: true,
    type: NetInfoStateType.unknown,
    details: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isOnline: state.isConnected === true,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      });
    });

    return unsubscribe;
  }, []);

  return status;
}