import 'package:flutter/material.dart';
import 'config.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/main_navigation_screen.dart';
import 'screens/help_support_screen.dart';
import 'services/session_manager.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SessionManager.init();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF2E7D32);

    return MaterialApp(
      title: companyName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: primaryColor,
        colorScheme: ColorScheme.fromSeed(
          seedColor: primaryColor,
          primary: primaryColor,
        ),
        scaffoldBackgroundColor: Colors.white,
        fontFamily: 'Roboto', // Material 3 standard sans-serif
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const AuthWrapper(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/home': (context) => const MainNavigationScreen(),
        '/help-support': (context) => const HelpSupportScreen(),
      },
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    // Artificial delay to make sure UI loaded
    await Future.delayed(const Duration(milliseconds: 800));

    final token = SessionManager.getToken();

    if (token == null || token.isEmpty) {
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
      return;
    }

    // Call verify token API
    final response = await ApiService.verifyToken(token);

    if (!mounted) return;

    if (response['res_code'] == '200') {
      final rawCustomerInfo = response['customer_info'];
      if (rawCustomerInfo != null) {
        final info = CustomerInfo.fromJson(rawCustomerInfo as Map<String, dynamic>);
        await SessionManager.saveCustomerInfo(info);
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/home');
        }
        return;
      }
    }

    // If verification failed, clear session and go to login
    await SessionManager.clearSession();
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        children: [
          // Radial Dark Premium Background
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                colors: [Color(0xFF222222), Color(0xFF0F0F0F)],
                center: Alignment.center,
                radius: 1.2,
              ),
            ),
          ),

          // Bottom Golden Wave Decoration
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            height: 140,
            child: CustomPaint(
              painter: GoldenWavePainter(),
            ),
          ),

          // Content Layer
          SafeArea(
            child: Align(
              alignment: Alignment.center,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Centered Logo
                    Image.asset(
                      appLogo,
                      height: 180,
                      width: 180,
                      fit: BoxFit.contain,
                    ),
                    const SizedBox(height: 24),

                    // Brand Typography
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Text(
                          companyName,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: 2,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),

                    // CHENNAI Line
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 24,
                          height: 1,
                          color: const Color(0xFFD4AF37).withOpacity(0.5),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          location,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.white70,
                            letterSpacing: 3,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          width: 24,
                          height: 1,
                          color: const Color(0xFFD4AF37).withOpacity(0.5),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // MOBILE & ACCESSORIES
                    const Text(
                      type,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFD4AF37),
                        letterSpacing: 3.5,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Spaced Outline Icons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.shopping_bag_outlined, color: Color(0xFFB8860B), size: 22),
                        SizedBox(width: 18),
                        Icon(Icons.shopping_cart_outlined, color: Color(0xFFB8860B), size: 22),
                        SizedBox(width: 18),
                        Icon(Icons.local_shipping_outlined, color: Color(0xFFB8860B), size: 22),
                        SizedBox(width: 18),
                        Icon(Icons.phone_android_outlined, color: Color(0xFFB8860B), size: 22),
                        SizedBox(width: 18),
                        Icon(Icons.headset_outlined, color: Color(0xFFB8860B), size: 22),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Tagline section
                    Container(
                      width: size.width * 0.65,
                      height: 0.5,
                      color: const Color(0xFFD4AF37).withOpacity(0.3),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Your Digital Catalog Store',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: size.width * 0.65,
                      height: 0.5,
                      color: const Color(0xFFD4AF37).withOpacity(0.3),
                    ),
                    const SizedBox(height: 48),

                    // Golden Progress indicator
                    const SizedBox(
                      width: 32,
                      height: 32,
                      child: CircularProgressIndicator(
                        color: Color(0xFFD4AF37),
                        strokeWidth: 2.5,
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class GoldenWavePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Left sweeping curve
    final paint1 = Paint()
      ..shader = LinearGradient(
        colors: [
          const Color(0xFFD4AF37).withOpacity(0.15),
          const Color(0xFF8C6200).withOpacity(0.3),
          Colors.transparent,
        ],
        begin: Alignment.bottomLeft,
        end: Alignment.topRight,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..style = PaintingStyle.fill;

    final path1 = Path()
      ..moveTo(0, size.height)
      ..lineTo(0, size.height - 80)
      ..quadraticBezierTo(size.width * 0.3, size.height - 40, size.width * 0.8, size.height)
      ..close();

    canvas.drawPath(path1, paint1);

    // Glowing main sweep golden wave
    final paint2 = Paint()
      ..shader = const LinearGradient(
        colors: [
          Color(0xFF8C6200),
          Color(0xFFD4AF37),
          Color(0xFFF3E5AB),
          Color(0xFF8C6200),
        ],
        begin: Alignment.bottomLeft,
        end: Alignment.topRight,
      ).createShader(Rect.fromLTWH(0, size.height - 50, size.width, 50))
      ..style = PaintingStyle.fill;

    final path2 = Path()
      ..moveTo(0, size.height)
      ..quadraticBezierTo(size.width * 0.35, size.height - 35, size.width, size.height - 12)
      ..lineTo(size.width, size.height)
      ..close();

    canvas.drawPath(path2, paint2);

    // Gold highlight stroke
    final strokePaint = Paint()
      ..shader = const LinearGradient(
        colors: [
          Color(0xFFF3E5AB),
          Color(0xFFD4AF37),
          Color(0xFF8C6200),
        ],
      ).createShader(Rect.fromLTWH(0, size.height - 50, size.width, 50))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final strokePath = Path()
      ..moveTo(0, size.height - 3)
      ..quadraticBezierTo(size.width * 0.35, size.height - 38, size.width, size.height - 15);

    canvas.drawPath(strokePath, strokePaint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
