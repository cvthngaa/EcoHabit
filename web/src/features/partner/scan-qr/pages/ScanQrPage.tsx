import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useGetLocations } from '../../locations/services/use-get-locations';
import { useScanUserQr } from '../../transactions/services/use-scan-user-qr';
import { QrCode, CheckCircle2, MapPin, Gift, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ScanQrPage: React.FC = () => {
  const { data: locations = [], isLoading: isLoadingLocations } = useGetLocations();
  const { mutate: scanQr } = useScanUserQr();

  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [scannedData, setScannedData] = useState<any>(null);
  const [isScannerActive, setIsScannerActive] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  
  // Create refs to capture latest state for the scanner callback
  const locationIdRef = useRef<string>('');
  const pointsRef = useRef<number>(10);

  useEffect(() => {
    locationIdRef.current = selectedLocationId;
  }, [selectedLocationId]);

  useEffect(() => {
    const storedPoints = localStorage.getItem('partner_default_points');
    if (storedPoints) {
      pointsRef.current = parseInt(storedPoints, 10) || 10;
    }
  }, []);

  useEffect(() => {
    // Select first location by default
    if (locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  useEffect(() => {
    if (!isScannerActive) return;

    let html5QrcodeScanner: Html5QrcodeScanner | null = null;
    let isMounted = true;

    // Small delay to ensure DOM is fully ready and any previous clear() is complete
    const timeout = setTimeout(() => {
      if (!isMounted) return;

      try {
        html5QrcodeScanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
          },
          false
        );

        scannerRef.current = html5QrcodeScanner;

        html5QrcodeScanner.render(
          (decodedText) => {
            try {
              const decoded: any = jwtDecode(decodedText);
              if (decoded.type === 'PERSONAL_QR') {
                setIsScannerActive(false);
                if (scannerRef.current) {
                  scannerRef.current.pause(true); // pause scanning
                }
                
                const locId = locationIdRef.current;
                if (!locId) {
                   toast.error('Vui lòng chọn trạm thu gom trước khi quét!');
                   setIsScannerActive(true);
                   scannerRef.current?.resume();
                   return;
                }
                
                setScannedData(decoded);
                
                // Auto add points
                const pointsToAward = pointsRef.current;
                
                scanQr(
                  { qrToken: decodedText, locationId: locId, pointsAwarded: pointsToAward },
                  {
                    onSuccess: () => {
                      toast.success(`Đã tự động cộng ${pointsToAward} điểm cho người dùng!`);
                      setSuccessMessage(`Đã cộng ${pointsToAward} điểm thành công!`);
                      if (scannerRef.current) {
                        scannerRef.current.clear();
                      }
                    },
                    onError: () => {
                      toast.error('Có lỗi xảy ra khi cộng điểm. Có thể mã QR đã hết hạn hoặc không đúng trạm.');
                      setIsScannerActive(true);
                      setScannedData(null);
                      if (scannerRef.current) {
                        scannerRef.current.resume();
                      }
                    }
                  }
                );

              } else {
                toast.error('Mã QR không hợp lệ. Vui lòng quét mã QR cá nhân của người dùng.');
              }
            } catch (error) {
              toast.error('Mã QR không đúng định dạng JWT.');
            }
          },
          (_error) => {
            // ignore errors during scanning
          }
        );
      } catch (err) {
        console.error("Failed to initialize scanner", err);
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(e => console.log('Failed to clear scanner', e));
      }
    };
  }, [isScannerActive]);

  const handleScanAgain = () => {
    setScannedData(null);
    setSuccessMessage('');
    setIsScannerActive(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quét mã QR Check-in</h1>
        <p className="text-sm text-slate-500">
          Hệ thống sẽ tự động nhận diện mã QR và cộng điểm thưởng theo cài đặt của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <QrCode className="w-4.5 h-4.5 text-emerald-600" />
              Khu vực quét mã camera
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <Gift className="w-3.5 h-3.5 text-emerald-500" />
              Mặc định: <span className="text-emerald-600 font-bold">{pointsRef.current} điểm</span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50 relative min-h-[400px]">
            {isScannerActive ? (
              <div className="w-full max-w-md mx-auto">
                <div id="qr-reader" className="w-full overflow-hidden rounded-xl border-2 border-emerald-500/20 shadow-inner bg-black/5 [&>div]:border-none [&>div>video]:rounded-xl"></div>
                <p className="text-center text-xs text-slate-500 mt-4 animate-pulse">Đang tìm kiếm mã QR trong khung hình...</p>
              </div>
            ) : successMessage ? (
              <div className="flex flex-col items-center justify-center p-8 bg-emerald-50/50 rounded-2xl border border-emerald-200 w-full max-w-md mx-auto transform transition-all shadow-inner">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-sm animate-bounce-short">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Thành công!</h3>
                <p className="text-emerald-700 font-medium mb-2">{successMessage}</p>
                <p className="text-xs text-slate-500 mb-6 bg-white px-3 py-1 rounded-full border border-slate-200">ID: {scannedData?.sub}</p>
                
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 active:scale-95 transition-all"
                >
                  <RotateCw className="w-4 h-4" />
                  Tiếp tục quét
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-100/50 rounded-2xl border border-dashed border-slate-300 w-full max-w-md mx-auto">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-slate-600">Đang xử lý giao dịch...</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-blue-50/30">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-blue-600" />
                Trạm thu gom hiện tại
              </h2>
            </div>
            <div className="p-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Chọn trạm thu gom đang làm việc
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm p-3.5 transition-all outline-none cursor-pointer appearance-none"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                disabled={isLoadingLocations || !isScannerActive}
              >
                <option value="" disabled>-- Chọn trạm thu gom --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-3 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                Thông tin này sẽ được lưu vào lịch sử giao dịch của người dùng để tính điểm và xếp hạng.
              </p>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-2xl shadow-lg overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
              <QrCode className="w-40 h-40" />
            </div>
            <div className="p-6 relative z-10">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                Hướng dẫn quét
              </h3>
              <ul className="text-sm text-slate-300 space-y-3 mt-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-emerald-500/20">1</div>
                  <span className="pt-0.5 leading-relaxed">Chọn đúng trạm thu gom bạn đang túc trực ở biểu mẫu trên.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-emerald-500/20">2</div>
                  <span className="pt-0.5 leading-relaxed">Yêu cầu người dùng mở ứng dụng và hiển thị <strong className="text-white">mã QR cá nhân</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-emerald-500/20">3</div>
                  <span className="pt-0.5 leading-relaxed">Đưa mã QR vào khung hình camera, hệ thống sẽ tự động xác nhận và cộng điểm.</span>
                </li>
              </ul>
              <div className="mt-8 pt-5 border-t border-slate-700/50 flex justify-between items-center text-xs">
                <span className="text-slate-400">Điểm mặc định chưa đúng?</span>
                <Link to="/partner/settings" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  Đổi trong Cài đặt <RotateCw className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
