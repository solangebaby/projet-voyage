import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Armchair } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

interface SeatSelectorProps {
  totalSeats: number;
  occupiedSeats: string[];
  onSeatSelect: (seat: string) => void;
  selectedSeat: string[]; // ✅ tableau au lieu de string | null
}

const SeatSelector = ({ totalSeats, occupiedSeats, onSeatSelect, selectedSeat }: SeatSelectorProps) => {
  const { t } = useTranslation();
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  const generateSeats = () => {
    const seats: Array<{ id: string; position: 'left' | 'right' | 'aisle' }> = [];
    const rows = Math.ceil(totalSeats / 4);

    for (let row = 1; row <= rows; row++) {
      if ((row - 1) * 4 < totalSeats)     seats.push({ id: `A${row}`, position: 'left' });
      if ((row - 1) * 4 + 1 < totalSeats) seats.push({ id: `B${row}`, position: 'left' });
      seats.push({ id: `aisle-${row}`, position: 'aisle' });
      if ((row - 1) * 4 + 2 < totalSeats) seats.push({ id: `C${row}`, position: 'right' });
      if ((row - 1) * 4 + 3 < totalSeats) seats.push({ id: `D${row}`, position: 'right' });
    }
    return seats;
  };

  const rows = Math.ceil(totalSeats / 4);

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) {
      toast.error(t('errors.seatTaken'));
      return;
    }
    onSeatSelect(seatId);
    // toast uniquement si on sélectionne (pas si on désélectionne)
    if (!selectedSeat.includes(seatId)) {
      toast.success(t('booking.seatSelected', { seat: seatId }));
    }
  };

  const getSeatStatus = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeat.includes(seatId)) return 'selected'; // ✅ .includes() sur tableau
    return 'available';
  };

  const getSeatStyle = (status: string, isHovered: boolean) => {
    if (status === 'occupied')
      return 'bg-gray-200 cursor-not-allowed opacity-60 border-2 border-gray-300';
    if (status === 'selected')
      return 'bg-color2 text-white scale-110 shadow-xl shadow-color2/30 border-2 border-color2';
    if (isHovered)
      return 'bg-color1/20 border-2 border-color1 scale-105';
    return 'bg-white border-2 border-gray-200 hover:border-color1 shadow-sm';
  };

  return (
    <div className="w-full max-w-sm mx-auto">

      {/* Légende */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {[
          { style: 'bg-white border-2 border-gray-200', label: t('booking.available') },
          { style: 'bg-color2 border-2 border-color2', label: t('booking.selected') },
          { style: 'bg-gray-200 border-2 border-gray-300 opacity-60', label: t('booking.occupied') },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${item.style}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Avant du bus */}
      <div className="bg-color3 text-white text-center py-3 rounded-t-2xl mb-1 shadow-lg">
        <p className="font-black text-xs uppercase tracking-widest">🚌 {t('booking.frontBus')}</p>
      </div>

      {/* Plan des sièges */}
      <div className="bg-gray-50 p-5 rounded-b-2xl shadow-inner border border-gray-100">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const rowNumber = rowIndex + 1;
            return (
              <div key={rowNumber} className="flex justify-center items-center gap-2">

                {/* Gauche A, B */}
                <div className="flex gap-2">
                  {['A', 'B'].map((letter) => {
                    const seatId = `${letter}${rowNumber}`;
                    const seatExists = (rowNumber - 1) * 4 + (letter === 'A' ? 0 : 1) < totalSeats;
                    if (!seatExists) return <div key={seatId} className="w-11 h-11" />;

                    const status = getSeatStatus(seatId);
                    const isHovered = hoveredSeat === seatId;

                    return (
                      <button
                        key={seatId}
                        onClick={() => status !== 'occupied' && handleSeatClick(seatId)}
                        onMouseEnter={() => status !== 'occupied' && setHoveredSeat(seatId)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={status === 'occupied'}
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${getSeatStyle(status, isHovered)}`}
                      >
                        <Armchair size={16} weight="fill" className={status === 'selected' ? 'text-white' : status === 'occupied' ? 'text-gray-400' : 'text-color3'} />
                        <span className={`text-[9px] font-black mt-0.5 ${status === 'selected' ? 'text-white' : 'text-gray-500'}`}>{seatId}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Allée */}
                <div className="w-6 flex items-center justify-center">
                  <div className="w-px h-8 bg-gray-300 rounded" />
                </div>

                {/* Droite C, D */}
                <div className="flex gap-2">
                  {['C', 'D'].map((letter) => {
                    const seatId = `${letter}${rowNumber}`;
                    const seatExists = (rowNumber - 1) * 4 + (letter === 'C' ? 2 : 3) < totalSeats;
                    if (!seatExists) return <div key={seatId} className="w-11 h-11" />;

                    const status = getSeatStatus(seatId);
                    const isHovered = hoveredSeat === seatId;

                    return (
                      <button
                        key={seatId}
                        onClick={() => status !== 'occupied' && handleSeatClick(seatId)}
                        onMouseEnter={() => status !== 'occupied' && setHoveredSeat(seatId)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={status === 'occupied'}
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${getSeatStyle(status, isHovered)}`}
                      >
                        <Armchair size={16} weight="fill" className={status === 'selected' ? 'text-white' : status === 'occupied' ? 'text-gray-400' : 'text-color3'} />
                        <span className={`text-[9px] font-black mt-0.5 ${status === 'selected' ? 'text-white' : 'text-gray-500'}`}>{seatId}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Numéro de rangée */}
                <div className="w-6 text-[9px] text-gray-300 font-black text-center">{rowNumber}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sièges sélectionnés */}
      {selectedSeat.length > 0 && (
        <div className="mt-5 p-4 bg-color2/10 border-2 border-color2/20 rounded-2xl text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            {selectedSeat.length} {t('booking.seats')} {t('confirmation.selected')}
          </p>
          <p className="text-xl font-black text-color2">{selectedSeat.join(', ')}</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: t('booking.totalSeats'), value: totalSeats, color: 'text-color3' },
          { label: t('booking.occupied'), value: occupiedSeats.length, color: 'text-gray-400' },
          { label: t('booking.available'), value: totalSeats - occupiedSeats.length, color: 'text-color2' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-2xl py-3 px-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatSelector;