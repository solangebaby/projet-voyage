import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Ticket,
  DownloadSimple,
  ClockClockwise,
  User,
  ChatCircleDots,
  SignOut,
  Calendar,
  MapPin,
  Bus,
} from '@phosphor-icons/react';

interface Reservation {
  id: number;
  trip: {
    departure: { city_name: string };
    destination: { city_name: string };
    departure_time: string;
    arrival_time: string;
    trip_date: string;
    bus: { bus_name: string };
  };
  seat_number: string;
  status: string;
  created_at: string;
}

interface TicketData {
  id: number;
  ticket_number: string;
  qr_code: string;
  reservation: Reservation;
  created_at: string;
}

const TravelerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState<'reservations' | 'tickets' | 'history' | 'profile' | 'feedback'>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!token) {
      toast.error('Please login to access dashboard');
      navigate('/login');
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch reservations
      const resResponse = await axios.get(
        `http://localhost:8000/api/reservations/user/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resResponse.data.success) {
        setReservations(resResponse.data.data);
      }

      // Fetch tickets
      const ticketResponse = await axios.get(
        `http://localhost:8000/api/tickets/user/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (ticketResponse.data.success) {
        setTickets(ticketResponse.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (ticketNumber: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/tickets/${ticketNumber}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticketNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/comments',
        {
          comment: feedbackText,
          rating: rating,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Feedback submitted successfully!');
        setFeedbackText('');
        setRating(5);
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-color2 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.user.title')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('common.welcome')}, {user.first_name || user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-color2 transition"
              >
                {t('nav.home')}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <SignOut size={20} />
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'reservations', label: t('dashboard.user.myReservations'), icon: Calendar },
              { key: 'tickets', label: t('dashboard.user.myTickets'), icon: Ticket },
              { key: 'history', label: t('dashboard.user.reservationHistory'), icon: ClockClockwise },
              { key: 'profile', label: t('dashboard.user.profile'), icon: User },
              { key: 'feedback', label: t('dashboard.user.giveFeedback'), icon: ChatCircleDots },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-color2 text-color2'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.user.myReservations')}</h2>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-color2 text-white rounded-lg hover:bg-color3 transition"
              >
                {t('dashboard.user.bookNow')}
              </button>
            </div>

            {reservations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">{t('dashboard.user.noReservations')}</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-color2 text-white rounded-lg hover:bg-color3 transition"
                >
                  {t('dashboard.user.bookNow')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {reservation.trip.departure.city_name} → {reservation.trip.destination.city_name}
                        </h3>
                        <p className="text-sm text-gray-500">{reservation.trip.bus.bus_name}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          reservation.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : reservation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-color2" />
                        <span>{new Date(reservation.trip.trip_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-color2" />
                        <span>{reservation.trip.departure_time} - {reservation.trip.arrival_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bus size={18} className="text-color2" />
                        <span>Seat: {reservation.seat_number}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.user.myTickets')}</h2>

            {tickets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Ticket size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">{t('dashboard.user.noTickets')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                    <div className="text-center mb-4">
                      <p className="text-xs text-gray-500 mb-1">Ticket Number</p>
                      <p className="font-mono font-bold text-color2">{ticket.ticket_number}</p>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                      <p className="font-semibold text-gray-900">
                        {ticket.reservation.trip.departure.city_name} → {ticket.reservation.trip.destination.city_name}
                      </p>
                      <p className="text-gray-600">
                        {new Date(ticket.reservation.trip.trip_date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">Seat: {ticket.reservation.seat_number}</p>
                    </div>

                    <button
                      onClick={() => handleDownloadTicket(ticket.ticket_number)}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-color2 text-white rounded-lg hover:bg-color3 transition"
                    >
                      <DownloadSimple size={20} />
                      {t('ticket.downloadPDF')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.user.reservationHistory')}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.trip.departure.city_name} → {reservation.trip.destination.city_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reservation.trip.trip_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.seat_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            reservation.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : reservation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.user.profile')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={user.name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={user.first_name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={user.phone || 'Not provided'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.user.giveFeedback')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color2"
                  placeholder="Share your experience with us..."
                ></textarea>
              </div>
              <button
                onClick={handleSubmitFeedback}
                className="px-6 py-3 bg-color2 text-white rounded-lg hover:bg-color3 transition"
              >
                {t('common.submit')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelerDashboard;
