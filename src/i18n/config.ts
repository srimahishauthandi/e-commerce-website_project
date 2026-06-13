import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        search: 'Search for products...',
        cart: 'Cart',
        wishlist: 'Wishlist',
        orders: 'Orders',
        login: 'Login',
        logout: 'Logout',
        hello: 'Hello',
      },
      home: {
        categories: 'Shop by Category',
        featured: 'Featured Products',
        all: 'All Products',
      },
      product: {
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        reviews: 'Reviews',
        related: 'Related Products',
        inStock: 'In Stock',
        outOfStock: 'Out of Stock',
      },
      cart: {
        title: 'Shopping Cart',
        empty: 'Your cart is empty',
        checkout: 'Proceed to Checkout',
        total: 'Total',
        remove: 'Remove',
      },
      checkout: {
        title: 'Checkout',
        address: 'Shipping Address',
        summary: 'Order Summary',
        payment: 'Payment Method',
        cod: 'Cash on Delivery (COD)',
        placeOrder: 'Place Order',
        addAddress: 'Add New Address',
      },
      orders: {
        title: 'Your Orders',
        tracking: 'Order Tracking',
        status: {
          pending: 'Pending',
          confirmed: 'Confirmed',
          processing: 'Processing',
          shipped: 'Shipped',
          out_for_delivery: 'Out for Delivery',
          delivered: 'Delivered',
        },
        downloadReceipt: 'Download Receipt',
      },
    },
  },
  ta: {
    translation: {
      nav: {
        search: 'தயாரிப்புகளைத் தேடுங்கள்...',
        cart: 'கூடை',
        wishlist: 'விருப்பப்பட்டியல்',
        orders: 'ஆர்டர்கள்',
        login: 'உள்நுழைக',
        logout: 'வெளியேறு',
        hello: 'வணக்கம்',
      },
      home: {
        categories: 'வகையின் அடிப்படையில் ஷாப்பிங் செய்யுங்கள்',
        featured: 'சிறப்பு தயாரிப்புகள்',
        all: 'அனைத்து தயாரிப்புகள்',
      },
      product: {
        addToCart: 'கூடையில் சேர்',
        buyNow: 'இப்போதே வாங்கு',
        reviews: 'மதிப்புரைகள்',
        related: 'தொடர்புடைய தயாரிப்புகள்',
        inStock: 'இருப்பில் உள்ளது',
        outOfStock: 'இருப்பில் இல்லை',
      },
      cart: {
        title: 'ஷாப்பிங் கூடை',
        empty: 'உங்கள் கூடை காலியாக உள்ளது',
        checkout: 'செக்அவுட்டிற்குச் செல்லுங்கள்',
        total: 'மொத்தம்',
        remove: 'நீக்கு',
      },
      checkout: {
        title: 'செக்அவுட்',
        address: 'ஷிப்பிங் முகவரி',
        summary: 'ஆர்டர் சுருக்கம்',
        payment: 'கட்டண முறை',
        cod: 'கேஷ் ஆன் டெலிவரி (COD)',
        placeOrder: 'ஆர்டர் செய்',
        addAddress: 'புதிய முகவரியைச் சேர்',
      },
      orders: {
        title: 'உங்கள் ஆர்டர்கள்',
        tracking: 'ஆர்டர் டிராக்கிங்',
        status: {
          pending: 'நிலுவையில் உள்ளது',
          confirmed: 'உறுதிப்படுத்தப்பட்டது',
          processing: 'செயலாக்கத்தில் உள்ளது',
          shipped: 'அனுப்பப்பட்டது',
          out_for_delivery: 'டெலிவரிக்கு வெளியே உள்ளது',
          delivered: 'டெலிவரி செய்யப்பட்டது',
        },
        downloadReceipt: 'ரசீதை பதிவிறக்கவும்',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
