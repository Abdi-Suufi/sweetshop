import React from 'react';
import Spinner from '../components/Spinner';
import { PackageCheck, PackageX, Truck, CheckCircle2, CircleSlash } from 'lucide-react'; // For status icons

const AdminOrdersPage = ({ orders, isLoading, onUpdateStatus }) => {
  if (isLoading && orders.length === 0) return <Spinner />;

  const getStatusIconAndColor = (status) => {
    switch (status) {
      case 'placed':
        return { icon: <PackageCheck className="mr-2 text-blue-500" size={20} />, color: 'text-blue-700 bg-blue-100' };
      case 'processing':
        return { icon: <Truck className="mr-2 text-yellow-500" size={20} />, color: 'text-yellow-700 bg-yellow-100' };
      case 'shipped':
        return { icon: <Truck className="mr-2 text-green-500" size={20} />, color: 'text-green-700 bg-green-100' };
      case 'delivered':
        return { icon: <CheckCircle2 className="mr-2 text-purple-500" size={20} />, color: 'text-purple-700 bg-purple-100' };
      case 'cancelled':
        return { icon: <PackageX className="mr-2 text-red-500" size={20} />, color: 'text-red-700 bg-red-100' };
      default:
        return { icon: <CircleSlash className="mr-2 text-gray-500" size={20} />, color: 'text-gray-700 bg-gray-100' };
    }
  };


  return (
    <div className="p-2 sm:p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customer Orders</h2>
      {orders.length === 0 && !isLoading && (
        <p className="text-gray-600">No orders placed yet.</p>
      )}
      {orders.length > 0 && (
        <div className="space-y-6">
          {orders.map(order => {
            const { icon, color } = getStatusIconAndColor(order.status);
            return (
              <div key={order.id} className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 pb-3 border-b">
                  <div>
                    <h3 className="text-md sm:text-lg font-semibold text-pink-600">Order ID: <span className="font-normal text-gray-700">{order.id.substring(0,8)}...</span></h3>
                    <p className="text-xs sm:text-sm text-gray-500">User: {order.customerDetails?.userId?.substring(0,12) || order.userId?.substring(0,12) || 'N/A'}...</p>
                    <p className="text-xs sm:text-sm text-gray-500">Date: {order.orderDate?.toDate ? new Date(order.orderDate.toDate()).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                     <p className="text-lg sm:text-xl font-bold text-gray-800">${order.totalAmount.toFixed(2)}</p>
                     <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
                       {icon}
                       {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-1 text-sm">Items:</h4>
                  <ul className="list-disc list-inside pl-1 space-y-1 text-xs sm:text-sm text-gray-600">
                    {order.items.map((item, index) => (
                      <li key={item.sweetId + index}>{item.name} (x{item.quantity}) - ${item.price.toFixed(2)} each</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label htmlFor={`status-${order.id}`} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Update Status:</label>
                  <select 
                    id={`status-${order.id}`} 
                    value={order.status} 
                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                    className="block w-full sm:w-auto pl-3 pr-10 py-2 text-xs sm:text-sm border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 rounded-md shadow-sm"
                  >
                    <option value="placed">Placed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;