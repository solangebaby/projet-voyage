import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ChatCircleDots, 
  Check, 
  X, 
  Clock, 
  Star,
  User
} from '@phosphor-icons/react';

interface Comment {
  id: number;
  user: {
    name: string;
    email: string;
  };
  comment: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const AdminCommentModeration = () => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/comments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (commentId: number, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await axios.put(
        `http://localhost:8000/api/comments/${commentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setComments(comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, status: newStatus }
            : comment
        ));
        toast.success(`Comment ${newStatus} successfully!`);
      }
    } catch (error: any) {
      console.error('Error updating comment status:', error);
      toast.error(error.response?.data?.message || 'Failed to update comment');
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    return comment.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check size={16} weight="bold" />;
      case 'rejected':
        return <X size={16} weight="bold" />;
      case 'pending':
        return <Clock size={16} weight="bold" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-color2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('admin.comments.title')}</h2>
          <p className="text-sm text-gray-600 mt-1">Manage customer feedback and testimonials</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === filterOption
                  ? 'bg-color2 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                {filterOption === 'all' 
                  ? comments.length 
                  : comments.filter(c => c.status === filterOption).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-800">
                {comments.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <Clock size={40} weight="duotone" className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-800">
                {comments.filter(c => c.status === 'approved').length}
              </p>
            </div>
            <Check size={40} weight="duotone" className="text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-800">
                {comments.filter(c => c.status === 'rejected').length}
              </p>
            </div>
            <X size={40} weight="duotone" className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ChatCircleDots size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No {filter !== 'all' ? filter : ''} comments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Comment Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-color2 flex items-center justify-center">
                        <User size={24} weight="bold" className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{comment.user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{comment.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={18}
                            weight={index < comment.rating ? 'fill' : 'regular'}
                            className={index < comment.rating ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-gray-700 mb-3 leading-relaxed">{comment.comment}</p>

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                    <span className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 ${getStatusBadge(comment.status)}`}>
                      {getStatusIcon(comment.status)}
                      {comment.status}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {comment.status === 'pending' && (
                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => handleUpdateStatus(comment.id, 'approved')}
                      className="flex-1 md:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Check size={20} weight="bold" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <X size={20} weight="bold" />
                      Reject
                    </button>
                  </div>
                )}

                {comment.status === 'approved' && (
                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 font-medium text-sm"
                    >
                      <X size={18} weight="bold" />
                      Reject
                    </button>
                  </div>
                )}

                {comment.status === 'rejected' && (
                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => handleUpdateStatus(comment.id, 'approved')}
                      className="flex-1 md:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 font-medium text-sm"
                    >
                      <Check size={18} weight="bold" />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommentModeration;
