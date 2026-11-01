"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Star, Image as ImageIcon, X } from "lucide-react";

interface ProductReviewFormProps {
  productId: Id<"products">;
}

export default function ProductReviewForm({ productId }: ProductReviewFormProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const createReview = useMutation(api.reviews.createReview);
  const generateUploadUrl = useMutation(api.reviews.generateReviewImageUploadUrl);
  const canReview = useQuery(api.reviews.canUserReviewProduct, isSignedIn ? { productId, userId: user!.id } : "skip");
  const userReview = useQuery(api.reviews.getUserReviewForProduct, isSignedIn ? { productId, userId: user!.id } : "skip");

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setIsSubmitting(true);

    let imageStorageId: Id<"_storage"> | undefined;

    try {
      // Upload image if selected
      if (imageFile) {
        setIsUploading(true);
        const { uploadUrl } = await generateUploadUrl({});
        const res = await fetch(uploadUrl, { method: "POST", body: imageFile });
        const { storageId } = await res.json();
        imageStorageId = storageId as Id<"_storage">;
        setIsUploading(false);
      }

      await createReview({
        productId,
        userId: user.id,
        orderId: canReview?.eligibleOrders?.[0]?._id as Id<"orders">,
        rating,
        comment,
        title: title.trim() || undefined,
        userName: (user.fullName || user.firstName || user.username || "Verified Buyer").trim(),
        imageStorageId,
      });
      setSuccess(true);
      setComment("");
      setTitle("");
      setRating(0);
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clerkUserName = user?.fullName || user?.firstName || user?.username || "Verified Buyer";

  if (!isLoaded) {
    return (
      <div className="border-t border-black/15 pt-12 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-surface-container w-48 rounded-none" />
          <div className="h-4 bg-surface-container w-full rounded-none" />
          <div className="h-4 bg-surface-container w-3/4 rounded-none" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div id="write-review" className="border-t border-black/15 pt-12">
        <h3 className="font-headline-md text-headline-md uppercase tracking-tighter text-primary mb-4">
          Write a Review
        </h3>
        <div className="border border-black/15 p-8 text-center space-y-4">
          <p className="font-body-md text-secondary">
            Please <a href="/sign-in" className="text-primary-fixed underline hover:text-primary">sign in</a> to write a review.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="border-t border-black/15 pt-12">
        <div className="border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4">
          <p className="font-headline-md text-emerald-500">Thank you for your review!</p>
          <p className="font-label-sm text-secondary">Your review has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  if (!canReview?.canReview) {
    if (canReview?.alreadyReviewed) {
      return (
        <div id="write-review" className="border-t border-black/15 pt-12">
          <div className="border border-primary/30 bg-primary/10 p-8 text-center space-y-4">
            <p className="font-headline-md text-primary">You&apos;ve already reviewed this product</p>
            <p className="font-label-sm text-secondary">Thank you for sharing your experience!</p>
          </div>
        </div>
      );
    }

    return (
      <div id="write-review" className="border-t border-black/15 pt-12">
        <h3 className="font-headline-md text-headline-md uppercase tracking-tighter text-primary mb-4">
          Write a Review
        </h3>
        <div className="border border-error/30 bg-error/10 p-8 text-center space-y-4">
          <p className="font-headline-md text-black">Purchase Required</p>
          <p className="font-label-sm text-secondary max-w-md mx-auto">
            {canReview?.reason ?? "Only verified buyers who have received this item can leave a review."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="write-review" className="scroll-mt-24 border-t border-black/15 pt-12 space-y-6">
      <h3 className="font-headline-md text-headline-md uppercase tracking-tighter text-primary">
        Write a Review
      </h3>

      <div className="bg-surface p-4 border border-black/15 text-sm">
        <p className="font-label-bold text-secondary">Reviewing as: </p>
        <p className="font-body-md text-primary">{clerkUserName}</p>
      </div>

      {error && (
        <div className="border border-error/30 bg-error/10 p-4">
          <p className="font-label-bold text-sm text-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="font-label-bold text-sm uppercase tracking-wider text-secondary block mb-3">
            Review Title <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Summarize your experience in a few words..."
            className="w-full bg-surface border border-black/15 px-4 py-3 font-body-md text-primary placeholder:text-black/30 focus:border-primary-fixed focus:outline-none transition-colors"
          />
          <p className="font-label-sm text-secondary mt-1 text-right">
            {title.length}/100 characters
          </p>
        </div>

        <div>
          <label className="font-label-bold text-sm uppercase tracking-wider text-secondary block mb-3">
            Your Rating <span className="text-error">*</span>
          </label>
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Select rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`w-12 h-12 flex items-center justify-center border-2 transition-all ${
                  star <= rating
                    ? "border-primary bg-primary text-background"
                    : "border-black/15 text-black/30 hover:border-primary-fixed hover:text-primary-fixed"
                }`}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <Star className="w-6 h-6" />
              </button>
            ))}
          </div>
          {rating === 0 && (
            <p className="font-label-sm text-error mt-2">Please select a rating</p>
          )}
        </div>

        <div>
          <label htmlFor="review-comment" className="font-label-bold text-sm uppercase tracking-wider text-secondary block mb-3">
            Your Review <span className="text-error">*</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            minLength={10}
            maxLength={2000}
            required
            className="w-full bg-surface border border-black/15 px-4 py-3 font-body-md text-primary placeholder:text-black/30 focus:border-primary-fixed focus:outline-none transition-colors resize-y"
            placeholder="Share your experience with this product... (minimum 10 characters)"
          />
          <p className="font-label-sm text-secondary mt-1 text-right">
            {comment.length}/2000 characters
          </p>
        </div>

        <div>
          <label className="font-label-bold text-sm uppercase tracking-wider text-secondary block mb-3">
            Add a Photo (Optional)
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSubmitting}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-black/15 hover:border-primary-fixed hover:text-primary-fixed transition-colors cursor-pointer px-4 py-3 min-h-[80px] w-full md:w-48"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="font-label-bold text-sm text-secondary">Upload Image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
              className="hidden"
            />
            {imagePreview && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-black/15">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {isUploading && (
            <p className="font-label-sm text-secondary mt-2">Uploading image...</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isUploading || rating === 0 || comment.trim().length < 10 || !title.trim()}
          className="w-full h-14 bg-primary text-background font-label-bold text-lg tracking-widest uppercase hover:bg-black hover:text-white border border-transparent hover:border-black transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isUploading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}