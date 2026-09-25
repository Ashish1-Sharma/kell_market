import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../models/category.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../services/cart_manager.dart';
import 'product_detail_screen.dart';

class CategoryProductsScreen extends StatefulWidget {
  final List<Category> categories;
  final String initialCategoryId;
  final bool showAllProducts;

  const CategoryProductsScreen({
    super.key,
    required this.categories,
    required this.initialCategoryId,
    this.showAllProducts = false,
  });

  @override
  State<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  late String _selectedCategoryId;
  late Category _selectedCategory;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _selectedCategoryId = widget.showAllProducts ? 'ALL' : widget.initialCategoryId;
    _updateSelectedCategory();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _updateSelectedCategory() {
    if (_selectedCategoryId == 'ALL') {
      _selectedCategory = Category(
        id: 'ALL',
        categoryName: 'All Products',
        sortOrder: 0,
        items: [],
      );
    } else {
      _selectedCategory = widget.categories.firstWhere(
            (cat) => cat.id == _selectedCategoryId,
        orElse: () => widget.categories.first,
      );
    }
  }

  List<Product> get _filteredProducts {
    List<Product> baseProducts = [];
    if (_selectedCategoryId == 'ALL') {
      for (final cat in widget.categories) {
        for (final prod in cat.items) {
          if (prod.productStatus == 'Active' || prod.productStatus == 'Out of stock') {
            if (!baseProducts.any((p) => p.id == prod.id)) {
              baseProducts.add(prod);
            }
          }
        }
      }
    } else {
      baseProducts = _selectedCategory.items
          .where((p) => p.productStatus == 'Active' || p.productStatus == 'Out of stock')
          .toList();
    }

    if (_searchQuery.trim().isEmpty) {
      return baseProducts;
    }
    final q = _searchQuery.trim().toLowerCase();
    return baseProducts.where((p) => p.itemName.toLowerCase().contains(q)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);
    final products = _filteredProducts;

    // Construct full chips list including 'All Products' chip
    final allCategoryChip = Category(
      id: 'ALL',
      categoryName: 'All Products',
      sortOrder: -1,
      items: [],
    );
    final chipCategories = [allCategoryChip, ...widget.categories];

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black),
        title: Text(
          _selectedCategoryId == 'ALL' ? 'All Products' : _selectedCategory.categoryName,
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Category Selector Chips Bar
          if (chipCategories.length > 1)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 10.0),
              child: SizedBox(
                height: 38,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: chipCategories.length,
                  itemBuilder: (context, index) {
                    final cat = chipCategories[index];
                    final isSelected = cat.id == _selectedCategoryId;

                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ChoiceChip(
                        label: Text(cat.categoryName),
                        selected: isSelected,
                        selectedColor: primaryColor,
                        backgroundColor: Colors.grey[100],
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : Colors.black87,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 13,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: BorderSide(
                            color: isSelected ? primaryColor : Colors.grey[300]!,
                          ),
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedCategoryId = cat.id;
                              _updateSelectedCategory();
                              _searchController.clear();
                              _searchQuery = '';
                            });
                          }
                        },
                      ),
                    );
                  },
                ),
              ),
            ),

          // Search Bar & Count Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16.0, 12.0, 16.0, 8.0),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) {
                        setState(() {
                          _searchQuery = val;
                        });
                      },
                      decoration: InputDecoration(
                        hintText: _selectedCategoryId == 'ALL'
                            ? 'Search all products...'
                            : 'Search in ${_selectedCategory.categoryName}...',
                        hintStyle: TextStyle(color: Colors.grey[400], fontSize: 13),
                        prefixIcon: Icon(Icons.search, size: 18, color: Colors.grey[400]),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 10),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                          icon: const Icon(Icons.clear, size: 16),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {
                              _searchQuery = '';
                            });
                          },
                        )
                            : null,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${products.length} Items',
                  style: TextStyle(
                    color: Colors.grey[700],
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),

          // Products Grid View
          Expanded(
            child: products.isEmpty
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 12),
                  Text(
                    _searchQuery.isNotEmpty
                        ? 'No products matching "${_searchQuery}"'
                        : 'No products available in this category',
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                  ),
                ],
              ),
            )
                : GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.68,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return _buildProductCard(context, product, primaryColor);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, Product product, Color primaryColor) {
    final isOutOfStock = product.isOutOfStock;

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailScreen(product: product),
          ),
        ).then((_) {
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
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Product Image
                Expanded(
                  child: Container(
                    color: Colors.white,
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      child: product.itemImage != null && product.itemImage!.isNotEmpty
                          ? CachedNetworkImage(
                        imageUrl: '${ApiService.imageBaseUrl}${product.itemImage}',
                        fit: BoxFit.contain,
                        placeholder: (context, url) => Shimmer.fromColors(
                          baseColor: Colors.grey[300]!,
                          highlightColor: Colors.grey[100]!,
                          child: Container(color: Colors.white),
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

                // Product Details
                Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 36,
                        child: Text(
                          product.itemName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87),
                        ),
                      ),
                      const SizedBox(height: 4),
                      SizedBox(
                        height: 20,
                        child: Text(
                          product.priceDisplay,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: primaryColor,
                            fontSize: 14,
                          ),
                        )
                      ),
                      const SizedBox(height: 8),

                      // Add Button / Disabled Out of Stock Button
                      SizedBox(
                        width: double.infinity,
                        height: 32,
                        child: isOutOfStock
                            ? OutlinedButton(
                          onPressed: null,
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.red[200]!),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                            padding: EdgeInsets.zero,
                            backgroundColor: Colors.red[50],
                          ),
                          child: const Text(
                            'Out of Stock',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red),
                          ),
                        )
                            : OutlinedButton.icon(
                          onPressed: () {
                            CartManager().addToCart(product);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${product.itemName} added to cart!'),
                                duration: const Duration(seconds: 1),
                              ),
                            );
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
                          icon: const Icon(Icons.add, size: 14),
                          label: const Text(
                            'Add',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Top Badges (Out of stock or Discount tag)
            if (isOutOfStock)
              Positioned(
                top: 8,
                left: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'OUT OF STOCK',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              )

          ],
        ),
      ),
    );
  }
}
