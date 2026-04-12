import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export const uploadImage = async (
  file: File,
  path: string
): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

export const uploadCarImages = async (
  files: File[],
  carId: string
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const path = `cars/${carId}/${Date.now()}_${index}_${file.name}`;
    return uploadImage(file, path);
  });
  return Promise.all(uploadPromises);
};

export const uploadSubmissionImages = async (
  files: File[],
  submissionId: string
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const path = `submissions/${submissionId}/${Date.now()}_${index}_${file.name}`;
    return uploadImage(file, path);
  });
  return Promise.all(uploadPromises);
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};
