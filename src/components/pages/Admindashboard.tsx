import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "../../components/atoms/Text";
import { Button } from "../../components/atoms/Button";
import {
  Bus, Users, Ticket, Money, SignOut, ChartLine, Eye, Trash,
  MagnifyingGlass, Plus, X, CalendarBlank, Clock, MapPin
} from "@phosphor-icons/react";
import { Fade } from "react-awesome-reveal";
import toast from "react-hot-toast";
import { 
  getAllReservations, getAllPayments, getAllTickets, getBuses, getDestinations,
  createTrip, Reservation, Payment, Ticket as TicketType, Bus as BusType, Destination, Trip
} from "../../services/api";
import api from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "reservations" | "payments" | "trips">("overview");
  
  const [stats, setStats] = useState({
    totalReservations: 0, totalRevenue: 0, totalTickets: 0, totalPassengers: 0,
    pendingReservations: 0, confirmedReservations: 0, cancelledReservations: 0,
    todayRevenue: 0, todayReservations: 0
  });
  
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [newTrip, setNewTrip] = useState({
    busId: "", departure: "", destination: "", date: "",
    departureTime: "", arrivalTime: ""
  });

  useEffect(() => {
    const email = localStorage.getItem("adminEmail");
    if (!email) {
      toast.error("Please login first");
      navigate("/admin/login");
      return;
    }
    setAdminEmail(email);
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [reservations, payments, tickets, busesData, destinationsData, trips] = await Promise.all([
        getAllReservations(), getAllPayments(), getAllTickets(), getBuses(), 
        getDestinations(), api.get('/trips').then(res => res.data)
      ]);

      const revenue = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
      const today = new Date().toISOString().split('T')[0];
      const todayReservations = reservations.filter(r => r.createdAt?.startsWith(today));
      const todayPayments = payments.filter(p => p.status === 'success' && p.createdAt?.startsWith(today));
      const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

      setStats({
        totalReservations: reservations.length,
        totalRevenue: revenue,
        totalTickets: tickets.length,
        totalPassengers: new Set(reservations.map(r => r.passengerId)).size,
        pendingReservations: reservations.filter(r => r.status === 'pending').length,
        confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
        cancelledReservations: reservations.filter(r => r.status === 'cancelled').length,
        todayRevenue, todayReservations: todayReservations.length
      });

      setAllReservations(reservations.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      ));
      setAllPayments(payments.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      ));
      setAllTrips(trips);
      setBuses(busesData);
      setDestinations(destinationsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminEmail");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const handleDeleteReservation = async (id: string) => {
    if (!window.confirm("Delete this reservation?")) return;
    try {
      await api.delete(`/reservations/${id}`);
      toast.success("Reservation deleted!");
      loadAllData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleDeleteTrip = async (id: number) => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await api.delete(`/trips/${id}`);
      toast.success("Trip deleted!");
      loadAllData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleAddTrip = async () => {
    if (!newTrip.busId || !newTrip.departure || !newTrip.destination || !newTrip.date || !newTrip.departureTime || !newTrip.arrivalTime) {
      toast.error("Please fill all fields");
      return;
    }

    const selectedBus = buses.find(b => b.id === parseInt(newTrip.busId));
    if (!selectedBus) {
      toast.error("Invalid bus");
      return;
    }

    try {
      await createTrip({
        busId: parseInt(newTrip.busId),
        departure: newTrip.departure,
        destination: newTrip.destination,
        date: newTrip.date,
        departureTime: newTrip.departureTime,
        arrivalTime: newTrip.arrivalTime,
        availableSeats: selectedBus.totalSeats,
        occupiedSeats: []
      });

      toast.success("Trip created!");
      setShowAddTripModal(false);
      setNewTrip({ busId: "", departure: "", destination: "", date: "", departureTime: "", arrivalTime: "" });
      loadAllData();
    } catch (error) {
      toast.error("Failed to create trip");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredReservations = allReservations.filter(res => {
    const matchesSearch = searchTerm === "" || 
      res.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || res.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-color2 border-t-transparent mx-auto mb-4"></div>
          <Text className="text-gray-600">Loading dashboard...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-color2 to-color3 text-white py-6 px-6 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Text as="h1" className="text-3xl font-bold">Admin Dashboard</Text>
              <Text as="p" className="text-blue-100 mt-1">Welcome, {adminEmail}</Text>
            </div>
            <Button onClick={handleLogout} className="bg-white text-color2 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2">
              <SignOut size={20} weight="bold" /> Logout
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: ChartLine },
              { id: "reservations", label: "Reservations", icon: Ticket },
              { id: "payments", label: "Payments", icon: Money },
              { id: "trips", label: "Trips", icon: Bus }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id ? "bg-white text-color2" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}>
                <tab.icon size={20} weight="duotone" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <Fade cascade damping={0.05}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text as="p" className="text-gray-600 text-sm font-medium">Total Reservations</Text>
                      <Text as="p" className="text-3xl font-bold text-gray-800 mt-2">{stats.totalReservations}</Text>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="text-green-600">✓ {stats.confirmedReservations}</span>
                        <span className="text-yellow-600">⏳ {stats.pendingReservations}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Ticket size={24} weight="duotone" className="text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text as="p" className="text-gray-600 text-sm font-medium">Total Revenue</Text>
                      <Text as="p" className="text-3xl font-bold text-gray-800 mt-2">{(stats.totalRevenue / 1000).toFixed(0)}K</Text>
                      <Text as="p" className="text-xs text-gray-500 mt-1">Today: {stats.todayRevenue.toLocaleString()} F</Text>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Money size={24} weight="duotone" className="text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text as="p" className="text-gray-600 text-sm font-medium">Tickets Issued</Text>
                      <Text as="p" className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTickets}</Text>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bus size={24} weight="duotone" className="text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text as="p" className="text-gray-600 text-sm font-medium">Passengers</Text>
                      <Text as="p" className="text-3xl font-bold text-gray-800 mt-2">{stats.totalPassengers}</Text>
                      <Text as="p" className="text-xs text-gray-500 mt-1">Today: {stats.todayReservations}</Text>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users size={24} weight="duotone" className="text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
            </Fade>

            <Fade delay={200}>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <Text as="h2" className="text-xl font-bold">Recent Activity</Text>
                  <Button onClick={loadAllData} className="bg-color2 text-white px-4 py-2 rounded-lg text-sm">
                    Refresh
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Route</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allReservations.slice(0, 5).map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs font-mono">{r.id?.slice(0, 12)}...</td>
                          <td className="px-4 py-3 text-sm">{r.departure} → {r.destination}</td>
                          <td className="px-4 py-3 text-sm">{r.date}</td>
                          <td className="px-4 py-3 text-sm font-bold">{r.price.toLocaleString()} F</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(r.status)}`}>
                              {r.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Fade>
          </>
        )}

        {/* RESERVATIONS */}
        {activeTab === "reservations" && (
          <Fade>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <Text as="h2" className="text-2xl font-bold">All Reservations ({filteredReservations.length})</Text>
                <div className="flex gap-3">
                  <div className="relative">
                    <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search..." value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-color2 w-64" />
                  </div>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border-2 rounded-lg">
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Route</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Seat</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredReservations.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-mono">{r.id?.slice(0, 15)}...</td>
                        <td className="px-4 py-3 text-sm">{r.departure} → {r.destination}</td>
                        <td className="px-4 py-3 text-sm">{r.date}</td>
                        <td className="px-4 py-3 text-sm font-bold text-color2">{r.selectedSeat}</td>
                        <td className="px-4 py-3 text-sm font-bold">{r.price.toLocaleString()} F</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(r.status)}`}>
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteReservation(r.id!)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Fade>
        )}

        {/* PAYMENTS */}
        {activeTab === "payments" && (
          <Fade>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Text as="h2" className="text-2xl font-bold mb-6">Payment History ({allPayments.length})</Text>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Transaction ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allPayments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-mono">{p.transactionId}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{p.method}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{p.phoneNumber}</td>
                        <td className="px-4 py-3 text-sm font-bold">{p.amount.toLocaleString()} F</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(p.status)}`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Fade>
        )}

        {/* TRIPS */}
        {activeTab === "trips" && (
          <Fade>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <Text as="h2" className="text-2xl font-bold">Manage Trips ({allTrips.length})</Text>
                <Button onClick={() => setShowAddTripModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus size={20} /> Add Trip
                </Button>
              </div>

              <div className="grid gap-4">
                {allTrips.map(trip => (
                  <div key={trip.id} className="border-2 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <MapPin size={20} className="text-color2" />
                          <Text className="font-bold text-lg">{trip.departure} → {trip.destination}</Text>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarBlank size={16} /> {trip.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} /> {trip.departureTime} - {trip.arrivalTime}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} /> {trip.availableSeats} seats available
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteTrip(trip.id!)}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Fade>
        )}
      </div>

      {/* ADD TRIP MODAL */}
      {showAddTripModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <Text as="h3" className="text-xl font-bold">Add New Trip</Text>
              <button onClick={() => setShowAddTripModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <select value={newTrip.busId} onChange={(e) => setNewTrip({...newTrip, busId: e.target.value})}
                className="w-full border-2 rounded-lg px-4 py-2">
                <option value="">Select Bus</option>
                {buses.map(b => <option key={b.id} value={b.id}>{b.busName} ({b.type})</option>)}
              </select>

              <select value={newTrip.departure} onChange={(e) => setNewTrip({...newTrip, departure: e.target.value})}
                className="w-full border-2 rounded-lg px-4 py-2">
                <option value="">From</option>
                {destinations.map(d => <option key={d.id} value={d.city}>{d.city}</option>)}
              </select>

              <select value={newTrip.destination} onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                className="w-full border-2 rounded-lg px-4 py-2">
                <option value="">To</option>
                {destinations.filter(d => d.city !== newTrip.departure).map(d => 
                  <option key={d.id} value={d.city}>{d.city}</option>
                )}
              </select>

              <input type="date" value={newTrip.date} onChange={(e) => setNewTrip({...newTrip, date: e.target.value})}
                className="w-full border-2 rounded-lg px-4 py-2" />

              <div className="grid grid-cols-2 gap-4">
                <input type="time" value={newTrip.departureTime} 
                  onChange={(e) => setNewTrip({...newTrip, departureTime: e.target.value})}
                  className="w-full border-2 rounded-lg px-4 py-2" placeholder="Departure" />
                <input type="time" value={newTrip.arrivalTime}
                  onChange={(e) => setNewTrip({...newTrip, arrivalTime: e.target.value})}
                  className="w-full border-2 rounded-lg px-4 py-2" placeholder="Arrival" />
              </div>

              <Button onClick={handleAddTrip} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
                Create Trip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;