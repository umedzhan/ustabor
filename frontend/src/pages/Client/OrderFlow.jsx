import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Banknote, CalendarClock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import WebApp from '@twa-dev/sdk';

const OrderFlow = () => {
    const { id } = useParams(); // Vendor ID
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    const [bookingDetails, setBookingDetails] = useState({
        serviceName: '',
        servicePrice: 0,
        appointmentDate: '',
        appointmentTime: '',
        address: '',
        paymentMethod: 'cash'
    });
    const [step, setStep] = useState(1);
    const [orderLoading, setOrderLoading] = useState(false);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/vendors/${id}`);
                setVendor(data);
                if (data.services && data.services.length > 0) {
                    setBookingDetails(prev => ({
                        ...prev,
                        serviceName: data.services[0].name,
                        servicePrice: data.services[0].price
                    }));
                }
            } catch (error) {
                console.error("Error fetching vendor", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendor();
    }, [id]);

    const handleConfirmOrder = async () => {
        setOrderLoading(true);
        try {
            // Merge date and time
            const appointmentDateTime = new Date(`${bookingDetails.appointmentDate}T${bookingDetails.appointmentTime}`);

            await axios.post(`${API_URL}/orders`, {
                vendorId: id,
                categoryId: vendor.category._id,
                serviceDetails: {
                    name: bookingDetails.serviceName,
                    price: bookingDetails.servicePrice
                },
                price: bookingDetails.servicePrice,
                paymentMethod: bookingDetails.paymentMethod,
                location: {
                    address: bookingDetails.address
                },
                appointmentTime: appointmentDateTime
            });

            // Notify via Telegram SDK if supported
            if (WebApp.initData) {
                WebApp.HapticFeedback.notificationOccurred('success');
            }

            setStep(3); // Success Screen
        } catch (error) {
            console.error("Error creating order", error);
            if (WebApp.initData) {
                WebApp.HapticFeedback.notificationOccurred('error');
            }
            alert("Buyurtma yaratishda xatolik yuz berdi");
        } finally {
            setOrderLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="w-8 h-8 border-2 border-primary rounded-full animate-spin border-t-transparent"></div></div>;
    if (!vendor) return <div className="p-6 text-center">Usta topilmadi</div>;

    return (
        <div className="bg-white min-h-screen flex flex-col pb-6">
            <div className="flex items-center p-4 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 ml-2">Xizmat buyurtma qilish</h1>
            </div>

            {step === 1 && (
                <div className="p-5 flex-1 overflow-y-auto">
                    <h2 className="font-bold text-gray-800 mb-4">Xizmat turini tanlang</h2>
                    <div className="flex flex-col gap-3 mb-6">
                        {vendor.services?.map((svc, idx) => (
                            <label key={idx} className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${bookingDetails.serviceName === svc.name ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${bookingDetails.serviceName === svc.name ? 'border-primary' : 'border-gray-300'}`}>
                                        {bookingDetails.serviceName === svc.name && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm">{svc.name}</span>
                                </div>
                                <span className="font-bold text-primary text-sm">{svc.price.toLocaleString()} so'm</span>
                                <input
                                    type="radio"
                                    name="service"
                                    className="hidden"
                                    checked={bookingDetails.serviceName === svc.name}
                                    onChange={() => setBookingDetails({ ...bookingDetails, serviceName: svc.name, servicePrice: svc.price })}
                                />
                            </label>
                        ))}
                    </div>

                    <h2 className="font-bold text-gray-800 mb-4">Vaqt va manzil</h2>
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <input
                                type="date"
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:border-primary/50"
                                value={bookingDetails.appointmentDate}
                                onChange={e => setBookingDetails({ ...bookingDetails, appointmentDate: e.target.value })}
                            />
                            <input
                                type="time"
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:border-primary/50"
                                value={bookingDetails.appointmentTime}
                                onChange={e => setBookingDetails({ ...bookingDetails, appointmentTime: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Manzilni kiriting..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pl-10 text-sm outline-none focus:border-primary/50"
                                value={bookingDetails.address}
                                onChange={e => setBookingDetails({ ...bookingDetails, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        disabled={!bookingDetails.appointmentDate || !bookingDetails.appointmentTime || !bookingDetails.address}
                        className="w-full bg-primary text-white font-bold py-4 rounded-full mt-8 disabled:opacity-50 transition-colors hover:bg-primary-hover shadow-lg shadow-primary/30"
                    >
                        Davom etish
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="p-5 flex-1 flex flex-col items-start w-full">
                    <h2 className="font-bold text-gray-800 mb-4">To'lov turini tanlang</h2>
                    <div className="flex flex-col gap-3 mb-6 w-full">
                        <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer ${bookingDetails.paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}`}>
                            <Banknote className={bookingDetails.paymentMethod === 'cash' ? 'text-primary' : 'text-gray-400'} size={24} />
                            <div className="flex-1 text-left">
                                <h3 className="font-medium text-gray-800 text-sm">Naqd pul</h3>
                                <p className="text-xs text-gray-500 mt-1">Ko'rishgandan so'ng</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${bookingDetails.paymentMethod === 'cash' ? 'border-primary' : 'border-gray-300'}`}>
                                {bookingDetails.paymentMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <input type="radio" className="hidden" onChange={() => setBookingDetails({ ...bookingDetails, paymentMethod: 'cash' })} checked={bookingDetails.paymentMethod === 'cash'} />
                        </label>

                        <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer ${bookingDetails.paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}`}>
                            <CreditCard className={bookingDetails.paymentMethod === 'card' ? 'text-primary' : 'text-gray-400'} size={24} />
                            <div className="flex-1 text-left">
                                <h3 className="font-medium text-gray-800 text-sm">Plastik karta</h3>
                                <p className="text-xs text-gray-500 mt-1">Buyurtmani tasdiqlash uchun</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${bookingDetails.paymentMethod === 'card' ? 'border-primary' : 'border-gray-300'}`}>
                                {bookingDetails.paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <input type="radio" className="hidden" onChange={() => setBookingDetails({ ...bookingDetails, paymentMethod: 'card' })} checked={bookingDetails.paymentMethod === 'card'} />
                        </label>
                    </div>

                    <div className="mt-auto bg-gray-50 p-4 rounded-2xl flex justify-between items-center mb-6 w-full">
                        <span className="text-gray-600 font-medium text-sm">Jami to'lov:</span>
                        <span className="font-bold text-xl text-primary">{bookingDetails.servicePrice.toLocaleString()} so'm</span>
                    </div>

                    <button
                        onClick={handleConfirmOrder}
                        disabled={orderLoading}
                        className="w-full bg-primary text-white font-bold py-4 rounded-full flex justify-center items-center gap-2 disabled:opacity-50 transition-colors hover:bg-primary-hover shadow-lg shadow-primary/30"
                    >
                        {orderLoading ? <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div> : 'Buyurtmani tasdiqlash'}
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Buyurtma qabul qilindi!</h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Sizning buyurtmangiz ustaga yuborildi. Tez orada usta siz bilan bog'lanadi.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-100 text-gray-800 font-bold py-4 rounded-full transition-colors hover:bg-gray-200"
                    >
                        Asosiy sahifaga qaytish
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderFlow;
