import React, { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const ReviewModal = ({ order, isOpen, onClose, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/orders/${order._id}/review`, {
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onReviewSubmitted();
            onClose();
        } catch (error) {
            console.error("Review submission error:", error);
            alert("Fikr yuborishda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl animate-slide-up overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Xizmatni baholang</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <Send className="text-primary" size={32} />
                    </div>

                    <h4 className="font-bold text-gray-800 text-lg mb-1">{order?.serviceDetails?.name}</h4>
                    <p className="text-gray-500 text-sm mb-8">Ustaday xizmatidan mamnunmisiz?</p>

                    {/* Star Rating */}
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`transform transition-all duration-200 ${(hover || rating) >= star ? 'scale-110 shadow-lg shadow-amber-400/20' : 'scale-100 grayscale opacity-30'
                                    }`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    size={40}
                                    fill={(hover || rating) >= star ? '#fbbf24' : 'none'}
                                    stroke={(hover || rating) >= star ? '#fbbf24' : '#9ca3af'}
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Comment Area */}
                    <div className="w-full text-left">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block flex items-center gap-2">
                            <MessageSquare size={14} /> Izoh qoldiring
                        </label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none h-32"
                            placeholder="Xizmat qanday bo'ldi? Maslahatlaringiz bormi?..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl mt-8 flex justify-center items-center gap-2 shadow-xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                        ) : (
                            "Fikrni yuborish"
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        className="text-gray-400 text-sm font-medium mt-4 hover:text-gray-600"
                    >
                        Keyinroq
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
