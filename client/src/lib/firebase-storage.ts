
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  return { valid: true };
};

export const uploadImageToFirebase = async (
  file: File,
  folder: string = 'menu-items'
): Promise<UploadResult> => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Create storage reference
    const storageRef = ref(storage, fileName);

    // Upload file
    console.log('🔄 Uploading image to Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('✅ Image uploaded successfully');

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    console.log('✅ Download URL obtained:', url);

    return {
      url,
      path: fileName,
    };
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};

export const deleteImageFromFirebase = async (imagePath: string): Promise<void> => {
  try {
    if (!imagePath) {
      throw new Error('No image path provided');
    }

    // Extract path from URL if full URL was provided
    let pathToDelete = imagePath;
    if (imagePath.includes('firebasestorage.googleapis.com')) {
      const urlParts = imagePath.split('/o/')[1];
      if (urlParts) {
        pathToDelete = decodeURIComponent(urlParts.split('?')[0]);
      }
    }

    const storageRef = ref(storage, pathToDelete);
    await deleteObject(storageRef);
    console.log('✅ Image deleted from Firebase Storage');
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    throw error;
  }
};
