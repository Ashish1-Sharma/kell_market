import 'dart:ui';
import '../models/product.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, required this.quantity});
}

class CartManager {
  // Singleton pattern
  static final CartManager _instance = CartManager._internal();
  factory CartManager() => _instance;
  CartManager._internal();

  final List<CartItem> _items = [];
  final List<VoidCallback> _listeners = [];

  List<CartItem> get items => List.unmodifiable(_items);

  int get totalUniqueItems => _items.length;

  int get totalQuantity {
    return _items.fold(0, (sum, item) => sum + item.quantity);
  }

  double get totalAmount {
    return _items.fold(0.0, (sum, item) => sum + (item.product.activePrice * item.quantity));
  }

  void addListener(VoidCallback listener) {
    if (!_listeners.contains(listener)) {
      _listeners.add(listener);
    }
  }

  void removeListener(VoidCallback listener) {
    _listeners.remove(listener);
  }

  void _notifyListeners() {
    for (final listener in _listeners) {
      try {
        listener();
      } catch (e) {
        // Handle listener exceptions gracefully
      }
    }
  }

  void addToCart(Product product, {int quantity = 1}) {
    // Check if product is out of stock (disable add to cart)
    if (product.isOutOfStock) return;

    final existingIndex = _items.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(CartItem(product: product, quantity: quantity));
    }
    _notifyListeners();
  }

  void updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    final index = _items.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      _items[index].quantity = quantity;
      _notifyListeners();
    }
  }

  void removeItem(String productId) {
    _items.removeWhere((item) => item.product.id == productId);
    _notifyListeners();
  }

  void clearCart() {
    _items.clear();
    _notifyListeners();
  }

  // Helper to check if item is in cart and return its quantity
  int getProductQuantity(String productId) {
    final index = _items.indexWhere((item) => item.product.id == productId);
    return index >= 0 ? _items[index].quantity : 0;
  }
}
