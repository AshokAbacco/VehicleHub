import { useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';

const defaultBreakdown = [
    { stars: 5, pct: 68 },
    { stars: 4, pct: 21 },
    { stars: 3, pct: 7 },
    { stars: 2, pct: 3 },
    { stars: 1, pct: 1 },
];

const StarRow = ({ count }) => (
    <div className="flex gap-0.5 text-amber-300">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill={i < count ? 'currentColor' : 'none'} />
        ))}
    </div>
);

/**
 * Amazon-style ratings summary (star histogram) + review list with "helpful" votes.
 * Pass real `reviews` when a backend exists; falls back to sample data for layout preview.
 */
export const ReviewsSection = ({
    averageRating = 4.6,
    totalReviews = 342,
    breakdown = defaultBreakdown,
    reviews = [
        { id: 'r1', name: 'Priya N.', rating: 5, date: '2 weeks ago', text: 'Inspection report matched the car exactly. Delivery was on time and paperwork was handled end to end.', helpful: 24 },
        { id: 'r2', name: 'Karan S.', rating: 4, date: '1 month ago', text: 'Smooth buying process, EMI approval took under a day. Minor scratch not mentioned in listing but seller resolved it.', helpful: 11 },
    ],
}) => {
    const [votes, setVotes] = useState({});

    const markHelpful = (id) => setVotes((prev) => ({ ...prev, [id]: true }));

    return (
        <Card className="space-y-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="text-center sm:w-40">
                    <p className="text-4xl font-semibold text-white">{averageRating.toFixed(1)}</p>
                    <StarRow count={Math.round(averageRating)} />
                    <p className="mt-1 text-xs text-slate-400">{totalReviews} ratings</p>
                </div>
                <div className="flex-1 space-y-1">
                    {breakdown.map((row) => (
                        <div key={row.stars} className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="w-10">{row.stars} star</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${row.pct}%` }} />
                            </div>
                            <span className="w-8 text-right">{row.pct}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-4">
                {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl bg-slate-950/70 p-4">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-white">{review.name}</p>
                            <p className="text-xs text-slate-500">{review.date}</p>
                        </div>
                        <StarRow count={review.rating} />
                        <p className="mt-2 text-sm leading-6 text-slate-400">{review.text}</p>
                        <button
                            type="button"
                            onClick={() => markHelpful(review.id)}
                            className={`mt-3 flex items-center gap-1 text-xs font-medium ${votes[review.id] ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <ThumbsUp size={12} /> Helpful{votes[review.id] ? ` · Thanks!` : ` (${review.helpful})`}
                        </button>
                    </div>
                ))}
            </div>

            <Button variant="secondary" className="w-full justify-center">Write a review</Button>
        </Card>
    );
};