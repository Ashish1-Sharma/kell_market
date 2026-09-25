class Order {
  final String id;
  final String inquiryDate;
  final String? description;
  final String status;
  final List<OrderItem> items;

  Order({
    required this.id,
    required this.inquiryDate,
    this.description,
    required this.status,
    required this.items,
  });

  int get totalItems {
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  double get totalPrice {
    return items.fold(0.0, (sum, item) => sum + (item.activePrice * item.quantity));
  }

  factory Order.fromJson(Map<String, dynamic> json) {
    final list = json['items'] as List?;
    final parsedItems = list != null
        ? list.map((item) => OrderItem.fromJson(item)).toList()
        : <OrderItem>[];

    return Order(
      id: json['id']?.toString() ?? '',
      inquiryDate: json['inquiry_date']?.toString() ?? '',
      description: json['description']?.toString(),
      status: json['status']?.toString() ?? 'Pending',
      items: parsedItems,
    );
  }
}

class OrderItem {
  final String id;
  final String itemName;
  final double? itemPrice;
  final double? itemDisPrice;
  final String? itemImage;
  final String itemCategory;
  final int quantity;

  OrderItem({
    required this.id,
    required this.itemName,
    this.itemPrice,
    this.itemDisPrice,
    this.itemImage,
    required this.itemCategory,
    required this.quantity,
  });

  double get activePrice {
    return itemDisPrice ?? itemPrice ?? 0.0;
  }

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    final rawPrice = json['item_price']?.toString() ?? '';
    final rawDisPrice = json['item_dis_price']?.toString();
    final rawQty = json['quantity']?.toString() ?? '1';

    return OrderItem(
      id: json['id']?.toString() ?? '',
      itemName: json['item_name']?.toString() ?? '',
      itemPrice: double.tryParse(rawPrice),
      itemDisPrice: (rawDisPrice != null && rawDisPrice.isNotEmpty) ? double.tryParse(rawDisPrice) : null,
      itemImage: json['item_image']?.toString(),
      itemCategory: json['item_category']?.toString() ?? '',
      quantity: int.tryParse(rawQty) ?? 1,
    );
  }
}
