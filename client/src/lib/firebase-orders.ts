
import { db } from './firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';

export interface FirebaseOrder {
  id?: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: string;
    quantity: number;
  }>;
  totalAmount: string;
  deliveryFee: string;
  deliveryType: 'pickup' | 'delivery';
  location?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  notes?: string;
  preferredTime?: string;
  status: 'pending' | 'confirmed' | 'refused' | 'delivered';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const ORDERS_COLLECTION = 'orders';

export const createFirebaseOrder = async (orderData: Omit<FirebaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('🔵 محاولة إنشاء طلب في Firebase...', orderData);
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ تم إنشاء الطلب بنجاح في Firebase! ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء طلب Firebase:', error);
    throw error;
  }
};

export const updateFirebaseOrderStatus = async (orderId: string, status: FirebaseOrder['status']) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const subscribeToOrders = (
  callback: (orders: FirebaseOrder[]) => void,
  statusFilter?: FirebaseOrder['status']
) => {
  let q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  if (statusFilter) {
    q = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    const orders: FirebaseOrder[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as FirebaseOrder);
    });
    callback(orders);
  });
};
