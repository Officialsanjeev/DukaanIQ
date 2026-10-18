import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Business,
  StoreLocation,
  Product,
  CartItem,
  Sale,
  Supplier,
  PurchaseOrder,
  Customer,
  ShiftRecord,
  StockMovement,
  TenderPayment,
  DynamicPricingSuggestion,
  DemandForecastItem,
  CopilotMessage,
  BulkProductImportItem,
  BulkImportResult,
  CriticalInventoryAlert,
  UserAccount,
} from '../types';
import {
  evaluateCriticalStockAlerts,
  CriticalAlertsSummary,
  ThresholdEvaluationOptions,
} from '../utils/inventoryThresholds';
import {
  SEED_BUSINESSES,
  SEED_PRODUCTS,
  SEED_SUPPLIERS,
  SEED_CUSTOMERS,
  SEED_PURCHASE_ORDERS,
  INITIAL_SHIFTS,
  INITIAL_STOCK_MOVEMENTS,
} from '../data/seedData';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  doc,
  setDoc,
  getDoc,
  testFirestoreConnection,
} from '../lib/firebase';

export function formatFirebaseAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please verify your details.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is not enabled in Firebase Console. You can tap "Try Demo" or Google sign-in to test right now.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a few minutes and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    default:
      return err?.message || 'Authentication failed. Please try again.';
  }
}

