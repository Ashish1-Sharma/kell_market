import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/category.dart';
import '../models/order.dart';
import 'session_manager.dart';

class ApiService {
  static const String baseUrl = 'https://api.$baseUrl1/CatalogMakerPro';
  static const String imageBaseUrl = 'https://api.$baseUrl1/CatalogMakerPro/';
  static const String defaultAdminId = '10665';

  // 1. Verify Token
  // GET https://catalogmakerpro.in/server/CatalogMakerPro/customer_verify_token.php?token=TOKEN
  static Future<Map<String, dynamic>> verifyToken(String token) async {
    try {
      final uri = Uri.parse('$baseUrl/customer_verify_token.php').replace(
        queryParameters: {'token': token},
      );
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      }
      return {'res_code': '500', 'message': 'Server error: ${response.statusCode}'};
    } catch (e) {
      return {'res_code': '500', 'message': 'Network error: $e'};
    }
  }

  // 2. Login
  // GET https://catalogmakerpro.in/server/CatalogMakerPro/customer_login.php?email=EMAIL&phone=PHONE
  static Future<Map<String, dynamic>> login(String email, String phone) async {
    try {
      final uri = Uri.parse('$baseUrl/customer_login.php').replace(
        queryParameters: {
          'email': email,
          'phone': phone,
        },
      );
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      }
      return {'res_code': '500', 'message': 'Server error: ${response.statusCode}'};
    } catch (e) {
      return {'res_code': '500', 'message': 'Network error: $e'};
    }
  }

  // 3. Register
  // GET https://catalogmakerpro.in/server/CatalogMakerPro/customer_register.php?email=&phone=&shop_name=&owner_name=&shop_address=&city=&pincode=&admin_id=8129
  static Future<Map<String, dynamic>> register({
    required String email,
    required String phone,
    required String shopName,
    required String ownerName,
    required String shopAddress,
    required String city,
    required String pincode,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/customer_register.php').replace(
        queryParameters: {
          'email': email,
          'phone': phone,
          'shop_name': shopName,
          'owner_name': ownerName,
          'shop_address': shopAddress,
          'city': city,
          'pincode': pincode,
          'admin_id': defaultAdminId,
        },
      );
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      }
      return {'res_code': '500', 'message': 'Server error: ${response.statusCode}'};
    } catch (e) {
      return {'res_code': '500', 'message': 'Network error: $e'};
    }
  }

  // 4. Get Categories & Products
  // GET https://catalogmakerpro.in/server/CatalogMakerPro/getCategoriesAndproducts.php?user_id=8129
  static Future<List<Category>> getCategoriesAndProducts({String adminId = defaultAdminId}) async {
    try {
      final uri = Uri.parse('$baseUrl/getCategoriesAndproducts.php').replace(
        queryParameters: {'user_id': adminId},
      );
      print(uri);
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        if (data['res_code'] == '200' && data['item_list'] != null) {
          final list = data['item_list'] as List;
          final categories = list.map((c) => Category.fromJson(c)).toList();
          categories.sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
          return categories;
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // 5. Send Enquiry
  // POST https://catalogmakerpro.in/server/CatalogMakerPro/cart/customerInquiry_new.php
  // Body (JSON): { "admin_id": "8129", "customer_id": "5", "product_list": [ { "id": "95706", "quantity": 1 } ] }
  static Future<Map<String, dynamic>> sendEnquiry({
    required String customerId,
    required List<Map<String, dynamic>> productList,
    String adminId = defaultAdminId,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/cart/customerInquiry_martin.php');
      final body = {
        'admin_id': adminId,
        'customer_id': customerId,
        'product_list': productList,
      };
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );
      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      }
      return {'res_code': '500', 'message': 'Server error: ${response.statusCode}'};
    } catch (e) {
      return {'res_code': '500', 'message': 'Network error: $e'};
    }
  }

  // 6. Get Customer Orders
  // POST https://catalogmakerpro.in/server/CatalogMakerPro/cart/getCustomerOrders.php
  // Body: customer_id (POST param)
  static Future<List<Order>> getCustomerOrders(String customerId) async {
    try {
      final url = Uri.parse('$baseUrl/cart/customerOrders_byId.php');
      // POST format: application/x-www-form-urlencoded
      final response = await http.post(

        url,
        body: {'customer_id': customerId},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        print(data);
        if (data['res_code'] == '200' && data['data'] != null) {
          final list = data['data'] as List;
          return list.map((o) => Order.fromJson(o)).toList();
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
