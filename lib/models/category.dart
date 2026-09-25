import 'product.dart';

class Category {
  final String id;
  final String categoryName;
  final List<Product> items;
  final int sortOrder;

  Category({
    required this.id,
    required this.categoryName,
    required this.items,
    required this.sortOrder,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    final list = json['items'] as List?;
    final parsedProducts = list != null
        ? list.map((item) => Product.fromJson(item)).toList()
        : <Product>[];

    // Filter out inactive products as per:
    // "product_status == 'In-active' -> hide from all listings"
    final activeProducts = parsedProducts
        .where((product) => product.productStatus != 'In-active')
        .toList();

    return Category(
      id: json['id']?.toString() ?? '',
      categoryName: json['category_name']?.toString() ?? '',
      items: activeProducts,
      sortOrder: int.tryParse(json['sort_order']?.toString() ?? '') ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category_name': categoryName,
      'items': items.map((product) => product.toJson()).toList(),
      'sort_order': sortOrder.toString(),
    };
  }
}
