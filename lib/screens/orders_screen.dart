import 'package:flutter/material.dart';
import '../models/order.dart';
import '../services/api_service.dart';
import '../services/session_manager.dart';
import 'order_detail_screen.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<Order> _orders = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _isLoading = true;
    });

    final info = SessionManager.getCustomerInfo();
    if (info != null) {
      final orders = await ApiService.getCustomerOrders(info.id);
      // Sort orders by date descending (latest first)
      orders.sort((a, b) => b.inquiryDate.compareTo(a.inquiryDate));
      if (mounted) {
        setState(() {
          _orders = orders;
          _isLoading = false;
        });
      }
    } else {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Text(
          'My Orders',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadOrders,
              color: primaryColor,
              child: _orders.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: _orders.length,
                      itemBuilder: (context, index) {
                        return _buildOrderCard(context, _orders[index]);
                      },
                    ),
            ),
    );
  }

  Widget _buildEmptyState({String message = 'You have not placed any orders yet.'}) {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.assignment_turned_in_outlined,
                size: 80,
                color: Colors.grey[300],
              ),
              const SizedBox(height: 16),
              Text(
                'No Orders Found',
                style: TextStyle(color: Colors.grey[600], fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[400]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOrderCard(BuildContext context, Order order) {
    final primaryColor = const Color(0xFF2E7D32);
    final count = order.totalItems;
    final total = order.totalPrice;
    
    // Determine status dynamically
    final String status = order.status;
    final statusLower = status.toLowerCase();
    Color statusBg = Colors.orange[50]!;
    Color statusText = Colors.orange[800]!;

    if (statusLower.contains('process') || statusLower == 'processing') {
      statusBg = Colors.blue[50]!;
      statusText = Colors.blue[800]!;
    } else if (statusLower.contains('deliver') || statusLower == 'delivered' || statusLower.contains('complete')) {
      statusBg = Colors.green[50]!;
      statusText = Colors.green[800]!;
    } else if (statusLower.contains('cancel') || statusLower == 'cancelled') {
      statusBg = Colors.red[50]!;
      statusText = Colors.red[800]!;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.01),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row (Order ID and Status)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '#${order.id}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(
                      color: statusText,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Date
            Text(
              order.inquiryDate,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[500],
              ),
            ),
            const SizedBox(height: 16),

            // Divider
            const Divider(),
            const SizedBox(height: 12),

            // Details and navigation
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$count ${count == 1 ? 'item' : 'items'}',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Total: ₹${total.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => OrderDetailScreen(order: order),
                      ),
                    );
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: primaryColor,
                    padding: EdgeInsets.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Row(
                    children: [
                      const Text(
                        'View Details',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 4),
                      Icon(Icons.chevron_right, size: 18, color: primaryColor),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
