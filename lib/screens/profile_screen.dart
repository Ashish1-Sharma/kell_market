import 'package:flutter/material.dart';
import '../config.dart';
import '../services/session_manager.dart';
import 'package:url_launcher/url_launcher.dart';


class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  CustomerInfo? _customerInfo;

  @override
  void initState() {
    super.initState();
    _customerInfo = SessionManager.getCustomerInfo();
  }

  Future<void> _handleLogout() async {
    // Show logout confirmation dialog
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Logout'),
          content: const Text('Are you sure you want to logout?'),
          actions: <Widget>[
            TextButton(
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
              onPressed: () => Navigator.of(context).pop(false),
            ),
            TextButton(
              child: const Text('Logout', style: TextStyle(color: Colors.red)),
              onPressed: () => Navigator.of(context).pop(true),
            ),
          ],
        );
      },
    );

    if (confirm == true) {
      await SessionManager.clearSession();
      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
      }
    }
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
    final ownerName = _customerInfo?.ownerName ?? 'Customer';
    final phone = _customerInfo?.phone ?? 'N/A';
    final shopName = _customerInfo?.shopName ?? 'N/A';
    final avatarLetter = ownerName.isNotEmpty ? ownerName[0].toUpperCase() : 'C';

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
          'My Profile',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        centerTitle: true,
        // actions: [
        //   IconButton(
        //     icon: const Icon(Icons.settings_outlined, color: Colors.black),
        //     onPressed: () {
        //       ScaffoldMessenger.of(context).showSnackBar(
        //         const SnackBar(content: Text('Settings coming soon!')),
        //       );
        //     },
        //   ),
        // ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 16.0),
        child: Column(
          children: [
            // Profile Header Card with soft green gradient
            // _buildProfileHeaderCard(context, ownerName, phone, shopName, avatarLetter, primaryColor),
            //
            // const SizedBox(height: 16),

            // Customer Details Card
            _buildCustomerDetailsCard(context, primaryColor),

            const SizedBox(height: 16),

            // Options Card (Contact Seller, Help & Support)
            _buildOptionsCard(context, primaryColor),

            const SizedBox(height: 16),

            // Logout Card
            _buildLogoutCard(context),

            const SizedBox(height: 32),

            // Version Info
            const Text(
              'Version 1.0.0',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 12),

            // Developed for Martin Enterprises
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Developed By ',
                  style: TextStyle(
                    color: Colors.grey[700],
                    fontSize: 14,
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onTap: () => _launchURL('https://asharinfotech.com/'),
                      child: Text(
                        'Ashar Infotech',
                        style: TextStyle(
                          color: primaryColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 6),

            // by Ashar Infotech
            // Row(
            //   mainAxisAlignment: MainAxisAlignment.center,
            //   children: [
            //     Text(
            //       'by ',
            //       style: TextStyle(
            //         color: Colors.grey[700],
            //         fontSize: 14,
            //       ),
            //     ),
            //     GestureDetector(
            //       onTap: () => _launchURL('https://asharinfotech.com/'),
            //       child: Text(
            //         'Ashar Infotech',
            //         style: TextStyle(
            //           color: primaryColor,
            //           fontWeight: FontWeight.bold,
            //           fontSize: 14,
            //         ),
            //       ),
            //     ),
            //   ],
            // ),
            const SizedBox(height: 16),

            // Divider with dot
            // Padding(
            //   padding: const EdgeInsets.symmetric(horizontal: 96.0),
            //   child: Row(
            //     children: [
            //       Expanded(
            //         child: Divider(
            //           color: Colors.grey[300],
            //           thickness: 1,
            //         ),
            //       ),
            //       Container(
            //         margin: const EdgeInsets.symmetric(horizontal: 8),
            //         width: 5,
            //         height: 5,
            //         decoration: BoxDecoration(
            //           color: primaryColor,
            //           shape: BoxShape.circle,
            //         ),
            //       ),
            //       Expanded(
            //         child: Divider(
            //           color: Colors.grey[300],
            //           thickness: 1,
            //         ),
            //       ),
            //     ],
            //   ),
            // ),
            // const SizedBox(height: 16),
            //
            // // Developed by Ashish Sharma
            // GestureDetector(
            //   onTap: () => _launchURL('https://www.linkedin.com/in/ashish-sharma-8a9675224/'),
            //   child: Row(
            //     mainAxisAlignment: MainAxisAlignment.center,
            //     mainAxisSize: MainAxisSize.min,
            //     children: [
            //       Text(
            //         'Developed by ',
            //         style: TextStyle(
            //           color: Colors.grey[700],
            //           fontSize: 14,
            //         ),
            //       ),
            //       const Text(
            //         'Ashish Sharma',
            //         style: TextStyle(
            //           color: Colors.blue,
            //           fontWeight: FontWeight.w500,
            //           fontSize: 14,
            //         ),
            //       ),
            //       const SizedBox(width: 4),
            //       const Icon(
            //         Icons.open_in_new,
            //         size: 14,
            //         color: Colors.blue,
            //       ),
            //     ],
            //   ),
            // ),
            // const SizedBox(height: 12),
            //
            //
            // const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeaderCard(
    BuildContext context,
    String ownerName,
    String phone,
    String shopName,
    String avatarLetter,
    Color primaryColor,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[100]!),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white,
            Color(0xFFF1F8E9), // Soft green tint in bottom right
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          // Circle Avatar with Edit Pencil Icon
          Stack(
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.grey[200]!, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Text(
                  avatarLetter,
                  style: TextStyle(
                    fontSize: 44,
                    fontWeight: FontWeight.bold,
                    color: primaryColor,
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: primaryColor,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: const Icon(
                    Icons.edit,
                    size: 12,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Name
          Text(
            ownerName,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 6),

          // Phone Row
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.phone, size: 16, color: primaryColor),
              const SizedBox(width: 8),
              Text(
                phone,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Shop Name Row
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.storefront, size: 16, color: primaryColor),
              const SizedBox(width: 8),
              Text(
                shopName,
                style: TextStyle(
                  fontSize: 14,
                  color: primaryColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerDetailsCard(BuildContext context, Color primaryColor) {
    if (_customerInfo == null) return const SizedBox.shrink();
    final info = _customerInfo!;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
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
          // Header Row
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

          // Details Rows
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

  Widget _buildOptionsCard(BuildContext context, Color primaryColor) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
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
      child: _buildMenuRow(
        icon: Icons.help_outline,
        title: 'Help & Support',
        onTap: () => Navigator.pushNamed(context, '/help-support'),
        primaryColor: primaryColor,
      ),
    );
  }

  Widget _buildLogoutCard(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
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
      child: _buildMenuRow(
        icon: Icons.logout,
        title: 'Logout',
        onTap: _handleLogout,
        iconColor: Colors.red[700],
        iconBgColor: Colors.red[50],
        titleColor: Colors.red[700],
        primaryColor: Colors.red[700]!,
      ),
    );
  }

  Widget _buildMenuRow({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    required Color primaryColor,
    Color? iconColor,
    Color? iconBgColor,
    Color? titleColor,
  }) {
    final finalIconColor = iconColor ?? primaryColor;
    final finalIconBgColor = iconBgColor ?? Colors.green[50];
    final finalTitleColor = titleColor ?? Colors.black87;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: finalIconBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: finalIconColor, size: 20),
            ),
            const SizedBox(width: 16),
            Text(
              title,
              style: TextStyle(
                color: finalTitleColor,
                fontWeight: FontWeight.w500,
                fontSize: 15,
              ),
            ),
            const Spacer(),
            const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
          ],
        ),
      ),
    );
  }
}
