import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../services/cart_manager.dart';
import '../services/wishlist_manager.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _quantity = 1;
  late TextEditingController _quantityController;
  final CartManager _cartManager = CartManager();
  final WishlistManager _wishlistManager = WishlistManager();

  @override
  void initState() {
    super.initState();
    _quantityController = TextEditingController(text: '$_quantity');
    _wishlistManager.addListener(_onWishlistChanged);
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _wishlistManager.removeListener(_onWishlistChanged);
    super.dispose();
  }

  void _onWishlistChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  void _incrementQuantity() {
    setState(() {
      _quantity++;
      _quantityController.text = '$_quantity';
    });
  }

  void _decrementQuantity() {
    if (_quantity > 1) {
      setState(() {
        _quantity--;
        _quantityController.text = '$_quantity';
      });
    }
  }

  void _onQuantityTextChanged(String value) {
    if (value.isEmpty) return;
    final val = int.tryParse(value);
    if (val != null && val > 0) {
      setState(() {
        _quantity = val;
      });
    }
  }

  void _onQuantityEditingComplete() {
    if (_quantityController.text.isEmpty || (int.tryParse(_quantityController.text) ?? 0) <= 0) {
      setState(() {
        _quantity = 1;
        _quantityController.text = '1';
      });
    } else {
      setState(() {
        _quantity = int.parse(_quantityController.text);
      });
    }
  }

  void _handleAddToCart() {
    if (widget.product.isOutOfStock) return;

    _cartManager.addToCart(widget.product, quantity: _quantity);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Added $_quantity ${widget.product.itemName} to cart!'),
        duration: const Duration(seconds: 2),
        action: SnackBarAction(
          label: 'View Cart',
          textColor: Colors.white,
          onPressed: () {
            // Pop back to MainNavigationScreen and switch to Cart tab (tab index 1)
            Navigator.of(context).popUntil((route) => route.isFirst);
            // Wait, to switch the tab we might need to notify or use a route.
            // Since it pops to first screen, which is MainNavigationScreen,
            // we can trigger tab change if we had a global controller.
            // But popping back is already good.
          },
        ),
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);
    final product = widget.product;
    final hasDiscount = product.itemDisPrice != null && product.itemDisPrice! > 0;
    final isOutOfStock = product.isOutOfStock;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black),
        title: Text(
          product.itemCategory,
          style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w500),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Product Image & Wishlist Button Stack
                  Stack(
                    children: [
                      Container(
                        height: 300,
                        width: double.infinity,
                        color: Colors.white, // White background for clean look
                        child: product.itemImage != null && product.itemImage!.isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: '${ApiService.imageBaseUrl}${product.itemImage}',
                                fit: BoxFit.contain, // Fit contain to display full image without cropping
                                placeholder: (context, url) => Shimmer.fromColors(
                                  baseColor: Colors.grey[300]!,
                                  highlightColor: Colors.grey[100]!,
                                  child: Container(
                                    color: Colors.white,
                                  ),
                                ),
                                errorWidget: (context, url, error) => Container(
                                  color: Colors.grey[50],
                                  alignment: Alignment.center,
                                  child: Icon(Icons.shopping_bag_outlined, color: Colors.grey[300], size: 80),
                                ),
                              )
                            : Container(
                                color: Colors.grey[50],
                                alignment: Alignment.center,
                                child: Icon(Icons.shopping_bag_outlined, color: Colors.grey[300], size: 80),
                              ),
                      ),
                      Positioned(
                        top: 16,
                        right: 16,
                        child: GestureDetector(
                          onTap: () {
                            _wishlistManager.toggleFavorite(product.id);
                          },
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.9),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.08),
                                  blurRadius: 6,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Icon(
                              _wishlistManager.isFavorite(product.id) ? Icons.favorite : Icons.favorite_border,
                              color: _wishlistManager.isFavorite(product.id) ? Colors.red : Colors.grey[600],
                              size: 24,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Status Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: isOutOfStock ? Colors.red[50] : Colors.green[50],
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: isOutOfStock ? Colors.red[200]! : Colors.green[200]!,
                            ),
                          ),
                          child: Text(
                            isOutOfStock ? 'Out of Stock' : 'In Stock',
                            style: TextStyle(
                              color: isOutOfStock ? Colors.red[800] : Colors.green[800],
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Title
                        Text(
                          product.itemName,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Price Row
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              product.activePriceDisplay,
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: primaryColor,
                              ),
                            ),
                            if (hasDiscount) ...[
                              const SizedBox(width: 8),
                              Text(
                                product.priceDisplay,
                                style: TextStyle(
                                  fontSize: 15,
                                  color: Colors.grey[500],
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Divider(),
                        const SizedBox(height: 16),

                        // Description
                        const Text(
                          'Description',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          product.itemDesc.isNotEmpty ? product.itemDesc : 'No description available for this product.',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[700],
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Sticky Bottom Bar for adding to cart
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  // Quantity Selector
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey[300]!),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          onPressed: isOutOfStock ? null : _decrementQuantity,
                          icon: const Icon(Icons.remove, size: 18),
                          constraints: const BoxConstraints(minWidth: 36, minHeight: 40),
                          padding: EdgeInsets.zero,
                        ),
                        SizedBox(
                          width: 44,
                          height: 40,
                          child: TextField(
                            controller: _quantityController,
                            enabled: !isOutOfStock,
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            decoration: const InputDecoration(
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.symmetric(vertical: 10),
                            ),
                            onChanged: _onQuantityTextChanged,
                            onEditingComplete: _onQuantityEditingComplete,
                            onTapOutside: (_) => _onQuantityEditingComplete(),
                          ),
                        ),
                        IconButton(
                          onPressed: isOutOfStock ? null : _incrementQuantity,
                          icon: const Icon(Icons.add, size: 18),
                          constraints: const BoxConstraints(minWidth: 36, minHeight: 40),
                          padding: EdgeInsets.zero,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Add to Cart Button
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: ElevatedButton(
                        onPressed: isOutOfStock ? null : _handleAddToCart,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: Colors.grey[200],
                          disabledForegroundColor: Colors.grey[500],
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          isOutOfStock ? 'Out of Stock' : 'Add to Cart',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
