const DashboardContent:  React.FC = () =>{
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    useEffect(() => { fetchDashboardStats(); }, []);
    const fetchDashboardStats = async () => {
        try {
        const token = authService.getToken();
        const response = await axios.get('http://localhost:8000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
            setStats(response.data.data);
        }
        } catch (error) {
        console.error("Erreur de chargement:", error);
        toast.error('Erreur lors du chargement des données');
        } finally {
        setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        toast.success('Déconnexion réussie');
        navigate('/login');
    };

    if (loading) {
        return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-poppins">
            <div className="text-center animate-scale-up">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4" />
            <p className="text-dark text-lg font-medium">Chargement du tableau de bord...</p>
            </div>
        </div>
        );
    }
    return (
        <>
            <h2>test layout 1</h2>
        </>
    );
}


export default DashboardContent;