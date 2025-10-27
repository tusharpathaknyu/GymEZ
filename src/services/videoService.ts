import {supabase} from './supabase';
import {Video} from '../types';

export class VideoService {
  /**
   * Upload video file to Supabase Storage
   */
  static async uploadVideo(
    videoUri: string,
    fileName: string,
    memberId: string
  ): Promise<string> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: videoUri,
        type: 'video/mp4',
        name: fileName,
      } as any);

      // Upload to Supabase Storage
      const {data, error} = await supabase.storage
        .from('workout-videos')
        .upload(`${memberId}/${fileName}`, formData);

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const {data: urlData} = supabase.storage
        .from('workout-videos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Video upload error:', error);
      throw error;
    }
  }

  /**
   * Create video record in database
   */
  static async createVideoRecord(
    memberId: string,
    gymId: string,
    videoUrl: string,
    title: string,
    description: string,
    exerciseType: string,
    duration: number
  ): Promise<Video> {
    try {
      const {data, error} = await supabase
        .from('videos')
        .insert({
          member_id: memberId,
          gym_id: gymId,
          video_url: videoUrl,
          title,
          description,
          exercise_type: exerciseType,
          duration,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create video record: ${error.message}`);
      }

      return data as Video;
    } catch (error) {
      console.error('Create video record error:', error);
      throw error;
    }
  }

  /**
   * Submit video for approval (combines upload and database record)
   */
  static async submitVideoForApproval(
    videoUri: string,
    memberId: string,
    gymId: string,
    title: string,
    description: string,
    exerciseType: string,
    duration: number
  ): Promise<Video> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `workout_${timestamp}.mp4`;

      // Upload video file
      const videoUrl = await this.uploadVideo(videoUri, fileName, memberId);

      // Create database record
      const videoRecord = await this.createVideoRecord(
        memberId,
        gymId,
        videoUrl,
        title,
        description,
        exerciseType,
        duration
      );

      return videoRecord;
    } catch (error) {
      console.error('Submit video error:', error);
      throw error;
    }
  }

  /**
   * Get videos for a gym member
   */
  static async getMemberVideos(memberId: string): Promise<Video[]> {
    try {
      const {data, error} = await supabase
        .from('videos')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', {ascending: false});

      if (error) {
        throw new Error(`Failed to fetch member videos: ${error.message}`);
      }

      return data as Video[];
    } catch (error) {
      console.error('Get member videos error:', error);
      throw error;
    }
  }

  /**
   * Get pending videos for gym owner approval
   */
  static async getPendingVideos(gymId: string): Promise<Video[]> {
    try {
      const {data, error} = await supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_member_id_fkey(full_name, email)
        `)
        .eq('gym_id', gymId)
        .eq('status', 'pending')
        .order('created_at', {ascending: false});

      if (error) {
        throw new Error(`Failed to fetch pending videos: ${error.message}`);
      }

      return data as Video[];
    } catch (error) {
      console.error('Get pending videos error:', error);
      throw error;
    }
  }

  /**
   * Get all videos for a gym (for gym owners)
   */
  static async getGymVideos(gymId: string): Promise<Video[]> {
    try {
      const {data, error} = await supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_member_id_fkey(full_name, email)
        `)
        .eq('gym_id', gymId)
        .order('created_at', {ascending: false});

      if (error) {
        throw new Error(`Failed to fetch gym videos: ${error.message}`);
      }

      return data as Video[];
    } catch (error) {
      console.error('Get gym videos error:', error);
      throw error;
    }
  }

  /**
   * Approve a video
   */
  static async approveVideo(
    videoId: string,
    approvedBy: string
  ): Promise<Video> {
    try {
      const {data, error} = await supabase
        .from('videos')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approval_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', videoId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to approve video: ${error.message}`);
      }

      return data as Video;
    } catch (error) {
      console.error('Approve video error:', error);
      throw error;
    }
  }

  /**
   * Reject a video
   */
  static async rejectVideo(
    videoId: string,
    approvedBy: string,
    rejectionReason: string
  ): Promise<Video> {
    try {
      const {data, error} = await supabase
        .from('videos')
        .update({
          status: 'rejected',
          approved_by: approvedBy,
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', videoId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to reject video: ${error.message}`);
      }

      return data as Video;
    } catch (error) {
      console.error('Reject video error:', error);
      throw error;
    }
  }
}