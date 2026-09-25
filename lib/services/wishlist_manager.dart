import 'dart:ui';

class WishlistManager {
  // Singleton pattern
  static final WishlistManager _instance = WishlistManager._internal();
  factory WishlistManager() => _instance;
  WishlistManager._internal();

  final Set<String> _wishlistedIds = {};
  final List<VoidCallback> _listeners = [];

  bool isFavorite(String productId) {
    return _wishlistedIds.contains(productId);
  }

  void toggleFavorite(String productId) {
    if (_wishlistedIds.contains(productId)) {
      _wishlistedIds.remove(productId);
    } else {
      _wishlistedIds.add(productId);
    }
    _notifyListeners();
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
        // ignore
      }
    }
  }
}
