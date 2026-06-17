import { useEffect, useState } from "react";
import { getMetricTypes } from "../api/metricTypes";
import type { MetricType } from "../types";

export function useMetricTypes() {
  const [metricTypes, setMetricTypes] = useState<MetricType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMetricTypes()
      .then(setMetricTypes)
      .catch(() => setMetricTypes([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { metricTypes, isLoading };
}
