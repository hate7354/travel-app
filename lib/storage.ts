import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadTripImage(path: string, file: File) {
  if (!storage) throw new Error("Firebase Storage 설정이 필요합니다.");

  const imageRef = ref(storage, path);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}
