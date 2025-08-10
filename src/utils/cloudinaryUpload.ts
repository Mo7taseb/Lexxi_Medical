/**
 * Cloudinary Upload Utility for Large Audio Files
 * Free tier: 25GB storage, 25GB bandwidth per month
 */

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
}

export class CloudinaryUploader {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
    
    if (!this.cloudName || !this.uploadPreset) {
      throw new Error('Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    }
  }

  /**
   * Upload audio file to Cloudinary
   */
  async uploadAudio(file: File): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('resource_type', 'video'); // Cloudinary treats audio as video
    formData.append('folder', 'lexxi-audio');
    // Add timestamp and random string for unique naming
    formData.append('public_id', `${Date.now()}-${Math.random().toString(36).substring(2)}`);
    // Remove access_mode since it's handled by upload preset
    // formData.append('access_mode', 'token');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      // Get detailed error information
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || response.statusText;
        console.error('Cloudinary error details:', errorData);
      } catch (e) {
        errorMessage = response.statusText;
      }
      throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Download audio file from Cloudinary URL
   */
  async downloadAudio(url: string): Promise<File> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    const blob = await response.blob();
    const filename = url.split('/').pop() || 'audio.mp3';
    return new File([blob], filename, { type: blob.type });
  }

  /**
   * Delete audio file from Cloudinary
   */
  async deleteAudio(publicId: string): Promise<void> {
    // This requires server-side implementation with Cloudinary admin API
    console.log('Delete audio:', publicId);
  }
}