export const SEED_USERS: UserAccount[] = [
  {
    id: 'user-owner',
    name: 'Sanjeev Singh',
    email: 'officialsanjeevsingh11@gmail.com',
    role: 'owner',
    businessId: 'biz-apex',
    storeLocationId: 'loc-delhi',
    title: 'Store Owner & Retail Director',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-manager',
    name: 'Anita Deshmukh',
    email: 'anita.deshmukh@apextechretail.in',
    role: 'manager',
    businessId: 'biz-apex',
    storeLocationId: 'loc-delhi',
    title: 'Store Operations Manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-cashier',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@apextechretail.in',
    role: 'cashier',
    businessId: 'biz-apex',
    storeLocationId: 'loc-delhi',
    title: 'Head Checkout Cashier',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
];

interface AppContextType {
  // Auth State
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password?: string, role?: 'owner' | 'manager' | 'cashier') => Promise<boolean>;
  signup: (name: string, email: string, password?: string, businessName?: string, role?: 'owner' | 'manager' | 'cashier') => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithDemo: (role?: 'owner' | 'manager' | 'cashier') => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot_password';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot_password') => void;
  closeAuthModal: () => void;

  // State
  businesses: Business[];
  currentBusiness: Business;
  currentLocation: StoreLocation;
  products: Product[];
  cart: CartItem[];
  heldCarts: { id: string; customerName?: string; items: CartItem[]; timestamp: string; total: number }[];
  selectedCustomer: Customer | null;
  customers: Customer[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  sales: Sale[];
  stockMovements: StockMovement[];
  currentShift: ShiftRecord | null;
  shiftsHistory: ShiftRecord[];
  isOffline: boolean;
  offlineQueue: Sale[];
  activeView: string;

  // Actions
  setActiveView: (view: string) => void;
  setCurrentBusiness: (biz: Business) => void;
  setCurrentLocation: (loc: StoreLocation) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  setCartItemDiscount: (productId: string, discountPercent: number) => void;
  clearCart: () => void;
  holdCurrentCart: (label?: string) => void;
  resumeHeldCart: (cartId: string) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  finalizeSale: (payments: TenderPayment[]) => Promise<Sale>;
  adjustStock: (productId: string, delta: number, reason: string) => void;
  transferStock: (productId: string, fromLocId: string, toLocId: string, qty: number) => boolean;
  createPurchaseOrderDraft: (supplierId: string, items: { productId: string; qty: number; unitCost: number }[]) => string;
  receivePurchaseOrder: (poId: string, receivedMap: { [productId: string]: number }) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  openShift: (openingFloat: number) => void;
  closeShift: (declaredCash: number, notes?: string) => void;
  toggleOfflineMode: () => void;
  syncOfflineQueue: () => void;
  calculateCartTotals: () => {
    subtotal: number;
    discountTotal: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    taxTotal: number;
    grandTotal: number;
    roundedTotal: number;
    roundingDelta: number;
  };
  getDemandForecasts: () => DemandForecastItem[];
  addNewCustomer: (customerData: { name: string; phone: string; email?: string; address?: string }) => Customer;
  processReturnProduct: (productId: string, quantity: number, refundAmount: number, reason: string, customerName?: string) => boolean;
  bulkImportProducts: (
    items: BulkProductImportItem[],
    targetLocationId: string,
    mode?: 'replace' | 'adjust' | 'metadata_only'
  ) => BulkImportResult;
  getCriticalStockAlerts: (options?: ThresholdEvaluationOptions) => CriticalAlertsSummary;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password'>('login');

  const [businesses] = useState<Business[]>(SEED_BUSINESSES);
  const [currentBusiness, setCurrentBusiness] = useState<Business>(SEED_BUSINESSES[0]);
  const [currentLocation, setCurrentLocation] = useState<StoreLocation>(SEED_BUSINESSES[0].locations[0]);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<{ id: string; customerName?: string; items: CartItem[]; timestamp: string; total: number }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(SEED_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(SEED_PURCHASE_ORDERS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [currentShift, setCurrentShift] = useState<ShiftRecord | null>(INITIAL_SHIFTS[0]);
  const [shiftsHistory, setShiftsHistory] = useState<ShiftRecord[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<Sale[]>([]);
  const [activeView, setActiveView] = useState<string>('home'); // 'home' = public landing page, or in-app view

  // Test Firestore connection
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Change location when business changes
  useEffect(() => {
    if (currentBusiness.locations.length > 0) {
      setCurrentLocation(currentBusiness.locations[0]);
    }
  }, [currentBusiness]);

  // Sync Firebase Auth state across app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser({
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Retailer',
              email: fbUser.email || '',
              role: data.role || 'owner',
              businessId: data.businessId || currentBusiness.id,
              storeLocationId: data.storeLocationId || currentLocation.id,
              title: data.title || 'Store Owner',
              avatar: data.avatar || fbUser.photoURL || undefined,
              isDemo: false,
            });
          } else {
            const newAcc: UserAccount = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Store Owner',
              email: fbUser.email || '',
              role: 'owner',
              businessId: currentBusiness.id,
              storeLocationId: currentLocation.id,
              title: 'Store Owner',
              avatar: fbUser.photoURL || undefined,
              isDemo: false,
            };
            try {
              await setDoc(doc(db, 'users', fbUser.uid), {
                ...newAcc,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            } catch (e) {
              console.warn('Could not save user profile to firestore', e);
            }
            setCurrentUser(newAcc);
          }
        } catch (err) {
          console.warn('Error reading user profile:', err);
          setCurrentUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Store Owner',
            email: fbUser.email || '',
            role: 'owner',
            businessId: currentBusiness.id,
            storeLocationId: currentLocation.id,
            title: 'Store Owner',
            avatar: fbUser.photoURL || undefined,
            isDemo: false,
          });
        }
      } else {
        setCurrentUser((prev) => (prev?.isDemo ? prev : null));
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [currentBusiness.id, currentLocation.id]);

  // Auth actions
  const openAuthModal = (mode: 'login' | 'signup' | 'forgot_password' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // 1. Firebase Email & Password Login
  const login = async (email: string, password?: string, role: 'owner' | 'manager' | 'cashier' = 'owner'): Promise<boolean> => {
    if (!password) {
      return loginWithDemo(role);
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setIsAuthModalOpen(false);
      setActiveView('dashboard');
      return true;
    } catch (err: any) {
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  // 2. Firebase Email & Password Registration (Sign Up)
  const signup = async (
    name: string,
    email: string,
    password?: string,
    businessName?: string,
    role: 'owner' | 'manager' | 'cashier' = 'owner'
  ): Promise<boolean> => {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      try {
        await updateProfile(res.user, { displayName: name.trim() });
      } catch (e) {
        console.warn('Could not set displayName', e);
      }

      const userProfile: UserAccount = {
        id: res.user.uid,
        name: name.trim() || 'Store Owner',
        email: email.trim(),
        role,
        businessId: currentBusiness.id,
        storeLocationId: currentLocation.id,
        title: `${businessName?.trim() || currentBusiness.name} Owner`,
        isDemo: false,
      };

      try {
        await setDoc(doc(db, 'users', res.user.uid), {
          ...userProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Could not save profile to firestore', e);
      }

      setCurrentUser(userProfile);
      setIsAuthModalOpen(false);
      setActiveView('dashboard');
      return true;
    } catch (err: any) {
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  // 3. Forgot Password / Password Reset Email
  const sendPasswordReset = async (email: string): Promise<boolean> => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error('Please enter a valid email address.');
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err: any) {
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  // 4. Google Sign In
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      const userProfile: UserAccount = {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Store Owner',
        email: user.email || '',
        role: 'owner',
        businessId: currentBusiness.id,
        storeLocationId: currentLocation.id,
        title: 'Store Owner',
        avatar: user.photoURL || undefined,
        isDemo: false,
      };

      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            ...userProfile,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Could not update user doc', e);
      }

      setCurrentUser(userProfile);
      setIsAuthModalOpen(false);
      setActiveView('dashboard');
      return true;
    } catch (err: any) {
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  // 5. 'Try Demo' Option (Redirects to dashboard with restricted demo account)
  const loginWithDemo = async (role: 'owner' | 'manager' | 'cashier' = 'cashier'): Promise<boolean> => {
    const demoUser: UserAccount = {
      id: `demo-user-${role}`,
      name: role === 'cashier' ? 'Rohan Mehta (Demo Cashier)' : role === 'manager' ? 'Anita Deshmukh (Demo Manager)' : 'Guest Retailer (Demo Owner)',
      email: 'demo@dukaaniq.in',
      role,
      businessId: currentBusiness.id,
      storeLocationId: currentLocation.id,
      title: role === 'cashier' ? 'Restricted Demo Cashier' : role === 'manager' ? 'Restricted Demo Manager' : 'Restricted Demo Account',
      isDemo: true,
    };

    setCurrentUser(demoUser);
    setIsAuthModalOpen(false);
    setActiveView('dashboard');
    return true;
  };

  // 6. Sign Out
  const logout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setCurrentUser(null);
    clearCart();
    setActiveView('home');
  };


  // Add product to cart
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { product, quantity, unitPrice: product.sellingPrice, discountPercent: 0 }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const setCartItemDiscount = (productId: string, discountPercent: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, discountPercent: Math.max(0, Math.min(100, discountPercent)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  // Hold current cart
  const holdCurrentCart = (label?: string) => {
    if (cart.length === 0) return;
    const totals = calculateCartTotals();
    const newHeld = {
      id: `hold-${Date.now()}`,
      customerName: selectedCustomer ? selectedCustomer.name : label || `Cart #${heldCarts.length + 1}`,
      items: [...cart],
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      total: totals.roundedTotal,
    };
    setHeldCarts((prev) => [newHeld, ...prev]);
    clearCart();
  };

  // Resume held cart
  const resumeHeldCart = (cartId: string) => {
    const target = heldCarts.find((c) => c.id === cartId);
    if (!target) return;
    setCart(target.items);
    setHeldCarts((prev) => prev.filter((c) => c.id !== cartId));
  };

  // Deterministic GST tax calculation (using ?? to support valid 0% tax)
  const calculateCartTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let taxTotal = 0;

    cart.forEach((item) => {
      const lineBase = item.unitPrice * item.quantity;
      const lineDiscount = (lineBase * item.discountPercent) / 100;
      const lineTaxable = lineBase - lineDiscount;

      // Rate breakdown: For Indian intra-state: half CGST + half SGST
      const taxRate = item.product.taxRate ?? 18;
      const lineTax = (lineTaxable * taxRate) / 100;
      const cgst = lineTax / 2;
      const sgst = lineTax / 2;

      subtotal += lineBase;
      discountTotal += lineDiscount;
      cgstTotal += cgst;
      sgstTotal += sgst;
      taxTotal += lineTax;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;
    const roundedTotal = Math.round(grandTotal);
    const roundingDelta = +(roundedTotal - grandTotal).toFixed(2);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      cgstTotal: Math.round(cgstTotal * 100) / 100,
      sgstTotal: Math.round(sgstTotal * 100) / 100,
      igstTotal: Math.round(igstTotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      roundedTotal,
      roundingDelta,
    };
  };

  // Finalize Sale Atomically
  const finalizeSale = async (payments: TenderPayment[]): Promise<Sale> => {
    const totals = calculateCartTotals();
    const invoiceSeq = (sales.length + 1042).toString().padStart(6, '0');
    const invoiceNumber = `${currentLocation.invoicePrefix}${invoiceSeq}`;
    const timestamp = new Date().toISOString();

    const saleItems = cart.map((item) => {
      const lineBase = item.unitPrice * item.quantity;
      const discountAmount = (lineBase * item.discountPercent) / 100;
      const lineTaxable = lineBase - discountAmount;
      const taxRate = item.product.taxRate ?? 18;
      const taxAmount = (lineTaxable * taxRate) / 100;

      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        hsnCode: item.product.hsnCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: Math.round(discountAmount * 100) / 100,
        taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        cgstAmount: Math.round((taxAmount / 2) * 100) / 100,
        sgstAmount: Math.round((taxAmount / 2) * 100) / 100,
        igstAmount: 0,
        lineTotal: Math.round((lineTaxable + taxAmount) * 100) / 100,
      };
    });

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      businessId: currentBusiness.id,
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      timestamp,
      cashierId: currentUser?.id || currentShift?.cashierId || 'cashier-default',
      cashierName: currentUser?.name || currentShift?.cashierName || 'Cashier Desk',
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      items: saleItems,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      cgstTotal: totals.cgstTotal,
      sgstTotal: totals.sgstTotal,
      igstTotal: totals.igstTotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      roundedTotal: totals.roundedTotal,
      roundingDelta: totals.roundingDelta,
      payments,
      status: 'completed',
      idempotencyKey: `idem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isOfflineQueued: isOffline,
    };

    // Decrement inventory stock on hand accurately
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.product.id === prod.id);
        if (cartItem) {
          const currentQty = prod.stockOnHand[currentLocation.id] || 0;
          return {
            ...prod,
            stockOnHand: {
              ...prod.stockOnHand,
              [currentLocation.id]: Math.max(0, currentQty - cartItem.quantity),
            },
          };
        }
        return prod;
      })
    );

    // Record Stock Movement
    const newMovements: StockMovement[] = cart.map((c) => ({
      id: `mov-${Date.now()}-${c.product.id}`,
      businessId: currentBusiness.id,
      locationId: currentLocation.id,
      productId: c.product.id,
      productName: c.product.name,
      delta: -c.quantity,
      type: 'sale',
      referenceId: invoiceNumber,
      timestamp,
      actorName: currentUser?.name || currentShift?.cashierName || 'Cashier',
      reason: `POS Sale to ${selectedCustomer?.name || 'Walk-in Customer'}`,
    }));
    setStockMovements((prev) => [...newMovements, ...prev]);

    // Update customer spend stats if attached
    if (selectedCustomer) {
      setCustomers((prev) =>
        prev.map((cust) =>
          cust.id === selectedCustomer.id
            ? {
                ...cust,
                totalSpend: cust.totalSpend + totals.roundedTotal,
                totalVisits: cust.totalVisits + 1,
                lastVisit: new Date().toISOString().split('T')[0],
                loyaltyPoints: cust.loyaltyPoints + Math.floor(totals.roundedTotal / 100),
              }
            : cust
        )
      );
    }

    // Update Shift Metrics
    if (currentShift) {
      const cashTender = payments.find((p) => p.type === 'cash');
      const cashAmount = cashTender ? cashTender.amount : 0;
      setCurrentShift((prev) =>
        prev
          ? {
              ...prev,
              expectedCash: prev.expectedCash + cashAmount,
              totalSalesCount: prev.totalSalesCount + 1,
              totalSalesValue: prev.totalSalesValue + totals.roundedTotal,
            }
          : null
      );
    }

    if (isOffline) {
      setOfflineQueue((prev) => [newSale, ...prev]);
    }

    setSales((prev) => [newSale, ...prev]);
    clearCart();
    return newSale;
  };

  // Add new customer directly from billing or CRM
  const addNewCustomer = (customerData: { name: string; phone: string; email?: string; address?: string }): Customer => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      businessId: currentBusiness.id,
      name: customerData.name.trim(),
      phone: customerData.phone.trim(),
      email: customerData.email?.trim() || '',
      address: customerData.address?.trim() || '',
      loyaltyPoints: 50,
      loyaltyTier: 'Silver',
      totalSpend: 0,
      totalVisits: 1,
      preferredCategory: 'General',
      lastVisit: new Date().toISOString().split('T')[0],
      tags: ['New Customer'],
    };
    setCustomers((prev) => [newCust, ...prev]);
    setSelectedCustomer(newCust);
    return newCust;
  };

  // Process item return & restocking from billing
  const processReturnProduct = (
    productId: string,
    quantity: number,
    refundAmount: number,
    reason: string,
    customerName?: string
  ): boolean => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return false;

    // Restock product inventory
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const currentQty = p.stockOnHand[currentLocation.id] || 0;
          return {
            ...p,
            stockOnHand: {
              ...p.stockOnHand,
              [currentLocation.id]: currentQty + quantity,
            },
          };
        }
        return p;
      })
    );

    // Record return stock movement
    const timestamp = new Date().toISOString();
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      businessId: currentBusiness.id,
      locationId: currentLocation.id,
      productId,
      productName: targetProduct.name,
      delta: quantity,
      type: 'refund',
      referenceId: `RET-${Date.now().toString().slice(-6)}`,
      timestamp,
      actorName: currentUser?.name || 'Cashier',
      reason: `Product return: ${reason} (${customerName || 'Walk-in Customer'})`,
    };
    setStockMovements((prev) => [movement, ...prev]);

    // Adjust expected drawer cash if active shift
    if (currentShift && refundAmount > 0) {
      setCurrentShift((prev) =>
        prev
          ? {
              ...prev,
              expectedCash: Math.max(0, prev.expectedCash - refundAmount),
            }
          : null
      );
    }

    return true;
  };

  // Adjust stock
  const adjustStock = (productId: string, delta: number, reason: string) => {
    const targetProd = products.find((p) => p.id === productId);
    if (!targetProd) return;

    let actualDelta = delta;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.stockOnHand[currentLocation.id] || 0;
          const newStock = Math.max(0, current + delta);
          actualDelta = newStock - current;
          return {
            ...p,
            stockOnHand: {
              ...p.stockOnHand,
              [currentLocation.id]: newStock,
            },
          };
        }
        return p;
      })
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      businessId: currentBusiness.id,
      locationId: currentLocation.id,
      productId,
      productName: targetProd.name,
      delta: actualDelta,
      type: 'adjustment',
      referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser?.name || currentShift?.cashierName || 'Store Manager',
      reason,
    };
    setStockMovements((prev) => [movement, ...prev]);
  };

  // Inter-store stock transfer (rejects same location, enforces available stock)
  const transferStock = (productId: string, fromLocId: string, toLocId: string, qty: number): boolean => {
    if (fromLocId === toLocId || qty <= 0) {
      alert('Source and destination locations must be different.');
      return false;
    }

    const targetProd = products.find((p) => p.id === productId);
    if (!targetProd) return false;

    const sourceAvailable = targetProd.stockOnHand[fromLocId] || 0;
    if (sourceAvailable < qty) {
      alert(`Insufficient stock at source location (${sourceAvailable} available, requested ${qty}).`);
      return false;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const fromQty = p.stockOnHand[fromLocId] || 0;
          const toQty = p.stockOnHand[toLocId] || 0;
          return {
            ...p,
            stockOnHand: {
              ...p.stockOnHand,
              [fromLocId]: Math.max(0, fromQty - qty),
              [toLocId]: toQty + qty,
            },
          };
        }
        return p;
      })
    );

    const fromLoc = currentBusiness.locations.find((l) => l.id === fromLocId)?.name || 'Source Store';
    const toLoc = currentBusiness.locations.find((l) => l.id === toLocId)?.name || 'Target Store';

    const movementOut: StockMovement = {
      id: `mov-xfr-out-${Date.now()}`,
      businessId: currentBusiness.id,
      locationId: fromLocId,
      productId,
      productName: targetProd.name,
      delta: -qty,
      type: 'transfer_out',
      referenceId: `XFR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser?.name || 'Operations Lead',
      reason: `Inter-store transfer dispatched to ${toLoc}`,
    };

    const movementIn: StockMovement = {
      id: `mov-xfr-in-${Date.now()}`,
      businessId: currentBusiness.id,
      locationId: toLocId,
      productId,
      productName: targetProd.name,
      delta: qty,
      type: 'transfer_in',
      referenceId: `XFR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser?.name || 'Operations Lead',
      reason: `Inter-store transfer received from ${fromLoc}`,
    };

    setStockMovements((prev) => [movementIn, movementOut, ...prev]);
    return true;
  };

  // Bulk import products and stock levels from CSV
  const bulkImportProducts = (
    items: BulkProductImportItem[],
    targetLocationId: string,
    mode: 'replace' | 'adjust' | 'metadata_only' = 'replace'
  ): BulkImportResult => {
    let createdCount = 0;
    let updatedCount = 0;
    const errors: { row: number; sku?: string; error: string }[] = [];
    const newMovements: StockMovement[] = [];

    setProducts((prevProducts) => {
      const nextProducts = [...prevProducts];

      items.forEach((item) => {
        const normalizedSku = item.sku.trim().toLowerCase();
        const normalizedBarcode = item.barcode ? item.barcode.trim().toLowerCase() : '';

        const existingIndex = nextProducts.findIndex(
          (p) =>
            p.sku.toLowerCase() === normalizedSku ||
            (normalizedBarcode !== '' && p.barcode.toLowerCase() === normalizedBarcode)
        );

        if (existingIndex >= 0) {
          // Update existing
          const existing = nextProducts[existingIndex];
          const updatedStockOnHand = { ...existing.stockOnHand };

          if (mode !== 'metadata_only') {
            if (item.stockByLocation && Object.keys(item.stockByLocation).length > 0) {
              for (const [locId, qty] of Object.entries(item.stockByLocation)) {
                const oldQty = updatedStockOnHand[locId] || 0;
                const newQty = mode === 'adjust' ? Math.max(0, oldQty + qty) : Math.max(0, qty);
                const delta = newQty - oldQty;
                updatedStockOnHand[locId] = newQty;

                if (delta !== 0) {
                  newMovements.push({
                    id: `mov-csv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    businessId: currentBusiness.id,
                    locationId: locId,
                    productId: existing.id,
                    productName: item.name || existing.name,
                    delta,
                    type: 'adjustment',
                    referenceId: `CSV-${Date.now().toString().slice(-4)}`,
                    timestamp: new Date().toISOString(),
                    actorName: currentUser?.name || currentShift?.cashierName || 'Store Manager',
                    reason: `Bulk CSV Stock Update (${mode === 'adjust' ? 'Delta' : 'Count'})`,
                  });
                }
              }
            } else if (item.stock !== undefined) {
              const oldQty = updatedStockOnHand[targetLocationId] || 0;
              const newQty = mode === 'adjust' ? Math.max(0, oldQty + item.stock) : Math.max(0, item.stock);
              const delta = newQty - oldQty;
              updatedStockOnHand[targetLocationId] = newQty;

              if (delta !== 0) {
                newMovements.push({
                  id: `mov-csv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  businessId: currentBusiness.id,
                  locationId: targetLocationId,
                  productId: existing.id,
                  productName: item.name || existing.name,
                  delta,
                  type: 'adjustment',
                  referenceId: `CSV-${Date.now().toString().slice(-4)}`,
                  timestamp: new Date().toISOString(),
                  actorName: currentUser?.name || currentShift?.cashierName || 'Store Manager',
                  reason: `Bulk CSV Stock Update (${mode === 'adjust' ? 'Delta' : 'Count'})`,
                });
              }
            }
          }

          nextProducts[existingIndex] = {
            ...existing,
            name: item.name || existing.name,
            barcode: item.barcode || existing.barcode,
            category: item.category || existing.category,
            brand: item.brand || existing.brand,
            unit: item.unit || existing.unit,
            hsnCode: item.hsnCode || existing.hsnCode,
            costPrice: item.costPrice !== undefined ? item.costPrice : existing.costPrice,
            sellingPrice: item.sellingPrice !== undefined ? item.sellingPrice : existing.sellingPrice,
            mrp: item.mrp !== undefined ? item.mrp : existing.mrp,
            taxRate: item.taxRate !== undefined ? item.taxRate : existing.taxRate,
            reorderPoint: item.reorderPoint !== undefined ? item.reorderPoint : existing.reorderPoint,
            packSize: item.packSize !== undefined ? item.packSize : existing.packSize,
            supplierId: item.supplierId || existing.supplierId,
            description: item.description || existing.description,
            stockOnHand: updatedStockOnHand,
          };
          updatedCount++;
        } else {
          // Create new product
          const newId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const initialStockOnHand: { [locId: string]: number } = {};

          currentBusiness.locations.forEach((loc) => {
            initialStockOnHand[loc.id] = 0;
          });

          if (item.stockByLocation && Object.keys(item.stockByLocation).length > 0) {
            for (const [locId, qty] of Object.entries(item.stockByLocation)) {
              initialStockOnHand[locId] = Math.max(0, qty);
            }
          } else if (item.stock !== undefined) {
            initialStockOnHand[targetLocationId] = Math.max(0, item.stock);
          }

          const defaultSupplier = suppliers[0]?.id || 'sup-01';

          const newProduct: Product = {
            id: newId,
            businessId: currentBusiness.id,
            sku: item.sku,
            barcode: item.barcode || '890' + Math.floor(1000000000 + Math.random() * 9000000000),
            name: item.name,
            category: item.category || 'General',
            brand: item.brand || 'Generic',
            unit: item.unit || 'pcs',
            hsnCode: item.hsnCode || '85044090',
            costPrice: item.costPrice !== undefined ? item.costPrice : 100,
            sellingPrice: item.sellingPrice !== undefined ? item.sellingPrice : 149,
            mrp: item.mrp !== undefined ? item.mrp : (item.sellingPrice || 149),
            taxRate: item.taxRate !== undefined ? item.taxRate : 18,
            stockOnHand: initialStockOnHand,
            reorderPoint: item.reorderPoint !== undefined ? item.reorderPoint : 10,
            packSize: item.packSize || 1,
            supplierId: item.supplierId || defaultSupplier,
            description: item.description,
          };

          nextProducts.push(newProduct);
          createdCount++;

          const initialQty = initialStockOnHand[targetLocationId] || 0;
          if (initialQty > 0) {
            newMovements.push({
              id: `mov-csv-new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              businessId: currentBusiness.id,
              locationId: targetLocationId,
              productId: newId,
              productName: item.name,
              delta: initialQty,
              type: 'adjustment',
              referenceId: `CSV-NEW`,
              timestamp: new Date().toISOString(),
              actorName: currentUser?.name || currentShift?.cashierName || 'Store Manager',
              reason: 'Initial Bulk CSV Stock Entry',
            });
          }
        }
      });

      return nextProducts;
    });

    if (newMovements.length > 0) {
      setStockMovements((prev) => [...newMovements, ...prev]);
    }

    return {
      totalProcessed: items.length,
      createdCount,
      updatedCount,
      errors,
    };
  };

  // Create Purchase Order draft
  const createPurchaseOrderDraft = (
    supplierId: string,
    items: { productId: string; qty: number; unitCost: number }[]
  ): string => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    const poNumber = `PO-2026-${(purchaseOrders.length + 42).toString().padStart(4, '0')}`;
    const poItems = items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        orderQuantity: item.qty,
        receivedQuantity: 0,
        unitCost: item.unitCost,
        lineTotal: item.qty * item.unitCost,
      };
    });

    const totalAmount = poItems.reduce((acc, curr) => acc + curr.lineTotal, 0);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      businessId: currentBusiness.id,
      locationId: currentLocation.id,
      supplierId,
      supplierName: supplier?.name || 'Authorized Supplier',
      createdAt: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'ordered',
      items: poItems,
      totalAmount,
      notes: 'AI Automated reorder based on lead time and sales velocity.',
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    return poNumber;
  };

  // Receive Purchase Order: correctly updates stock at po.locationId rather than arbitrary active store
  const receivePurchaseOrder = (poId: string, receivedMap: { [productId: string]: number }) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    const targetLocationId = po.locationId;

    // Update PO item counts
    setPurchaseOrders((prev) =>
      prev.map((item) => {
        if (item.id === poId) {
          const updatedLines = item.items.map((line) => {
            const newlyReceived = receivedMap[line.productId] || 0;
            return {
              ...line,
              receivedQuantity: line.receivedQuantity + newlyReceived,
            };
          });
          const allReceived = updatedLines.every((l) => l.receivedQuantity >= l.orderQuantity);
          return {
            ...item,
            items: updatedLines,
            status: allReceived ? 'received' : 'partially_received',
            receivedAt: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );

    // Replenish stock on hand at po.locationId
    setProducts((prev) =>
      prev.map((prod) => {
        const added = receivedMap[prod.id] || 0;
        if (added > 0) {
          const current = prod.stockOnHand[targetLocationId] || 0;
          return {
            ...prod,
            stockOnHand: {
              ...prod.stockOnHand,
              [targetLocationId]: current + added,
            },
          };
        }
        return prod;
      })
    );

    // Append Stock Movements with correct locationId
    const timestamp = new Date().toISOString();
    const movements: StockMovement[] = Object.entries(receivedMap)
      .filter(([_, qty]) => qty > 0)
      .map(([prodId, qty]) => {
        const prod = products.find((p) => p.id === prodId)!;
        return {
          id: `mov-recv-${Date.now()}-${prodId}`,
          businessId: po.businessId,
          locationId: targetLocationId,
          productId: prodId,
          productName: prod?.name || 'Product',
          delta: qty,
          type: 'purchase_receive',
          referenceId: po.poNumber,
          timestamp,
          actorName: currentUser?.name || currentShift?.cashierName || 'Store Incharge',
          reason: `Goods received from ${po.supplierName} at ${po.locationId}`,
        };
      });

    setStockMovements((prev) => [...movements, ...prev]);
  };

  // Update selling price (Dynamic pricing execution)
  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, sellingPrice: newPrice } : p))
    );
  };

  // Shift Management
  const openShift = (openingFloat: number) => {
    const newShift: ShiftRecord = {
      id: `shift-${Date.now()}`,
      businessId: currentBusiness.id,
      locationId: currentLocation.id,
      cashierId: currentUser?.id || 'cashier-anita',
      cashierName: currentUser?.name || 'Anita Deshmukh',
      openedAt: new Date().toISOString(),
      openingFloat,
      expectedCash: openingFloat,
      totalSalesCount: 0,
      totalSalesValue: 0,
      status: 'open',
    };
    setCurrentShift(newShift);
  };

  const closeShift = (declaredCash: number, notes?: string) => {
    if (!currentShift) return;
    const cashVariance = declaredCash - currentShift.expectedCash;
    const finalizedShift: ShiftRecord = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      declaredCash,
      cashVariance,
      notes,
      status: 'closed',
    };
    setShiftsHistory((prev) => [finalizedShift, ...prev]);
    setCurrentShift(null);
  };

  // Offline mode toggle and sync
  const toggleOfflineMode = () => {
    setIsOffline((prev) => !prev);
  };

  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    setSales((prev) =>
      prev.map((s) => (s.isOfflineQueued ? { ...s, isOfflineQueued: false } : s))
    );
    setOfflineQueue([]);
  };

  // Demand Forecast generator: factoring location-scoped open orders accurately
  const getDemandForecasts = (): DemandForecastItem[] => {
    return products.map((prod) => {
      const currentStock = prod.stockOnHand[currentLocation.id] || 0;
      const supplier = suppliers.find((s) => s.id === prod.supplierId);
      const leadDays = supplier?.averageDeliveryDays || 3;

      let avgDailyDemand = 1.8;
      if (prod.category === 'Screen Guards') avgDailyDemand = 8.5;
      else if (prod.category === 'Chargers & Cables') avgDailyDemand = 4.2;
      else if (prod.category === 'Audio') avgDailyDemand = 2.4;
      else if (prod.category === 'Smartphones') avgDailyDemand = 0.6;
      else if (prod.category === 'Power Banks') avgDailyDemand = 1.9;

      const leadTimeDemand = Math.round(avgDailyDemand * leadDays);
      const safetyStock = prod.reorderPoint;
      const targetStock = Math.round(avgDailyDemand * 30); // 30-day target

      // Check open purchase orders scoped to this location
      const openQty = purchaseOrders
        .filter((po) => (po.status === 'ordered' || po.status === 'partially_received') && po.locationId === currentLocation.id)
        .flatMap((po) => po.items)
        .filter((item) => item.productId === prod.id)
        .reduce((sum, item) => sum + Math.max(0, item.orderQuantity - item.receivedQuantity), 0);

      const rawNeeded = targetStock - currentStock - openQty;
      const suggestedPurchaseQuantity =
        rawNeeded > 0 ? Math.ceil(rawNeeded / (prod.packSize || 1)) * (prod.packSize || 1) : 0;

      let stockoutRisk: 'Critical' | 'Warning' | 'Low' = 'Low';
      if (currentStock <= leadTimeDemand) {
        stockoutRisk = 'Critical';
      } else if (currentStock <= prod.reorderPoint) {
        stockoutRisk = 'Warning';
      }

      return {
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        currentStock,
        avgDailyDemand,
        supplierLeadDays: leadDays,
        leadTimeDemand,
        safetyStock,
        predictedDemandNextMonth: targetStock,
        suggestedPurchaseQuantity,
        stockoutRisk,
        supplierId: prod.supplierId,
        supplierName: supplier?.name || 'Primary Supplier',
      };
    });
  };

  // Evaluate critical stock alerts based on defined thresholds
  const getCriticalStockAlerts = (options?: ThresholdEvaluationOptions) => {
    return evaluateCriticalStockAlerts(
      products,
      currentLocation.id,
      suppliers,
      currentBusiness.locations,
      purchaseOrders,
      options
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        authLoading,
        login,
        signup,
        sendPasswordReset,
        loginWithGoogle,
        loginWithDemo,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        businesses,
        currentBusiness,
        currentLocation,
        products,
        cart,
        heldCarts,
        selectedCustomer,
        customers,
        suppliers,
        purchaseOrders,
        sales,
        stockMovements,
        currentShift,
        shiftsHistory,
        isOffline,
        offlineQueue,
        activeView,
        setActiveView,
        setCurrentBusiness,
        setCurrentLocation,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        setCartItemDiscount,
        clearCart,
        holdCurrentCart,
        resumeHeldCart,
        setSelectedCustomer,
        finalizeSale,
        adjustStock,
        transferStock,
        createPurchaseOrderDraft,
        receivePurchaseOrder,
        updateProductPrice,
        openShift,
        closeShift,
        toggleOfflineMode,
        syncOfflineQueue,
        calculateCartTotals,
        getDemandForecasts,
        addNewCustomer,
        processReturnProduct,
        bulkImportProducts,
        getCriticalStockAlerts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
