import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Armchair } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

interface SeatSelectorProps {
  totalSeats: number;
  occupiedSeats: string[];
  onSeatSelect: (seat: string) => void;
  selectedSeat: string | null;
}

const SeatSelector = ({ totalSeats, occupiedSeats, onSeatSelect, selectedSeat }: SeatSelectorProps) => {
  const { t } = useTranslation();
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Generate seat layout (4 seats per row: A-B | Aisle | C-D)
  const generateSeats = () => {
    const seats: Array<{ id: string; position: 'left' | 'right' | 'aisle' }> = [];
    const rows = Math.ceil(totalSeats / 4);

    for (let row = 1; row <= rows; row++) {
      // Left side (2 seats)
      if ((row - 1) * 4 < totalSeats) {
        seats.push({ id: `A${row}`, position: 'left' });
      }
      if ((row - 1) * 4 + 1 < totalSeats) {
        seats.push({ id: `B${row}`, position: 'left' });
      }

      // Aisle
      seats.push({ id: `aisle-${row}`, position: 'aisle' });

      // Right side (2 seats)
      if ((row - 1) * 4 + 2 < totalSeats) {
        seats.push({ id: `C${row}`, position: 'right' });
      }
      if ((row - 1) * 4 + 3 < totalSeats) {
        seats.push({ id: `D${row}`, position: 'right' });
      }
    }

    return seats;
  };

  const seats = generateSeats();
  const rows = Math.ceil(totalSeats / 4);

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) {
      toast.error(t('booking.seatOccupied'));
      return;
    }

    onSeatSelect(seatId);
    toast.success(t('booking.seatSelected', { seat: seatId }));
  };

  const getSeatStatus = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeat === seatId) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string, isHovered: boolean) => {
    if (status === 'occupied') return 'bg-red-500 cursor-not-allowed';
    if (status === 'selected') return 'bg-green-500 text-white scale-110';
    if (isHovered) return 'bg-blue-300 scale-105';
    return 'bg-gray-200 hover:bg-blue-200';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Legend */}
      <div className="flex justify-center gap-6 mb-8 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
            <Armchair size={18} />
          </div>
          <span className="text-sm text-gray-600">{t('booking.available')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Armchair size={18} className="text-white" />
          </div>
          <span className="text-sm text-gray-600">{t('booking.selected')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <Armchair size={18} className="text-white" />
          </div>
          <span className="text-sm text-gray-600">{t('booking.occupied')}</span>
        </div>
      </div>

      {/* Bus Front */}
      <div className="bg-gray-800 text-white text-center py-3 rounded-t-3xl mb-4">
        <p className="font-semibold">🚗 {t('booking.selectSeat')}</p>
      </div>

      {/* Seat Map */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 p-6 rounded-b-3xl shadow-lg">
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const rowNumber = rowIndex + 1;
            return (
              <div key={rowNumber} className="flex justify-center items-center gap-2">
                {/* Left side seats (A, B) */}
                <div className="flex gap-2">
                  {['A', 'B'].map((letter) => {
                    const seatId = `${letter}${rowNumber}`;
                    const seatExists = (rowNumber - 1) * 4 + (letter === 'A' ? 0 : 1) < totalSeats;
                    
                    if (!seatExists) {
                      return <div key={seatId} className="w-12 h-12" />;
                    }

                    const status = getSeatStatus(seatId);
                    const isHovered = hoveredSeat === seatId;
                    const isDisabled = status === 'occupied';

                    return (
                      <button
                        key={seatId}
                        onClick={() => !isDisabled && handleSeatClick(seatId)}
                        onMouseEnter={() => !isDisabled && setHoveredSeat(seatId)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={isDisabled}
                        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${getSeatColor(
                          status,
                          isHovered
                        )}`}
                      >
                        <Armchair size={20} weight="fill" className={status === 'occupied' ? 'text-white' : ''} />
                        <span className="text-xs mt-0.5 font-semibold">{seatId}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-12 h-12 flex items-center justify-center">
                  <div className="w-1 h-full bg-gray-400 rounded"></div>
                </div>

                {/* Right side seats (C, D) */}
                <div className="flex gap-2">
                  {['C', 'D'].map((letter) => {
                    const seatId = `${letter}${rowNumber}`;
                    const seatExists = (rowNumber - 1) * 4 + (letter === 'C' ? 2 : 3) < totalSeats;
                    
                    if (!seatExists) {
                      return <div key={seatId} className="w-12 h-12" />;
                    }

                    const status = getSeatStatus(seatId);
                    const isHovered = hoveredSeat === seatId;
                    const isDisabled = status === 'occupied';

                    return (
                      <button
                        key={seatId}
                        onClick={() => !isDisabled && handleSeatClick(seatId)}
                        onMouseEnter={() => !isDisabled && setHoveredSeat(seatId)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={isDisabled}
                        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${getSeatColor(
                          status,
                          isHovered
                        )}`}
                      >
                        <Armchair size={20} weight="fill" className={status === 'occupied' ? 'text-white' : ''} />
                        <span className="text-xs mt-0.5 font-semibold">{seatId}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Row number */}
                <div className="w-8 text-sm text-gray-500 text-center font-semibold">{rowNumber}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Info */}
      {selectedSeat && (
        <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg text-center">
          <p className="text-green-800 font-semibold">
            Selected Seat: <span className="text-2xl">{selectedSeat}</span>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 flex justify-around text-center text-sm">
        <div>
          <p className="font-semibold text-gray-700">{t('booking.totalSeats')}</p>
          <p className="text-2xl font-bold text-gray-900">{totalSeats}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">{t('booking.occupied')}</p>
          <p className="text-2xl font-bold text-red-600">{occupiedSeats.length}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">{t('booking.availableSeats')}</p>
          <p className="text-2xl font-bold text-green-600">{totalSeats - occupiedSeats.length}</p>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
