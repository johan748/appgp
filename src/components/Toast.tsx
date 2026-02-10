import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={20} />;
            case 'error': return <XCircle className="text-red-500" size={20} />;
            case 'warning': return <AlertCircle className="text-yellow-500" size={20} />;
            case 'info': return <Info className="text-blue-500" size={20} />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200';
            case 'error': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'info': return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getBgColor()} border rounded-lg p-4 shadow-lg transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
        >
            <div className="flex items-start space-x-3">
                {getIcon()}
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{message}</p>
                </div>
                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;

export { ToastType };
