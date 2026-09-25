import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config.dart';
import '../services/session_manager.dart';

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  CustomerInfo? _customerInfo;

  @override
  void initState() {
    super.initState();
    _customerInfo = SessionManager.getCustomerInfo();
  }

  Future<void> _launchURL(String urlString) async {
    final Uri uri = Uri.parse(urlString);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not open: $urlString')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: Colors.black, size: 28),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            }
          },
        ),
        title: const Text(
          'Help & Support',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Contact Us Section Heading
            const Text(
              'Contact Us',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 24),

            // Ashar Infotech Row
            _buildContactRow(
              icon: Icons.business,
              iconColor: Colors.blue,
              titleWidget:  Text(
                companyName,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // WhatsApp Row
            _buildContactRow(
              icon: Icons.chat,
              iconColor: const Color(0xFF25D366),
              titleWidget: const Text(
                'WhatsApp\nSupport',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.blue,
                  height: 1.2,
                  fontWeight: FontWeight.w500,
                ),
              ),
              buttonText: 'Message Us',
              onButtonTap: () => _launchURL('https://wa.me/$whatsapp'),
            ),
            const SizedBox(height: 16),

            // Phone Row
            _buildContactRow(
              icon: Icons.phone,
              iconColor: Colors.blue,
              titleWidget: const Text(
                '+91 9342728339',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.blue,
                  fontWeight: FontWeight.w500,
                ),
              ),
              buttonText: 'Call Us',
              onButtonTap: () => _launchURL('tel:$support'),
            ),
            const SizedBox(height: 16),

            // Email Row
            _buildContactRow(
              icon: Icons.email,
              iconColor: Colors.blue,
              titleWidget: const Text(
                '$email',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.blue,
                  height: 1.2,
                  fontWeight: FontWeight.w500,
                ),
              ),
              buttonText: 'E-Mail Us',
              onButtonTap: () => _launchURL('mailto:$email'),
            ),
            const SizedBox(height: 36),

            // Divider
            const Divider(height: 1, color: Color(0xFFE0E0E0)),
            const SizedBox(height: 24),

            // Customer Details Header
            // const Padding(
            //   padding: EdgeInsets.symmetric(horizontal: 4.0),
            //   child: Text(
            //     'Your Profile Info',
            //     style: TextStyle(
            //       fontSize: 18,
            //       fontWeight: FontWeight.bold,
            //       color: Colors.black87,
            //     ),
            //   ),
            // ),
            // const SizedBox(height: 16),

            // Customer Details Card (Matching Profile Screen style)
            // _buildCustomerDetailsCard(context, primaryColor),
          ],
        ),
      ),
    );
  }

  Widget _buildContactRow({
    required IconData icon,
    required Color iconColor,
    required Widget titleWidget,
    String? buttonText,
    VoidCallback? onButtonTap,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(icon, size: 28, color: iconColor),
        const SizedBox(width: 16),
        Expanded(
          child: titleWidget,
        ),
        if (buttonText != null && onButtonTap != null) ...[
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: onButtonTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF9A00FF), // Slate-grey button background
              foregroundColor: Colors.white, // Dark text
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            child: Text(
              buttonText,
              style: const TextStyle(
                fontStyle: FontStyle.italic,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildCustomerDetailsCard(BuildContext context, Color primaryColor) {
    if (_customerInfo == null) return const SizedBox.shrink();
    final info = _customerInfo!;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.person_pin_outlined, color: primaryColor, size: 20),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Customer Details',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            child: Column(
              children: [
                _buildDetailRow(Icons.email_outlined, 'Email', info.email, primaryColor),
                const Divider(height: 1),
                _buildDetailRow(Icons.phone_outlined, 'Phone', info.phone, primaryColor),
                const Divider(height: 1),
                _buildDetailRow(Icons.storefront_outlined, 'Shop Name', info.shopName, primaryColor),
                const Divider(height: 1),
                _buildDetailRow(Icons.person_outline, 'Owner Name', info.ownerName, primaryColor),
                const Divider(height: 1),
                _buildDetailRow(Icons.location_on_outlined, 'Shop Address', '${info.shopAddress}, ${info.city}, ${info.pincode}', primaryColor),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value, Color primaryColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        children: [
          Icon(icon, size: 18, color: primaryColor),
          const SizedBox(width: 12),
          Text(
            label,
            style: const TextStyle(
              color: Colors.black87,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const Spacer(),
          Expanded(
            flex: 2,
            child: Text(
              value.isNotEmpty ? value : 'N/A',
              textAlign: TextAlign.end,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
