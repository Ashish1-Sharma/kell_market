import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../config.dart';
import '../models/category.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../services/session_manager.dart';
import '../services/cart_manager.dart';
import '../services/wishlist_manager.dart';
import 'all_categories_screen.dart';
import 'category_products_screen.dart';
import 'product_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  CustomerInfo? _customerInfo;
  List<Category> _categories = [];
  List<Product> _activeProducts = [];
  List<Product> _allActiveProducts = [];
  bool _isLoading = true;
  bool _hasError = false;
  String? _selectedCategoryId;
  final WishlistManager _wishlistManager = WishlistManager();
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  String _searchQuery = '';

  bool _isFavorite(String id) => _wishlistManager.isFavorite(id);

  void _toggleFavorite(String id) {
    _wishlistManager.toggleFavorite(id);
  }

  @override
  void initState() {
    super.initState();
    _wishlistManager.addListener(_onWishlistChanged);
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    _wishlistManager.removeListener(_onWishlistChanged);
    super.dispose();
  }

  void _onWishlistChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
    });

    try {
      _customerInfo = SessionManager.getCustomerInfo();
      final categories = await ApiService.getCategoriesAndProducts();
      
      // Flatten all categories to get all active products globally
      final allActive = <Product>[];
      for (final cat in categories) {
        for (final prod in cat.items) {
          if (prod.productStatus == 'Active') {
            if (!allActive.any((p) => p.id == prod.id)) {
              allActive.add(prod);
            }
          }
        }
      }

      // Find the first category in index order that has active products
      String? initialCategoryId;
      final activeProducts = <Product>[];
      for (final cat in categories) {
        final catActiveProducts = _getCategoryActiveProducts(cat);
        if (catActiveProducts.isNotEmpty) {
          initialCategoryId = cat.id;
          activeProducts.addAll(catActiveProducts);
          break; // Found the first category with products, stop searching
        }
      }

      if (mounted) {
        setState(() {
          _categories = categories;
          _allActiveProducts = allActive;
          _selectedCategoryId = initialCategoryId;
          _activeProducts = activeProducts;
          _searchController.clear();
          _searchQuery = '';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasError = true;
        });
      }
    }
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
      _updateDisplayProducts();
    });
  }

  void _updateDisplayProducts() {
    final query = _searchQuery.trim().toLowerCase();
    if (query.length > 2) {
      // Search globally across all active products
      _activeProducts = _allActiveProducts
          .where((prod) => prod.itemName.toLowerCase().contains(query))
          .toList();
    } else {
      // Display current category active products
      if (_selectedCategoryId != null) {
        final selectedCat = _categories.firstWhere(
          (cat) => cat.id == _selectedCategoryId,
          orElse: () => _categories.first,
        );
        _activeProducts = _getCategoryActiveProducts(selectedCat);
      } else {
        _activeProducts = [];
      }
    }
  }

  List<Product> _getCategoryActiveProducts(Category category) {
    final catActiveProducts = <Product>[];
    for (final prod in category.items) {
      if (prod.productStatus == 'Active') {
        if (!catActiveProducts.any((p) => p.id == prod.id)) {
          catActiveProducts.add(prod);
        }
      }
    }
    return catActiveProducts;
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);
    final ownerName = _customerInfo?.ownerName ?? 'Customer';

    if (_hasError) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 80, color: Colors.red[300]),
                const SizedBox(height: 16),
                const Text(
                  'Something went wrong',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Unable to load catalog. Please check your connection.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _loadData,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hello, $ownerName 👋',
              style: const TextStyle(
                color: Colors.black,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'Welcome to ${companyName}',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
        actions: [
          // IconButton(
          //   icon: const Icon(Icons.search, color: Colors.black54),
          //   onPressed: () {
          //     ScaffoldMessenger.of(context).showSnackBar(
          //       const SnackBar(content: Text('Tap the search bar below to search products.')),
          //     );
          //   },
          // ),
          // Stack(
          //   children: [
          //     IconButton(
          //       icon: const Icon(Icons.notifications_none_outlined, color: Colors.black54),
          //       onPressed: () {
          //         ScaffoldMessenger.of(context).showSnackBar(
          //           const SnackBar(content: Text('Notifications coming soon!')),
          //         );
          //       },
          //     ),
          //     Positioned(
          //       right: 12,
          //       top: 12,
          //       child: Container(
          //         width: 8,
          //         height: 8,
          //         decoration: const BoxDecoration(
          //           color: Colors.red,
          //           shape: BoxShape.circle,
          //         ),
          IconButton(
            icon: const Icon(Icons.search, color: Colors.black54),
            onPressed: () {
              _searchFocusNode.requestFocus();
            },
          ),
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_outlined, color: Colors.black54),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Notifications coming soon!')),
                  );
                },
              ),
              Positioned(
                right: 12,
                top: 12,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: primaryColor,
        child: _isLoading
            ? _buildSkeletonLoader(primaryColor)
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Interactive Search Bar Section
                    Container(
                        margin: EdgeInsets.symmetric(horizontal: 10,vertical: 10),
                        child: Image.asset("assets/app_banner.jpeg")),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[200]!),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.02),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: TextField(
                          controller: _searchController,
                          focusNode: _searchFocusNode,
                          onChanged: _onSearchChanged,
                          textInputAction: TextInputAction.search,
                          decoration: InputDecoration(
                            hintText: 'Search products, brands and more...',
                            hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
                            prefixIcon: Icon(Icons.search, color: Colors.grey[400]),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            suffixIcon: _searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 18),
                                    onPressed: () {
                                      _searchController.clear();
                                      _onSearchChanged('');
                                    },
                                  )
                                : null,
                          ),
                        ),
                      ),
                    ),

                    // Categories Section
                    if (_categories.isNotEmpty) ...[
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Categories',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => AllCategoriesScreen(
                                      categories: _categories,
                                      initialCategoryId: _selectedCategoryId ?? _categories.first.id,
                                    ),
                                  ),
                                ).then((_) => setState(() {}));
                              },
                              child: Text(
                                'View all',
                                style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 4),
                      SizedBox(
                        height: 44,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.only(left: 16),
                          itemCount: _categories.length,
                          itemBuilder: (context, index) {
                            final category = _categories[index];
                            final isSelected = category.id == _selectedCategoryId;

                            return Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: ActionChip(
                                label: Text(category.categoryName),
                                backgroundColor: isSelected ? const Color(0xFFE8F5E9) : Colors.white,
                                labelStyle: TextStyle(
                                  color: isSelected ? primaryColor : Colors.black87,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                  fontSize: 13,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                  side: BorderSide(
                                    color: isSelected ? primaryColor : Colors.grey[300]!,
                                    width: isSelected ? 1.5 : 1.0,
                                  ),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
                                onPressed: () {
                                  setState(() {
                                    _searchController.clear();
                                    _searchQuery = '';
                                    _selectedCategoryId = category.id;
                                    _activeProducts = _getCategoryActiveProducts(category);
                                  });
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    ],

                    const SizedBox(height: 16),

                    // Popular Products Grid Header
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Popular Products',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                          if (_categories.isNotEmpty)
                            TextButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => CategoryProductsScreen(
                                      categories: _categories,
                                      initialCategoryId: _selectedCategoryId ?? _categories.first.id,
                                      showAllProducts: true,
                                    ),
                                  ),
                                ).then((_) => setState(() {}));
                              },
                              child: Text(
                                'View all',
                                style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold),
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Popular Products Grid
                    _activeProducts.isEmpty
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.all(48.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.shopping_bag_outlined, size: 64, color: Colors.grey),
                                  SizedBox(height: 16),
                                  Text(
                                    'No products available',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black54,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16.0),
                            child: GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.65, // Adjusted to prevent overflow on taller card
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                              itemCount: _activeProducts.length,
                              itemBuilder: (context, index) {
                                final product = _activeProducts[index];
                                return _buildProductCard(context, product);
                              },
                            ),
                          ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildSkeletonLoader(Color primaryColor) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Skeleton Search Bar
            Container(
              height: 48,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const SizedBox(height: 24),

            // Skeleton Categories Header
            Container(height: 20, width: 100, color: Colors.white),
            const SizedBox(height: 12),

            // Skeleton Categories chips
            Row(
              children: List.generate(4, (index) => Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: Container(
                  width: 80,
                  height: 32,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              )),
            ),
            const SizedBox(height: 24),

            // Skeleton Products Header
            Container(height: 20, width: 140, color: Colors.white),
            const SizedBox(height: 16),

            // Skeleton Grid View
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.65,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: 4,
              itemBuilder: (context, index) {
                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _categoryPlaceholder(String name) {
    final char = name.isNotEmpty ? name[0].toUpperCase() : 'C';
    return Container(
      color: Colors.green[50],
      alignment: Alignment.center,
      child: Text(
        char,
        style: const TextStyle(
          color: Color(0xFF2E7D32),
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, Product product) {
    final primaryColor = const Color(0xFF2E7D32);
    final hasDiscount = product.itemDisPrice != null && product.itemDisPrice! > 0;
    final isFav = _isFavorite(product.id);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailScreen(product: product),
          ),
        ).then((_) {
          // Rebuild home in case item was added to cart to update navbar count
          setState(() {});
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[200]!),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Product Image & Wishlist Button Stack
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: Container(
                      color: Colors.white, // Ensure white background for image
                      child: ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                        child: product.itemImage != null && product.itemImage!.isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: '${ApiService.imageBaseUrl}${product.itemImage}',
                                fit: BoxFit.contain, // Fit contain to display whole product without cropping
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
                                  child: Icon(Icons.shopping_bag_outlined, color: Colors.grey[300], size: 40),
                                ),
                              )
                            : Container(
                                color: Colors.grey[50],
                                alignment: Alignment.center,
                                child: Icon(Icons.shopping_bag_outlined, color: Colors.grey[300], size: 40),
                              ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () => _toggleFavorite(product.id),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.9),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          isFav ? Icons.favorite : Icons.favorite_border,
                          color: isFav ? Colors.red : Colors.grey[600],
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Product Details
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Fixed-height name container to preserve equal card heights
                  SizedBox(
                    height: 38,
                    child: Text(
                      product.itemName,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  
                  // Fixed-height price container to preserve layout spacing
                  SizedBox(
                    height: 20,
                    child: (product.itemPrice != null || product.itemDisPrice != null)
                        ? Row(
                            children: [
                              Text(
                                product.itemDisPrice != null
                                    ? '₹${product.itemDisPrice!.toStringAsFixed(0)}'
                                    : '₹${product.itemPrice!.toStringAsFixed(0)}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: primaryColor,
                                  fontSize: 14,
                                ),
                              ),
                              if (hasDiscount) ...[
                                const SizedBox(width: 6),
                                Text(
                                  '₹${product.itemPrice!.toStringAsFixed(0)}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.grey[500],
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                              ],
                            ],
                          )
                        : const SizedBox.shrink(),
                  ),
                  const SizedBox(height: 8),
                  
                  // Add Button
                  SizedBox(
                    width: double.infinity,
                    height: 32,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        CartManager().addToCart(product);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${product.itemName} added to cart!'),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                        // Rebuild screen to update badge
                        setState(() {});
                      },
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: primaryColor),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                        padding: EdgeInsets.zero,
                        foregroundColor: primaryColor,
                      ),
                      icon: const Icon(Icons.shopping_cart_outlined, size: 14),
                      label: const Text(
                        'Add to Cart',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
