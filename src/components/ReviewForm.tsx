import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubmitReview } from "@/hooks/useReviews";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const submitReview = useSubmitReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }

    try {
      await submitReview.mutateAsync({
        productId,
        rating,
        comment: comment.trim() || undefined,
      });
      
      // Reset form
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Your Rating *</Label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="p-1 hover:scale-110 transition-transform"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  value <= (hoverRating || rating)
                    ? 'text-primary fill-primary'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
          <span className="ml-3 text-sm text-muted-foreground">
            {rating > 0 && (
              <>
                {rating} star{rating !== 1 ? 's' : ''} - 
                {rating === 5 && ' Excellent!'}
                {rating === 4 && ' Very Good!'}
                {rating === 3 && ' Good'}
                {rating === 2 && ' Fair'}
                {rating === 1 && ' Poor'}
              </>
            )}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="comment" className="text-base font-semibold mb-3 block">
          Your Review (Optional)
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px] glass-primary"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/500 characters
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          * Rating is required
        </p>
        <Button
          type="submit"
          disabled={rating === 0 || submitReview.isPending}
          className="bg-gradient-primary hover-glow min-w-32"
        >
          {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};