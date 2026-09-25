import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CustomerInfo {
  final String id;
  final String shopName;
  final String ownerName;
  final String email;
  final String phone;
  final String shopAddress;
  final String city;
  final String pincode;
  final String adminId;

  CustomerInfo({
    required this.id,
    required this.shopName,
    required this.ownerName,
    required this.email,
    required this.phone,
    required this.shopAddress,
    required this.city,
    required this.pincode,
    required this.adminId,
  });

  factory CustomerInfo.fromJson(Map<String, dynamic> json) {
    return CustomerInfo(
      id: json['id']?.toString() ?? '',
      shopName: json['shop_name']?.toString() ?? '',
      ownerName: json['owner_name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      shopAddress: json['shop_address']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      pincode: json['pincode']?.toString() ?? '',
      adminId: json['admin_id']?.toString() ?? '10665',
    );
  }

  Map<String, String> toJson() {
    return {
      'id': id,
      'shop_name': shopName,
      'owner_name': ownerName,
      'email': email,
      'phone': phone,
      'shop_address': shopAddress,
      'city': city,
      'pincode': pincode,
      'admin_id': adminId,
    };
  }
}

class SessionManager {
  static const String _keyToken = 'customer_token';
  static const String _keyCustomerInfo = 'customer_info';

  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static Future<bool> saveToken(String token) async {
    if (_prefs == null) await init();
    return await _prefs!.setString(_keyToken, token);
  }

  static String? getToken() {
    return _prefs?.getString(_keyToken);
  }

  static Future<bool> saveCustomerInfo(CustomerInfo info) async {
    if (_prefs == null) await init();
    final jsonStr = json.encode(info.toJson());
    return await _prefs!.setString(_keyCustomerInfo, jsonStr);
  }

  static CustomerInfo? getCustomerInfo() {
    final jsonStr = _prefs?.getString(_keyCustomerInfo);
    if (jsonStr == null) return null;
    try {
      final map = json.decode(jsonStr) as Map<String, dynamic>;
      return CustomerInfo.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearSession() async {
    if (_prefs == null) await init();
    await _prefs!.remove(_keyToken);
    await _prefs!.remove(_keyCustomerInfo);
  }
}
