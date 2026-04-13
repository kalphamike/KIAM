import { Star, ExternalLink } from "lucide-react";
import { googleReviews as defaultReviews } from "@/data/google";

export default function GoogleReviewsWidget() {
  const reviews = defaultReviews;
  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Reviews</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">{averageRating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{reviews.length} reviews</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg bg-muted/50 p-3">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                {review.authorName.charAt(0)}
              </div>
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium text-foreground">{review.authorName}</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-2.5 w-2.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="line-clamp-2 text-xs text-foreground/80">"{review.text}"</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{review.time}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        <a 
          href="https://www.google.com/maps?cid=14521093440337060944" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline flex items-center justify-center gap-1"
        >
          View on Google Maps <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
}