import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin } from '@phosphor-icons/react';

interface Agency {
  id: number;
  destination_id: number;
  agency_name: string;
  neighborhood: string;
  address?: string;
  phone?: string;
  is_main_station: boolean;
}

interface AgencySelectorProps {
  cityId: number | null;
  cityName: string;
  label: string;
  selectedAgency: Agency | null;
  onSelectAgency: (agency: Agency) => void;
}

const AgencySelector = ({ cityId, cityName, label, selectedAgency, onSelectAgency }: AgencySelectorProps) => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cityId) {
      fetchAgencies();
    } else {
      setAgencies([]);
    }
  }, [cityId]);

  const fetchAgencies = async () => {
    if (!cityId) return;
    
    console.log('🔍 Fetching agencies for city ID:', cityId);
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/agencies?destination_id=${cityId}`);
      console.log('✅ Agencies response:', response.data);
      
      if (response.data.success) {
        setAgencies(response.data.data);
        console.log('📍 Agencies set:', response.data.data);
        
        // Auto-select main station if available
        const mainStation = response.data.data.find((a: Agency) => a.is_main_station);
        if (mainStation && !selectedAgency) {
          console.log('🏢 Auto-selecting main station:', mainStation);
          onSelectAgency(mainStation);
        }
      } else {
        console.warn('⚠️ API returned success=false');
      }
    } catch (error) {
      console.error('❌ Error fetching agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!cityId) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-sm text-gray-500 text-center">
          Please select a city first
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500 text-center">Loading agencies...</p>
      </div>
    );
  }

  if (agencies.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800 text-center">
          No agencies found for {cityName}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label} - {cityName}
      </label>
      
      <div className="grid grid-cols-1 gap-3">
        {agencies.map((agency) => (
          <button
            key={agency.id}
            type="button"
            onClick={() => onSelectAgency(agency)}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
              selectedAgency?.id === agency.id
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-300 bg-white hover:border-blue-400'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                agency.is_main_station ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                <MapPin size={20} weight="fill" className="text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900">{agency.neighborhood}</h4>
                  {agency.is_main_station && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                      Main Station
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">{agency.agency_name}</p>
                
                {agency.address && (
                  <p className="text-xs text-gray-500 mt-1">{agency.address}</p>
                )}
                
                {agency.phone && (
                  <p className="text-xs text-blue-600 mt-1">📞 {agency.phone}</p>
                )}
              </div>
              
              {selectedAgency?.id === agency.id && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {selectedAgency && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-bold">Selected:</span> {selectedAgency.neighborhood} - {selectedAgency.agency_name}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgencySelector;
