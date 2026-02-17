import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star, ChatCircleDots } from '@phosphor-icons/react';
import { authService } from '../../services/api';

type Comment = {
  id: number;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: { id: number; name: string };
};

const CustomerComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const isAuthenticated = authService.isAuthenticated();

  const canSubmit = useMemo(() => {
    return content.trim().length >= 10 && rating >= 1 && rating <= 5;
  }, [content, rating]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/comments');
      if (res.data.success) {
        setComments(res.data.data);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Please write at least 10 characters and select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const token = authService.getToken();

      const payload: any = { content, rating };
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

      const res = await axios.post(
        'http://localhost:8000/api/comments',
        payload,
        config
      );

      if (res.data.success) {
        toast.success('Comment submitted successfully!');
        setContent('');
        setRating(5);
        fetchComments();
        // Notify Testimonials section to refresh instantly
        window.dispatchEvent(new CustomEvent('comments:updated'));
      } else {
        toast.error('Failed to submit comment');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full h-auto flex flex-col items-center justify-center relative lg:px-24 md:px-10 px-6 my-14">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-color2 font-semibold tracking-widest">CUSTOMER COMMENTS</p>
          <h2 className="text-4xl md:text-5xl font-black text-color3 mt-2">Share Your KCTrip Experience</h2>
          <p className="text-gray-600 mt-3">Leave your comment below. Comments with rating ≥ 3 appear publicly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Comment Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-t-4 border-blue-600">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <ChatCircleDots size={24} weight="fill" className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Leave a Comment</h3>
                <p className="text-sm text-gray-600">Help other travelers choose KCTrip</p>
              </div>
            </div>


            <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setRating(v)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                    rating >= v
                      ? 'bg-yellow-400 border-yellow-500'
                      : 'bg-white border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <Star size={18} weight="fill" className={rating >= v ? 'text-gray-900' : 'text-gray-300'} />
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold text-gray-700 mb-2">Your Comment</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Write your experience with KCTrip..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{content.trim().length}/10 minimum characters</span>
              <span>{rating}/5 stars</span>
            </div>

            {!canSubmit && (
              <div className="mt-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-gray-800">
                <p className="font-bold mb-1">To submit your comment, please:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {content.trim().length < 10 && <li>Write at least 10 characters</li>}
                  {(rating < 1 || rating > 5) && <li>Select a rating (1 to 5)</li>}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Comment'}
            </button>
          </div>

          {/* Comments List */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-t-4 border-yellow-500">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Latest Approved Comments</h3>

            {loading ? (
              <p className="text-gray-600">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-600">No comments yet. Be the first to share your experience.</p>
            ) : (
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                {comments.slice(0, 12).map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-100 transition">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-gray-900">{c.user?.name || 'Traveler'}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            weight="fill"
                            className={i < c.rating ? 'text-yellow-500' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-3">{new Date(c.created_at).toLocaleString('en-US')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerComments;
