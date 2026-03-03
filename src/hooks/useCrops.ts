import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { db } from "@/integrations/firebase/client";
import {
  collection,
  query as fbQuery,
  orderBy,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

export function useCrops() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const q = fbQuery(
      collection(db, "crops"),
      orderBy("profitability_rank", "asc"),
    );
    const unsubscribe = onSnapshot(q, () => {
      queryClient.invalidateQueries({ queryKey: ["crops"] });
    });
    return unsubscribe;
  }, [queryClient]);

  return useQuery({
    queryKey: ["crops"],
    queryFn: async () => {
      const q = fbQuery(
        collection(db, "crops"),
        orderBy("profitability_rank", "asc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}
