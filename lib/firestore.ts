import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Service } from '@/types/database';

// Define interfaces for our data structures
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  condition: 'New' | 'Used' | 'Like New';
  location: string;
  imageUrl: string;
  seller: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  description: string;
  imageUrl: string;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Products CRUD operations
export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const getProducts = async (category?: string): Promise<Product[]> => {
  try {
    let q = query(
      collection(db, 'products'),
      where('isAvailable', '==', true),
      orderBy('createdAt', 'desc')
    );

    if (category) {
      q = query(
        collection(db, 'products'),
        where('category', '==', category),
        where('isAvailable', '==', true),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as Product[];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'products', productId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
      } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

// Service Providers CRUD operations
export const createServiceProvider = async (serviceData: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'services'), {
      ...serviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating service provider:', error);
    throw error;
  }
};

export const getServiceProviders = async (category?: string): Promise<Service[]> => {
  try {
    let q = query(
      collection(db, 'services'),
      where('isActive', '==', true),
      orderBy('provider.rating', 'desc')
    );

    if (category) {
      q = query(
        collection(db, 'services'),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('provider.rating', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        serviceId: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
      } as Service;
    });
  } catch (error) {
    console.error('Error getting service providers:', error);
    return [];
  }
};

export const getServiceProvider = async (serviceId: string): Promise<ServiceProvider | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'services', serviceId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
      } as ServiceProvider;
    }
    return null;
  } catch (error) {
    console.error('Error getting service provider:', error);
    return null;
  }
};

// Search functionality
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    // Note: This is a basic search. For production, consider using Algolia or similar
    const q = query(
      collection(db, 'products'),
      where('isAvailable', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as Product[];

    // Filter by search term (client-side filtering for now)
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const searchServiceProviders = async (searchTerm: string): Promise<Service[]> => {
  try {
    const q = query(
      collection(db, 'services'),
      where('isActive', '==', true),
      orderBy('provider.rating', 'desc'),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const services = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        serviceId: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
      } as Service;
    });

    // Filter by search term
    return services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching service providers:', error);
    return [];
  }
};

// Add sample data function for testing
export const addSampleData = async () => {
  try {
    // Sample service providers
    const sampleServices = [
      {
        name: 'Mariama Tailoring',
        category: 'Tailor',
        location: 'Serekunda',
        provider: {
          rating: 4.8,
          totalReviews: 127
        },
        description: 'Expert in traditional Gambian attire and modern fashion designs. Quality craftsmanship guaranteed.',
        imageUrl: 'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        isActive: true
      },
      {
        name: 'Lamin Carpentry Works',
        category: 'Carpenter',
        location: 'Bakau',
        provider: {
          rating: 4.6,
          totalReviews: 89
        },
        description: 'Custom furniture and home renovations. Over 15 years of experience in woodworking.',
        imageUrl: 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        isActive: true
      },
      {
        name: 'Fatou Hair & Beauty',
        category: 'Hair Stylist',
        location: 'Banjul',
        provider: {
          rating: 4.9,
          totalReviews: 203
        },
        description: 'Professional hair styling, braiding, and beauty treatments. Modern salon with skilled staff.',
        imageUrl: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        isActive: true
      },
      {
        name: 'Modou Electronics Repair',
        category: 'Electronics Repair',
        location: 'Kanifing',
        provider: {
          rating: 4.4,
          totalReviews: 156
        },
        description: 'Fast and reliable repair services for phones, computers, and home appliances.',
        imageUrl: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        isActive: true
      },
      {
        name: 'Awa Catering Services',
        category: 'Catering',
        location: 'Serrekunda',
        provider: {
          rating: 4.7,
          totalReviews: 94
        },
        description: 'Authentic Gambian cuisine for events and celebrations. Fresh ingredients, traditional recipes.',
        imageUrl: 'https://images.pexels.com/photos/1346086/pexels-photo-1346086.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        isActive: true
      },
      {
        name: 'Bakary Plumbing Solutions',
        category: 'Plumber',
        location: 'Brikama',
        provider: {
          rating: 4.5,
          totalReviews: 72
        },
        description: 'Professional plumbing installation and repair services. Available for emergency calls.',
        imageUrl: 'https://images.pexels.com/photos/834892/pexels-photo-834892.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        isActive: true
      }
    ];

    // Sample products
    const sampleProducts = [
      {
        name: 'Traditional Gambian Dress',
        description: 'Beautiful handmade traditional Gambian dress with intricate embroidery. Perfect for special occasions.',
        price: 2500,
        category: 'Clothing',
        condition: 'New' as const,
        location: 'Serekunda',
        imageUrl: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        seller: 'Mariama Jallow',
        isAvailable: true
      },
      {
        name: 'Wooden Dining Table',
        description: 'Solid wood dining table for 6 people. Excellent craftsmanship and durable construction.',
        price: 15000,
        category: 'Furniture',
        condition: 'Like New' as const,
        location: 'Bakau',
        imageUrl: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        seller: 'Lamin Ceesay',
        isAvailable: true
      },
      {
        name: 'Samsung Galaxy Phone',
        description: 'Samsung Galaxy smartphone in excellent condition. Includes charger and protective case.',
        price: 8500,
        category: 'Electronics',
        condition: 'Used' as const,
        location: 'Banjul',
        imageUrl: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        seller: 'Fatou Drammeh',
        isAvailable: true
      },
      {
        name: 'Motorcycle Honda',
        description: 'Honda motorcycle in good working condition. Perfect for city transportation.',
        price: 45000,
        category: 'Vehicles',
        condition: 'Used' as const,
        location: 'Kanifing',
        imageUrl: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        seller: 'Modou Bah',
        isAvailable: true
      },
      {
        name: 'Fresh Vegetables Bundle',
        description: 'Fresh locally grown vegetables including tomatoes, onions, and peppers.',
        price: 150,
        category: 'Food',
        condition: 'New' as const,
        location: 'Serrekunda Market',
        imageUrl: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
        seller: 'Awa Touray',
        isAvailable: true
      }
    ];

    // Add sample services
    for (const service of sampleServices) {
      await addDoc(collection(db, 'services'), {
        ...service,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Add sample products
    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
    throw error;
  }
};