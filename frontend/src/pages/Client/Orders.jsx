import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, CheckCircle, Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import ReviewModal from '../../components/ReviewModal';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'completed': return 'bg-green-50 text-green-600 border-green-100';
            case 'evaluated': return 'bg-primary/5 text-primary border-primary/10';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Kutilmoqda';
            case 'accepted': return 'Qabul qilingan';
            case 'completed': return 'Bajarildi';
            case 'evaluated': return 'Baholangan';
            case 'cancelled': return 'Bekor qilingan';
            default: return status;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <div className="ml-2">
                    <h1 className="text-lg font-bold text-gray-900">Mening buyurtmalarim</h1>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Buyurtmalar tarixi</p>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-4">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white h-40 rounded-3xl animate-pulse p-5">
                            <div className="h-4 w-24 bg-gray-100 rounded mb-1"></div>
                            <div className="h-6 w-48 bg-gray-100 rounded mb-4"></div>
                            <div className="h-12 w-full bg-gray-50 rounded-2xl"></div>
                        </div>
                    ))
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Clock size={40} />
                        </div>
                        <h3 className="text-gray-900 font-bold">Hozircha buyurtmalar yo'q</h3>
                        <p className="text-gray-400 text-sm mt-1 max-w-[200px]">Xizmatlardan foydalanishni boshlang va ular bu yerda ko'rinadi</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order._id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block mb-2 ${getStatusStyles(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </div>
                                    <h3 className="font-bold text-gray-900 leading-tight">{order.serviceDetails?.name}</h3>
                                    <p className="text-xs text-primary font-bold mt-0.5">{order.price?.toLocaleString()} so'm</p>
                                </div>
                                <button className="p-2 bg-gray-50 rounded-full text-gray-400">
                                    <MessageSquare size={16} />
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-2 mb-4">
                                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                                    <Clock size={14} className="text-gray-400" />
                                    <span>{new Date(order.appointmentTime).toLocaleString('uz-UZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span className="truncate">{order.location?.address}</span>
                                </div>
                            </div>

                            {order.status === 'completed' && (
                                <button
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setShowReviewModal(true);
                                    }}
                                    className="w-full bg-primary text-white text-xs font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                                >
                                    <Star size={14} fill="currentColor" />
                                    Fikr qoldirish
                                </button>
                            )}

                            {order.status === 'evaluated' && (
                                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} fill={i < order.review?.rating ? "#4ade80" : "none"} stroke={i < order.review?.rating ? "#4ade80" : "#d1d5db"} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-500 italic truncate italic">"{order.review?.comment}"</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <ReviewModal
                isOpen={showReviewModal}
                order={selectedOrder}
                onClose={() => setShowReviewModal(false)}
                onReviewSubmitted={() => {
                    fetchOrders();
                }}
            />
        </div>
    );
};

export default Orders;
