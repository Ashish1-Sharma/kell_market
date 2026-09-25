import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _shopNameController = TextEditingController();
  final _ownerNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _pincodeController = TextEditingController();

  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _shopNameController.dispose();
    _ownerNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final shopName = _shopNameController.text.trim();
    final ownerName = _ownerNameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final address = _addressController.text.trim();
    final city = _cityController.text.trim();
    final pincode = _pincodeController.text.trim();

    final response = await ApiService.register(
      email: email,
      phone: phone,
      shopName: shopName,
      ownerName: ownerName,
      shopAddress: address,
      city: city,
      pincode: pincode,
    );

    if (!mounted) return;

    if (response['res_code'] == '200') {
      setState(() {
        _isLoading = false;
      });
      final successMsg = response['message']?.toString() ?? 
          'Registration completed successfully. Please wait for the administrator to approve your account before you can log in.';
      _showSuccessDialog(successMsg);
    } else if (response['res_code'] == '409') {
      setState(() {
        _errorMessage = 'Already registered, please login.';
        _isLoading = false;
      });
    } else {
      setState(() {
        _errorMessage = response['message']?.toString() ?? 'An error occurred. Please try again.';
        _isLoading = false;
      });
    }
  }

  void _showSuccessDialog(String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        final primaryColor = const Color(0xFF2E7D32);
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
          ),
          elevation: 8,
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 28.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Glowing Checkmark Circle Icon
                Container(
                  width: 90,
                  height: 90,
                  decoration: const BoxDecoration(
                    color: Color(0xFFE8F5E9),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: primaryColor,
                          width: 4,
                        ),
                      ),
                      child: Icon(
                        Icons.check,
                        color: primaryColor,
                        size: 36,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                
                // Title
                Text(
                  'Registered Successfully!',
                  style: TextStyle(
                    color: primaryColor,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                
                // Description (Response Message)
                Text(
                  message,
                  style: const TextStyle(
                    color: Colors.black87,
                    fontSize: 14,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),
                
                // OK Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'OK',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Create Account',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: primaryColor,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Register your shop to start exploring the catalog.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 24),

                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red[200]!),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: TextStyle(color: Colors.red[800], fontSize: 13),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Shop Name
                TextFormField(
                  controller: _shopNameController,
                  decoration: _inputDecoration('Shop Name', Icons.store_outlined),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Enter shop name' : null,
                ),
                const SizedBox(height: 16),

                // Owner Name
                TextFormField(
                  controller: _ownerNameController,
                  decoration: _inputDecoration('Owner Name', Icons.person_outline),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Enter owner name' : null,
                ),
                const SizedBox(height: 16),

                // Email
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: _inputDecoration('Email Address', Icons.email_outlined),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return 'Enter email';
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value.trim())) {
                      return 'Enter a valid email address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Phone
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: _inputDecoration('Phone Number', Icons.phone_outlined),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Enter phone number' : null,
                ),
                const SizedBox(height: 16),

                // Shop Address
                TextFormField(
                  controller: _addressController,
                  decoration: _inputDecoration('Shop Address', Icons.location_on_outlined),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Enter shop address' : null,
                ),
                const SizedBox(height: 16),

                // City
                TextFormField(
                  controller: _cityController,
                  decoration: _inputDecoration('City', Icons.location_city_outlined),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Enter city' : null,
                ),
                const SizedBox(height: 16),

                // Pincode
                TextFormField(
                  controller: _pincodeController,
                  keyboardType: TextInputType.number,
                  decoration: _inputDecoration('Pincode', Icons.pin_outlined),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return 'Enter pincode';
                    if (value.trim().length < 6) return 'Pincode must be at least 6 digits';
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                // Register Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Register',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    final primaryColor = const Color(0xFF2E7D32);
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: primaryColor, width: 2),
      ),
    );
  }
}
