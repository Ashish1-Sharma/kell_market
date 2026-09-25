import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../services/api_service.dart';
import '../services/cart_manager.dart';
import '../services/session_manager.dart';
import 'order_success_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final CartManager _cartManager = CartManager();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _cartManager.addListener(_onCartChanged);
  }

  @override
  void dispose() {
    _cartManager.removeListener(_onCartChanged);
    super.dispose();
  }

  void _onCartChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _handleSendEnquiry() async {
    final customerInfo = SessionManager.getCustomerInfo();
    if (customerInfo == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User session not found. Please log in again.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    // Prepare product list
    final productList = _cartManager.items.map((item) {
      return {
        'id': item.product.id,
        'quantity': item.quantity,
      };
    }).toList();

    final response = await ApiService.sendEnquiry(
      customerId: customerInfo.id,
      productList: productList,
      adminId: customerInfo.adminId,
    );

    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
    });

    if (response['res_code'] == '200') {
      // Clear the cart on successful checkout
      _cartManager.clearCart();

      // Extract inquiry ID if present
      final inquiryId = response['inquiry_id']?.toString() ?? response['id']?.toString();

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OrderSuccessScreen(inquiryId: inquiryId),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response['message']?.toString() ?? 'Failed to send enquiry. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);
    final cartItems = _cartManager.items;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Text(
          'My Cart (${_cartManager.totalQuantity})',
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: cartItems.isEmpty
          ? _buildEmptyState(context)
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: cartItems.length,
                    itemBuilder: (context, index) {
                      final item = cartItems[index];
                      return _buildCartItemCard(context, item);
                    },
                  ),
                ),
                _buildSummarySection(context),
              ],
            ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.shopping_cart_outlined,
              size: 100,
              color: Colors.grey[300],
            ),
            const SizedBox(height: 24),
            const Text(
              'Your Cart is Empty',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black54),
            ),
            const SizedBox(height: 8),
            Text(
              'Add products from the catalog to send enquiries.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[500], fontSize: 14),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                // Return to home tab. MainNavigationScreen can use DefaultTabController or standard Tab index.
                // Normally we can pop to the root which displays MainNavigationScreen,
                // or just notify the parent navigation widget.
                // In our current navigation screen, returning is fine or just popping.
                // If it is inside main navigation screen, it has no back stack, so we can't pop.
                // So let's show instructions or show navigation.
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                elevation: 0,
              ),
              child: const Text('Start Shopping', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCartItemCard(BuildContext context, CartItem item) {
    final primaryColor = const Color(0xFF2E7D32);
    final product = item.product;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          children: [
            // Item Image
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: Colors.grey[100],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: product.itemImage != null && product.itemImage!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: '${ApiService.imageBaseUrl}${product.itemImage}',
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Shimmer.fromColors(
                          baseColor: Colors.grey[300]!,
                          highlightColor: Colors.grey[100]!,
                          child: Container(
                            color: Colors.white,
                          ),
                        ),
                        errorWidget: (context, url, error) => const Icon(
                          Icons.shopping_bag_outlined,
                          color: Colors.grey,
                        ),
                      )
                    : const Icon(
                        Icons.shopping_bag_outlined,
                        color: Colors.grey,
                      ),
              ),
            ),
            const SizedBox(width: 12),

            // Item Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          product.itemName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          _cartManager.removeItem(product.id);
                        },
                        icon: const Icon(Icons.delete_outline, color: Colors.grey, size: 20),
                        constraints: const BoxConstraints(),
                        padding: EdgeInsets.zero,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.itemCategory,
                    style: TextStyle(color: Colors.grey[500], fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        product.activePriceDisplay,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: primaryColor,
                          fontSize: 15,
                        ),
                      ),
                      
                      // Quantity selector
                      CartQuantitySelector(
                        item: item,
                        cartManager: _cartManager,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummarySection(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);
    final subtotal = _cartManager.totalAmount;

    return Container(
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
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Subtotal', style: TextStyle(color: Colors.grey)),
                  Text('₹${subtotal.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w500)),
                ],
              ),
              // const SizedBox(height: 8),
              // const Row(
              //   mainAxisAlignment: MainAxisAlignment.spaceBetween,
              //   children: [
              //     Text('Shipping', style: TextStyle(color: Colors.grey)),
              //     Text('Free', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
              //   ],
              // ),
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '₹${subtotal.toStringAsFixed(0)}',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: primaryColor),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _handleSendEnquiry,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey[200],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    elevation: 0,
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Send Order Request',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CartQuantitySelector extends StatefulWidget {
  final CartItem item;
  final CartManager cartManager;

  const CartQuantitySelector({
    super.key,
    required this.item,
    required this.cartManager,
  });

  @override
  State<CartQuantitySelector> createState() => _CartQuantitySelectorState();
}

class _CartQuantitySelectorState extends State<CartQuantitySelector> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: '${widget.item.quantity}');
  }

  @override
  void didUpdateWidget(covariant CartQuantitySelector oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.item.quantity.toString() != _controller.text && !FocusScope.of(context).hasFocus) {
      _controller.text = '${widget.item.quantity}';
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    if (value.isEmpty) return;
    final val = int.tryParse(value);
    if (val != null && val > 0) {
      widget.cartManager.updateQuantity(widget.item.product.id, val);
    }
  }

  void _onEditingComplete() {
    if (_controller.text.isEmpty || (int.tryParse(_controller.text) ?? 0) <= 0) {
      _controller.text = '${widget.item.quantity}';
      if (widget.item.quantity <= 0) {
        widget.cartManager.updateQuantity(widget.item.product.id, 1);
        _controller.text = '1';
      }
    } else {
      final val = int.parse(_controller.text);
      widget.cartManager.updateQuantity(widget.item.product.id, val);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 32,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            onPressed: () {
              final newQty = widget.item.quantity - 1;
              widget.cartManager.updateQuantity(widget.item.product.id, newQty);
              if (newQty > 0) {
                _controller.text = '$newQty';
              }
            },
            icon: const Icon(Icons.remove, size: 14),
            constraints: const BoxConstraints(minWidth: 28, minHeight: 32),
            padding: EdgeInsets.zero,
          ),
          SizedBox(
            width: 38,
            height: 32,
            child: TextField(
              controller: _controller,
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 6),
              ),
              onChanged: _onChanged,
              onEditingComplete: _onEditingComplete,
              onTapOutside: (_) => _onEditingComplete(),
            ),
          ),
          IconButton(
            onPressed: () {
              final newQty = widget.item.quantity + 1;
              widget.cartManager.updateQuantity(widget.item.product.id, newQty);
              _controller.text = '$newQty';
            },
            icon: const Icon(Icons.add, size: 14),
            constraints: const BoxConstraints(minWidth: 28, minHeight: 32),
            padding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }
}
