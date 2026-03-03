import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { db } from "@/integrations/firebase/client";
import {
  collection,
  query as fbQuery,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export function useFileUploads() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const q = fbQuery(
      collection(db, "file_uploads"),
      orderBy("uploaded_at", "desc"),
    );
    const unsubscribe = onSnapshot(q, () => {
      queryClient.invalidateQueries({ queryKey: ["file-uploads"] });
    });
    return unsubscribe;
  }, [queryClient]);

  return useQuery({
    queryKey: ["file-uploads"],
    queryFn: async () => {
      const q = fbQuery(
        collection(db, "file_uploads"),
        orderBy("uploaded_at", "desc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fileName,
      fileType,
      fileSize,
      data,
    }: {
      fileName: string;
      fileType: string;
      fileSize: number;
      data: unknown;
    }) => {
      const docRef = await addDoc(collection(db, "file_uploads"), {
        user_id: "anonymous",
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        data: data as any,
        uploaded_at: new Date().toISOString(),
      });
      const snapshot = await getDocs(fbQuery(doc(db, "file_uploads", docRef.id)));
      return { id: docRef.id, ...(snapshot.docs[0]?.data() || {}) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-uploads"] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      await deleteDoc(doc(db, "file_uploads", fileId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-uploads"] });
    },
  });
}
