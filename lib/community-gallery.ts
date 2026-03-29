import galleryPolicy from "../data/community-gallery-policy.json";

export type CommunityGalleryPolicy = {
  version: number;
  title: string;
  summary: string;
  requirements: string[];
  moderationStatuses: CommunityPhotoModerationStatus[];
  futureFields: string[];
};

export type CommunityPhotoModerationStatus = "pending" | "approved" | "rejected" | "flagged";

export type CommunityPhotoSubmission = {
  photoId: string;
  stadiumId: string;
  submittedBy: string;
  submittedAt: string;
  caption: string | null;
  takenAt: string | null;
  rightsConfirmed: boolean;
  consentConfirmed: boolean;
  moderationStatus: CommunityPhotoModerationStatus;
  moderationNotes: string | null;
};

export const communityGalleryPolicy = galleryPolicy as CommunityGalleryPolicy;

export function getCommunityGalleryReadiness(stadiumId: string) {
  return {
    stadiumId,
    acceptingUploads: false,
    approvedPhotos: 0,
    pendingPhotos: 0,
    moderationRequired: true,
  };
}
