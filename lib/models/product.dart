class Product {
  final String id;
  final String itemName;
  final String itemDesc;
  final double? itemPrice; // null means invalid/empty
  final double? itemDisPrice; // null means not set or invalid
  final String itemPriceRaw; // original string
  final String? itemDisPriceRaw; // original string
  final String? itemQuantity;
  final String itemCategory;
  final String productStatus; // "Active", "Out of stock", "In-active"
  final String? itemImage;

  Product({
    required this.id,
    required this.itemName,
    required this.itemDesc,
    this.itemPrice,
    this.itemDisPrice,
    required this.itemPriceRaw,
    this.itemDisPriceRaw,
    this.itemQuantity,
    required this.itemCategory,
    required this.productStatus,
    this.itemImage,
  });

  bool get isActive => productStatus == 'Active';
  bool get isOutOfStock => productStatus == 'Out of stock';
  bool get isInactive => productStatus == 'In-active';

  // Helper to get printable price representation
  String get priceDisplay {
    if (itemPrice == null) return 'N/A';
    return '₹${itemPrice!.toStringAsFixed(0)}';
  }

  String get disPriceDisplay {
    if (itemDisPrice == null) return '';
    return '₹${itemDisPrice!.toStringAsFixed(0)}';
  }

  // Returns active price: discounted price if available, else standard price.
  // Returns 0.0 if neither is valid.
  double get activePrice {
    return itemDisPrice ?? itemPrice ?? 0.0;
  }

  String get activePriceDisplay {
    if (itemDisPrice != null) {
      return '₹${itemDisPrice!.toStringAsFixed(0)}';
    }
    if (itemPrice != null) {
      return '₹${itemPrice!.toStringAsFixed(0)}';
    }
    return 'N/A';
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    final rawPrice = json['item_price']?.toString() ?? '';
    final rawDisPrice = json['item_dis_price']?.toString();

    return Product(
      id: json['id']?.toString() ?? '',
      itemName: json['item_name']?.toString() ?? '',
      itemDesc: json['item_desc']?.toString() ?? '',
      itemPrice: double.tryParse(rawPrice),
      itemDisPrice: (rawDisPrice != null && rawDisPrice.isNotEmpty) ? double.tryParse(rawDisPrice) : null,
      itemPriceRaw: rawPrice,
      itemDisPriceRaw: rawDisPrice,
      itemQuantity: json['item_quantity']?.toString(),
      itemCategory: json['item_category']?.toString() ?? '',
      productStatus: json['product_status']?.toString() ?? 'Active',
      itemImage: json['item_image']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'item_name': itemName,
      'item_desc': itemDesc,
      'item_price': itemPriceRaw,
      'item_dis_price': itemDisPriceRaw,
      'item_quantity': itemQuantity,
      'item_category': itemCategory,
      'product_status': productStatus,
      'item_image': itemImage,
    };
  }
}
